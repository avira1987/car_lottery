import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ChancesService } from '../chances/chances.service';
import { WalletService } from '../wallet/wallet.service';
import { Decimal } from '@prisma/client/runtime/library';
import * as crypto from 'crypto';

@Injectable()
export class WheelService {
  constructor(
    private prisma: PrismaService,
    private chancesService: ChancesService,
    private walletService: WalletService,
  ) {}

  async spinWheel(userId: string) {
    // Check if user has 2 chances
    const chances = await this.chancesService.getUserChances(userId);
    if (chances.available < 2) {
      throw new BadRequestException('Insufficient chances. Need 2 chances to spin the wheel.');
    }

    // Use 2 chances
    await this.chancesService.useChances(userId, 2, 'WHEEL');

    // Get active prizes
    const prizes = await this.prisma.wheelPrize.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    if (prizes.length === 0) {
      throw new BadRequestException('No prizes configured');
    }

    // Secure RNG - select prize based on probability
    const selectedPrize = this.selectPrizeByProbability(prizes);

    // Create spin record
    const spin = await this.prisma.wheelSpin.create({
      data: {
        userId,
        prizeId: selectedPrize.id,
        chancesUsed: 2,
        result: {
          prizeId: selectedPrize.id,
          prizeName: selectedPrize.name,
          prizeType: selectedPrize.type,
          prizeValue: selectedPrize.value.toString(),
        },
      },
      include: {
        prize: true,
      },
    });

    // Distribute prize
    await this.distributePrize(userId, selectedPrize);

    return {
      spin,
      prize: selectedPrize,
    };
  }

  private selectPrizeByProbability(prizes: any[]) {
    // Calculate cumulative probabilities
    const cumulative: number[] = [];
    let sum = 0;

    for (const prize of prizes) {
      sum += prize.probability.toNumber();
      cumulative.push(sum);
    }

    // Generate random number between 0 and 1
    const random = crypto.randomInt(0, 10000) / 10000;

    // Find which prize range the random number falls into
    for (let i = 0; i < cumulative.length; i++) {
      if (random <= cumulative[i]) {
        return prizes[i];
      }
    }

    // Fallback to last prize
    return prizes[prizes.length - 1];
  }

  async distributePrize(userId: string, prize: any) {
    switch (prize.type) {
      case 'CASH':
        await this.walletService.addCashback(userId, prize.value.toNumber(), 'WHEEL', prize.id);
        break;

      case 'CHANCE':
        // Grant chances
        const count = prize.value.toNumber();
        for (let i = 0; i < count; i++) {
          await this.chancesService.grantChance(userId, 'PRIZE', prize.id);
        }
        break;

      case 'TICKET':
        // Could create a ticket here
        break;

      case 'GOLD':
        // Gold prizes need manual handling
        break;
    }
  }

  async getWheelPrizes() {
    return this.prisma.wheelPrize.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async createWheelPrize(data: {
    name: string;
    type: string;
    value: number;
    probability: number;
    order: number;
  }) {
    return this.prisma.wheelPrize.create({
      data: {
        name: data.name,
        type: data.type as any,
        value: new Decimal(data.value),
        probability: new Decimal(data.probability),
        order: data.order,
        isActive: true,
      },
    });
  }

  async updateWheelPrize(id: string, data: Partial<{
    name: string;
    type: string;
    value: number;
    probability: number;
    order: number;
    isActive: boolean;
  }>) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.type) updateData.type = data.type;
    if (data.value !== undefined) updateData.value = new Decimal(data.value);
    if (data.probability !== undefined) updateData.probability = new Decimal(data.probability);
    if (data.order !== undefined) updateData.order = data.order;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return this.prisma.wheelPrize.update({
      where: { id },
      data: updateData,
    });
  }

  async getUserSpins(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [spins, total] = await Promise.all([
      this.prisma.wheelSpin.findMany({
        where: { userId },
        include: { prize: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.wheelSpin.count({ where: { userId } }),
    ]);

    return {
      spins,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
