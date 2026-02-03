import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ChancesService } from '../chances/chances.service';
import { WalletService } from '../wallet/wallet.service';
import { TicketsService } from '../tickets/tickets.service';
import { CreateLotteryDto } from './dto/create-lottery.dto';
import { EnterLotteryDto } from './dto/enter-lottery.dto';
import { Decimal } from '@prisma/client/runtime/library';
import * as crypto from 'crypto';

@Injectable()
export class LotteryService {
  constructor(
    private prisma: PrismaService,
    private chancesService: ChancesService,
    private walletService: WalletService,
    private ticketsService: TicketsService,
  ) {}

  async createLottery(createLotteryDto: CreateLotteryDto) {
    const { title, description, startDate, endDate, drawDate, maxEntries } = createLotteryDto;

    const lottery = await this.prisma.lottery.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        drawDate: drawDate ? new Date(drawDate) : null,
        maxEntries,
        status: 'UPCOMING',
      },
    });

    // Create default prizes based on requirements
    await this.createDefaultPrizes(lottery.id);

    return lottery;
  }

  async createDefaultPrizes(lotteryId: string) {
    const prizes = [
      // Ranks 1-4: Cash prizes
      { type: 'CASH', name: 'جایزه نقدی رتبه 1', rankFrom: 1, rankTo: 1, value: 10000000 },
      { type: 'CASH', name: 'جایزه نقدی رتبه 2', rankFrom: 2, rankTo: 2, value: 5000000 },
      { type: 'CASH', name: 'جایزه نقدی رتبه 3', rankFrom: 3, rankTo: 3, value: 3000000 },
      { type: 'CASH', name: 'جایزه نقدی رتبه 4', rankFrom: 4, rankTo: 4, value: 2000000 },
      // Rank 5: Car
      { type: 'CAR', name: 'خودرو', rankFrom: 5, rankTo: 5, value: null },
      // Ranks 6-10: 9 grams gold
      { type: 'GOLD', name: '9 گرم طلای آب‌شده', rankFrom: 6, rankTo: 10, value: null },
      // Ranks 11-100: 2 grams gold
      { type: 'GOLD', name: '2 گرم طلای آب‌شده', rankFrom: 11, rankTo: 100, value: null },
      // Ranks 101-1000: 2 wheel chances
      { type: 'CHANCE', name: '2 شانس گردونه', rankFrom: 101, rankTo: 1000, value: null },
    ];

    for (const prize of prizes) {
      await this.prisma.prize.create({
        data: {
          lotteryId,
          type: prize.type,
          name: prize.name,
          rankFrom: prize.rankFrom,
          rankTo: prize.rankTo,
          value: prize.value ? new Decimal(prize.value) : null,
        },
      });
    }
  }

  async enterLottery(userId: string, enterLotteryDto: EnterLotteryDto) {
    const { lotteryId } = enterLotteryDto;

    const lottery = await this.prisma.lottery.findUnique({
      where: { id: lotteryId },
    });

    if (!lottery) {
      throw new NotFoundException('Lottery not found');
    }

    if (lottery.status !== 'ACTIVE') {
      throw new BadRequestException('Lottery is not active');
    }

    // Check if already entered
    const existingEntry = await this.prisma.lotteryEntry.findUnique({
      where: {
        lotteryId_userId: {
          lotteryId,
          userId,
        },
      },
    });

    if (existingEntry) {
      throw new BadRequestException('Already entered this lottery');
    }

    // Check max entries
    if (lottery.maxEntries) {
      const currentEntries = await this.prisma.lotteryEntry.count({
        where: { lotteryId },
      });
      if (currentEntries >= lottery.maxEntries) {
        throw new BadRequestException('Lottery is full');
      }
    }

    // Use 5 chances
    await this.chancesService.useChances(userId, 5, 'LOTTERY');

    // Create entry
    const entry = await this.prisma.lotteryEntry.create({
      data: {
        lotteryId,
        userId,
        chancesUsed: 5,
      },
    });

    return entry;
  }

  async drawLottery(lotteryId: string) {
    const lottery = await this.prisma.lottery.findUnique({
      where: { id: lotteryId },
      include: {
        entries: true,
        prizes: true,
      },
    });

    if (!lottery) {
      throw new NotFoundException('Lottery not found');
    }

    if (lottery.status !== 'ACTIVE') {
      throw new BadRequestException('Lottery is not active');
    }

    // Update status to DRAWING
    await this.prisma.lottery.update({
      where: { id: lotteryId },
      data: { status: 'DRAWING' },
    });

    const entries = lottery.entries;
    if (entries.length === 0) {
      await this.prisma.lottery.update({
        where: { id: lotteryId },
        data: { status: 'COMPLETED' },
      });
      return { message: 'No entries to draw' };
    }

    // Secure RNG using crypto.randomInt
    const shuffled = this.shuffleArray([...entries]);

    // Assign ranks
    const rankedEntries = [];
    for (let i = 0; i < shuffled.length; i++) {
      const rank = i + 1;
      rankedEntries.push({
        entryId: shuffled[i].id,
        rank,
      });
    }

    // Update entries with ranks
    for (const ranked of rankedEntries) {
      await this.prisma.lotteryEntry.update({
        where: { id: ranked.entryId },
        data: { rank: ranked.rank },
      });
    }

    // Distribute prizes
    await this.distributePrizes(lotteryId, rankedEntries);

    // Process cashback for non-winners
    await this.ticketsService.processCashbackForLottery(lotteryId);

    // Update lottery status
    await this.prisma.lottery.update({
      where: { id: lotteryId },
      data: {
        status: 'COMPLETED',
        drawDate: new Date(),
      },
    });

    return {
      message: 'Lottery drawn successfully',
      totalEntries: entries.length,
      winners: rankedEntries.slice(0, 1000).length,
    };
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = crypto.randomInt(0, i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async distributePrizes(lotteryId: string, rankedEntries: { entryId: string; rank: number }[]) {
    const prizes = await this.prisma.prize.findMany({
      where: { lotteryId },
      orderBy: { rankFrom: 'asc' },
    });

    for (const prize of prizes) {
      const winners = rankedEntries.filter(
        (entry) => entry.rank >= prize.rankFrom! && entry.rank <= prize.rankTo!,
      );

      for (const winner of winners) {
        const entry = await this.prisma.lotteryEntry.findUnique({
          where: { id: winner.entryId },
        });

        if (!entry) continue;

        // Update entry with prize
        await this.prisma.lotteryEntry.update({
          where: { id: winner.entryId },
          data: { prizeId: prize.id },
        });

        // Distribute prize based on type
        if (prize.type === 'CASH' && prize.value) {
          await this.walletService.addCashback(entry.userId, prize.value.toNumber(), 'PRIZE', lotteryId);
        } else if (prize.type === 'CHANCE') {
          // Grant 2 chances for wheel
          await this.chancesService.grantChance(entry.userId, 'PRIZE', lotteryId);
          await this.chancesService.grantChance(entry.userId, 'PRIZE', lotteryId);
        }
        // CAR and GOLD prizes need manual handling by admin
      }
    }
  }

  async getLotteries(status?: string) {
    return this.prisma.lottery.findMany({
      where: status ? { status: status as any } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { entries: true },
        },
      },
    });
  }

  async getUserLotteries(userId: string) {
    const lotteries = await this.prisma.lottery.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { entries: true },
        },
        entries: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    return lotteries.map((lottery) => ({
      ...lottery,
      hasEntered: lottery.entries.length > 0,
      entries: undefined, // Remove entries from response
    }));
  }

  async checkUserEntry(userId: string, lotteryId: string) {
    const entry = await this.prisma.lotteryEntry.findUnique({
      where: {
        lotteryId_userId: {
          lotteryId,
          userId,
        },
      },
    });

    return {
      hasEntered: !!entry,
      entry: entry || null,
    };
  }

  async getLotteryDetails(lotteryId: string) {
    const lottery = await this.prisma.lottery.findUnique({
      where: { id: lotteryId },
      include: {
        prizes: {
          orderBy: { rankFrom: 'asc' },
        },
        entries: {
          take: 10,
          orderBy: { rank: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            prize: true,
          },
        },
        _count: {
          select: { entries: true },
        },
      },
    });

    if (!lottery) {
      throw new NotFoundException('Lottery not found');
    }

    return lottery;
  }
}
