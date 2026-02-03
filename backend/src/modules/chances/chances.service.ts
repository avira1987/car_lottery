import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ChancesService {
  constructor(private prisma: PrismaService) {}

  async grantChance(userId: string, source: string, sourceId?: string) {
    return this.prisma.chance.create({
      data: {
        userId,
        source,
        sourceId,
        used: false,
      },
    });
  }

  async getUserChances(userId: string) {
    const [total, used, available] = await Promise.all([
      this.prisma.chance.count({ where: { userId } }),
      this.prisma.chance.count({ where: { userId, used: true } }),
      this.prisma.chance.count({ where: { userId, used: false } }),
    ]);

    return {
      total,
      used,
      available,
    };
  }

  async useChances(userId: string, count: number, usedFor: string) {
    if (count <= 0) {
      throw new BadRequestException('Count must be greater than 0');
    }

    // Get available chances
    const availableChances = await this.prisma.chance.findMany({
      where: {
        userId,
        used: false,
      },
      take: count,
      orderBy: { createdAt: 'asc' },
    });

    if (availableChances.length < count) {
      throw new BadRequestException(`Insufficient chances. Available: ${availableChances.length}, Required: ${count}`);
    }

    // Mark chances as used
    const chanceIds = availableChances.map((c) => c.id);
    await this.prisma.chance.updateMany({
      where: {
        id: { in: chanceIds },
      },
      data: {
        used: true,
        usedFor,
        usedAt: new Date(),
      },
    });

    return {
      used: chanceIds.length,
      remaining: await this.prisma.chance.count({
        where: { userId, used: false },
      }),
    };
  }

  async getChanceHistory(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [chances, total] = await Promise.all([
      this.prisma.chance.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.chance.count({ where: { userId } }),
    ]);

    return {
      chances,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
