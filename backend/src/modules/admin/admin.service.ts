import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { LotteryService } from '../lottery/lottery.service';
import { WheelService } from '../wheel/wheel.service';
import { SlideService } from '../slide/slide.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
    private lotteryService: LotteryService,
    private wheelService: WheelService,
    private slideService: SlideService,
  ) {}

  // User Management
  async getUsers(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              tickets: true,
              chances: true,
              referrals: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUser(userId: string, data: { isActive?: boolean; role?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.role && { role: data.role as any }),
      },
    });
  }

  // Transaction Management
  async getTransactions(page: number = 1, limit: number = 20, filters?: any) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;
    if (filters?.userId) where.userId = filters.userId;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async approveWithdrawal(transactionId: string, adminId: string) {
    return this.walletService.approveWithdrawal(transactionId, adminId);
  }

  async rejectWithdrawal(transactionId: string, adminId: string) {
    return this.walletService.rejectWithdrawal(transactionId, adminId);
  }

  // Settings Management
  async getSetting(key: string) {
    const setting = await this.prisma.adminSettings.findUnique({
      where: { key },
    });

    return setting ? setting.value : null;
  }

  async setSetting(key: string, value: any, description?: string, updatedBy?: string) {
    return this.prisma.adminSettings.upsert({
      where: { key },
      update: {
        value,
        description,
        updatedBy,
      },
      create: {
        key,
        value,
        description,
        updatedBy,
      },
    });
  }

  async setTicketBasePrice(price: number, adminId: string) {
    return this.setSetting('ticket_base_price', { price }, 'Base price for tickets', adminId);
  }

  async getTicketBasePrice() {
    const setting = await this.getSetting('ticket_base_price');
    return setting ? (setting as any).price : 100000;
  }

  // Lottery Management
  async createLottery(data: any) {
    return this.lotteryService.createLottery(data);
  }

  async drawLottery(lotteryId: string) {
    return this.lotteryService.drawLottery(lotteryId);
  }

  // Wheel Management
  async createWheelPrize(data: any) {
    return this.wheelService.createWheelPrize(data);
  }

  async updateWheelPrize(id: string, data: any) {
    return this.wheelService.updateWheelPrize(id, data);
  }

  // Slide Management
  async setSlideTarget(targetNumber: number) {
    return this.slideService.setTargetNumber({ targetNumber });
  }

  // Statistics
  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      totalTransactions,
      pendingWithdrawals,
      totalLotteries,
      activeLotteries,
      totalTickets,
      totalRevenue,
      totalBalance,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      this.prisma.transaction.count(),
      this.prisma.transaction.count({
        where: { type: 'WITHDRAWAL', status: 'PENDING' },
      }),
      this.prisma.lottery.count(),
      this.prisma.lottery.count({ where: { status: 'ACTIVE' } }),
      this.prisma.ticket.count(),
      this.prisma.transaction.aggregate({
        where: { type: 'DEPOSIT', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.prisma.wallet.aggregate({
        _sum: { balance: true },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      newUsersToday,
      totalTransactions,
      pendingWithdrawals,
      totalLotteries,
      activeLotteries,
      totalTickets,
      totalBalance: totalBalance._sum.balance?.toString() || '0',
      totalRevenue: totalRevenue._sum.amount?.toString() || '0',
    };
  }
}
