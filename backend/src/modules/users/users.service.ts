import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        referralCode: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserStats(userId: string) {
    const [tickets, chances, wallet, referrals] = await Promise.all([
      this.prisma.ticket.count({ where: { userId } }),
      this.prisma.chance.count({ where: { userId, used: false } }),
      this.prisma.wallet.findUnique({ where: { userId } }),
      this.prisma.referral.count({ where: { referrerId: userId, isActive: true } }),
    ]);

    return {
      ticketsCount: tickets,
      activeChances: chances,
      balance: wallet?.balance.toString() || '0',
      referralsCount: referrals,
    };
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; email?: string; phone?: string }) {
    // Check if email or phone already exists (excluding current user)
    if (data.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: data.email,
          id: { not: userId },
        },
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    if (data.phone) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          phone: data.phone,
          id: { not: userId },
        },
      });
      if (existingUser) {
        throw new ConflictException('Phone already exists');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        referralCode: true,
        createdAt: true,
      },
    });
  }
}
