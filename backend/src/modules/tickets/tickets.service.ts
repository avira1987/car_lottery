import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { ChancesService } from '../chances/chances.service';
import { BuyTicketsDto } from './dto/buy-tickets.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
    private chancesService: ChancesService,
  ) {}

  async calculateTicketPrice(basePrice: number, ticketNumber: number): Promise<{ price: number; discount: number }> {
    let discount = 0;
    let price = basePrice;

    if (ticketNumber === 1) {
      discount = 0;
    } else if (ticketNumber === 2) {
      discount = 20; // 20% discount
      price = basePrice * 0.8;
    } else if (ticketNumber === 3) {
      discount = 30; // 30% discount
      price = basePrice * 0.7;
    } else {
      discount = 40; // 40% discount for 4th and beyond
      price = basePrice * 0.6;
    }

    return { price, discount };
  }

  async buyTickets(userId: string, buyTicketsDto: BuyTicketsDto) {
    const { count, lotteryId } = buyTicketsDto;

    if (count <= 0) {
      throw new BadRequestException('Count must be greater than 0');
    }

    // Get base ticket price from admin settings
    const settings = await this.prisma.adminSettings.findUnique({
      where: { key: 'ticket_base_price' },
    });

    const basePrice = settings ? (settings.value as any).price || 100000 : 100000;

    // Calculate total price with tiered discounts
    let totalPrice = 0;
    const tickets = [];

    for (let i = 1; i <= count; i++) {
      const { price, discount } = await this.calculateTicketPrice(basePrice, i);
      totalPrice += price;
      tickets.push({ price, discount });
    }

    // Check wallet balance
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet || wallet.balance.lt(totalPrice)) {
      throw new BadRequestException('Insufficient balance');
    }

    // Create tickets and deduct from wallet
    const createdTickets = await this.prisma.$transaction(async (tx) => {
      // Deduct from wallet
      await tx.wallet.update({
        where: { userId },
        data: {
          balance: {
            decrement: new Decimal(totalPrice),
          },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId,
          type: 'TICKET_PURCHASE',
          amount: new Decimal(totalPrice),
          status: 'COMPLETED',
          description: `Purchase of ${count} ticket(s)`,
          metadata: { count, lotteryId },
        },
      });

      // Create tickets
      const ticketPromises = tickets.map((ticket, index) =>
        tx.ticket.create({
          data: {
            userId,
            lotteryId: lotteryId || null,
            price: new Decimal(basePrice),
            discount: new Decimal(ticket.discount),
            finalPrice: new Decimal(ticket.price),
            chanceGranted: true,
            cashbackGiven: false,
          },
        }),
      );

      const createdTickets = await Promise.all(ticketPromises);

      // Grant chances (1 chance per ticket)
      for (const ticket of createdTickets) {
        await this.chancesService.grantChance(userId, 'TICKET', ticket.id);
      }

      return createdTickets;
    });

    return {
      tickets: createdTickets,
      totalPrice,
      chancesGranted: count,
    };
  }

  async getUserTickets(userId: string, lotteryId?: string) {
    return this.prisma.ticket.findMany({
      where: {
        userId,
        ...(lotteryId && { lotteryId }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        lottery: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });
  }

  async processCashbackForLottery(lotteryId: string) {
    // Get all entries for this lottery
    const entries = await this.prisma.lotteryEntry.findMany({
      where: { lotteryId },
      include: { prize: true },
    });

    // Process cashback for non-winners (20% of ticket price)
    for (const entry of entries) {
      if (!entry.prize || entry.rank === null) {
        // No prize = 20% cashback
        const tickets = await this.prisma.ticket.findMany({
          where: {
            userId: entry.userId,
            lotteryId,
            cashbackGiven: false,
          },
        });

        for (const ticket of tickets) {
          const cashbackAmount = ticket.finalPrice.toNumber() * 0.2;
          await this.walletService.addCashback(
            entry.userId,
            cashbackAmount,
            'LOTTERY',
            lotteryId,
          );

          await this.prisma.ticket.update({
            where: { id: ticket.id },
            data: { cashbackGiven: true },
          });
        }
      }
    }
  }
}
