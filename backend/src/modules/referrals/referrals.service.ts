import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ChancesService } from '../chances/chances.service';
import { RegisterReferralDto } from './dto/register-referral.dto';

@Injectable()
export class ReferralsService {
  constructor(
    private prisma: PrismaService,
    private chancesService: ChancesService,
  ) {}

  async getReferralCode(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        referralCode: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const referralLink = `${baseUrl}/register?ref=${user.referralCode}`;

    return {
      referralCode: user.referralCode,
      referralLink,
    };
  }

  async registerReferral(userId: string, registerReferralDto: RegisterReferralDto) {
    const { referralCode, ipAddress, deviceFingerprint } = registerReferralDto;

    // Find referrer
    const referrer = await this.prisma.user.findUnique({
      where: { referralCode },
    });

    if (!referrer) {
      throw new NotFoundException('Invalid referral code');
    }

    if (referrer.id === userId) {
      throw new BadRequestException('Cannot refer yourself');
    }

    // Check if already referred by this user
    const existingReferral = await this.prisma.referral.findUnique({
      where: { referredId: userId },
    });

    if (existingReferral) {
      throw new BadRequestException('User already has a referrer');
    }

    // Check for fraud: same IP or device fingerprint
    if (ipAddress) {
      const sameIpReferrals = await this.prisma.referral.findMany({
        where: {
          referrerId: referrer.id,
          ipAddress,
        },
      });

      if (sameIpReferrals.length > 0) {
        // Allow but mark as suspicious
        console.warn(`Suspicious referral: Same IP ${ipAddress} for referrer ${referrer.id}`);
      }
    }

    if (deviceFingerprint) {
      const sameDeviceReferrals = await this.prisma.referral.findMany({
        where: {
          referrerId: referrer.id,
          deviceFingerprint,
        },
      });

      if (sameDeviceReferrals.length > 0) {
        console.warn(`Suspicious referral: Same device ${deviceFingerprint} for referrer ${referrer.id}`);
      }
    }

    // Create referral
    const referral = await this.prisma.referral.create({
      data: {
        referrerId: referrer.id,
        referredId: userId,
        referralCode,
        ipAddress,
        deviceFingerprint,
        isActive: true,
        chanceGranted: false,
      },
    });

    // Grant chance to referrer (1 chance per active referral)
    await this.chancesService.grantChance(referrer.id, 'REFERRAL', referral.id);

    // Mark chance as granted
    await this.prisma.referral.update({
      where: { id: referral.id },
      data: { chanceGranted: true },
    });

    return referral;
  }

  async getReferralStats(userId: string) {
    const [totalReferrals, activeReferrals, totalChancesGranted] = await Promise.all([
      this.prisma.referral.count({
        where: { referrerId: userId },
      }),
      this.prisma.referral.count({
        where: { referrerId: userId, isActive: true },
      }),
      this.prisma.chance.count({
        where: {
          userId,
          source: 'REFERRAL',
        },
      }),
    ]);

    const recentReferrals = await this.prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      totalReferrals,
      activeReferrals,
      totalChancesGranted,
      recentReferrals,
    };
  }

  async getMyReferrer(userId: string) {
    const referral = await this.prisma.referral.findUnique({
      where: { referredId: userId },
      include: {
        referrer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return referral;
  }
}
