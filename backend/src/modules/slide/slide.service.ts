import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ChancesService } from '../chances/chances.service';
import { WalletService } from '../wallet/wallet.service';
import { SlideGateway } from './slide.gateway';
import { PlaySlideDto } from './dto/play-slide.dto';
import { SetTargetDto } from './dto/set-target.dto';

@Injectable()
export class SlideService {
  constructor(
    private prisma: PrismaService,
    private chancesService: ChancesService,
    private walletService: WalletService,
    private slideGateway: SlideGateway,
  ) {}

  async setTargetNumber(setTargetDto: SetTargetDto) {
    const { targetNumber } = setTargetDto;

    if (targetNumber < 1 || targetNumber > 100) {
      throw new BadRequestException('Target number must be between 1 and 100');
    }

    // Create or update the current active game
    const activeGame = await this.prisma.slideGame.findFirst({
      where: {
        mode: 'AUTO',
        isPublic: true,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let result;
    if (activeGame && !activeGame.isWinner) {
      // Update existing game
      result = await this.prisma.slideGame.update({
        where: { id: activeGame.id },
        data: { targetNumber },
      });
    } else {
      // Create new game
      result = await this.prisma.slideGame.create({
        data: {
          mode: 'AUTO',
          targetNumber,
          isPublic: true,
        },
      });
    }

    // Broadcast new target via WebSocket
    this.slideGateway.broadcastNewTarget(targetNumber);

    return result;
  }

  async playSlide(userId: string, playSlideDto: PlaySlideDto) {
    const { userNumber, mode } = playSlideDto;

    if (userNumber < 1 || userNumber > 100) {
      throw new BadRequestException('User number must be between 1 and 100');
    }

    // Check if user has chance
    const chances = await this.chancesService.getUserChances(userId);
    if (chances.available < 1) {
      throw new BadRequestException('Insufficient chances. Need 1 chance to play.');
    }

    // Use 1 chance
    await this.chancesService.useChances(userId, 1, 'SLIDE');

    if (mode === 'LIVE') {
      return this.playLiveMode(userId, userNumber);
    } else {
      return this.playAutoMode(userId, userNumber);
    }
  }

  private async playLiveMode(userId: string, userNumber: number) {
    // In LIVE mode, the result is determined by server-side RNG
    const targetNumber = Math.floor(Math.random() * 100) + 1;
    const isWinner = userNumber === targetNumber;

    const game = await this.prisma.slideGame.create({
      data: {
        userId,
        mode: 'LIVE',
        targetNumber,
        userNumber,
        isWinner,
        isPublic: true,
        chancesUsed: 1,
      },
    });

    // Broadcast result via WebSocket
    this.slideGateway.broadcastResult({
      gameId: game.id,
      userId,
      userNumber,
      targetNumber,
      isWinner,
      mode: 'LIVE',
    });

    if (isWinner) {
      // Grant prize (e.g., cash or chance)
      await this.walletService.addCashback(userId, 100000, 'SLIDE', game.id);
    }

    return game;
  }

  private async playAutoMode(userId: string, userNumber: number) {
    // Get the current target number set by admin
    const activeGame = await this.prisma.slideGame.findFirst({
      where: {
        mode: 'AUTO',
        isPublic: true,
        targetNumber: { not: null },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!activeGame || !activeGame.targetNumber) {
      throw new BadRequestException('No target number set. Please wait for admin to set target.');
    }

    const targetNumber = activeGame.targetNumber;
    const isWinner = userNumber === targetNumber;

    // Create user's game entry
    const game = await this.prisma.slideGame.create({
      data: {
        userId,
        mode: 'AUTO',
        targetNumber,
        userNumber,
        isWinner,
        isPublic: true,
        chancesUsed: 1,
      },
    });

    // Broadcast result via WebSocket
    this.slideGateway.broadcastResult({
      gameId: game.id,
      userId,
      userNumber,
      targetNumber,
      isWinner,
      mode: 'AUTO',
    });

    if (isWinner) {
      // Grant prize
      await this.walletService.addCashback(userId, 500000, 'SLIDE', game.id);

      // Mark the target game as won (so it can't be won again)
      await this.prisma.slideGame.update({
        where: { id: activeGame.id },
        data: { isWinner: true },
      });
    }

    return game;
  }

  async getRecentWinners(limit: number = 10) {
    return this.prisma.slideGame.findMany({
      where: {
        isWinner: true,
        isPublic: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getUserGames(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [games, total] = await Promise.all([
      this.prisma.slideGame.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.slideGame.count({ where: { userId } }),
    ]);

    return {
      games,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCurrentTarget() {
    const activeGame = await this.prisma.slideGame.findFirst({
      where: {
        mode: 'AUTO',
        isPublic: true,
        targetNumber: { not: null },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!activeGame) {
      return { targetNumber: null, message: 'No target set' };
    }

    return {
      targetNumber: activeGame.targetNumber,
      isWinner: activeGame.isWinner,
      createdAt: activeGame.createdAt,
    };
  }
}
