import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getBalance(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return {
      balance: wallet.balance.toString(),
      userId: wallet.userId,
    };
  }

  async deposit(userId: string, depositDto: DepositDto) {
    const { amount, description } = depositDto;

    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    // Create transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        type: 'DEPOSIT',
        amount: new Decimal(amount),
        status: 'COMPLETED',
        description: description || 'Deposit',
        metadata: {},
      },
    });

    // Update wallet balance
    await this.prisma.wallet.update({
      where: { userId },
      data: {
        balance: {
          increment: new Decimal(amount),
        },
      },
    });

    return transaction;
  }

  async withdraw(userId: string, withdrawDto: WithdrawDto) {
    const { amount, description } = withdrawDto;

    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.balance.lt(amount)) {
      throw new BadRequestException('Insufficient balance');
    }

    // Create withdrawal request (needs admin approval)
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        type: 'WITHDRAWAL',
        amount: new Decimal(amount),
        status: 'PENDING',
        description: description || 'Withdrawal request',
        metadata: {},
      },
    });

    // Reserve the amount (subtract from balance)
    await this.prisma.wallet.update({
      where: { userId },
      data: {
        balance: {
          decrement: new Decimal(amount),
        },
      },
    });

    return transaction;
  }

  async addCashback(userId: string, amount: number, source: string, sourceId?: string) {
    if (amount <= 0) return;

    // Create cashback transaction
    await this.prisma.transaction.create({
      data: {
        userId,
        type: 'CASHBACK',
        amount: new Decimal(amount),
        status: 'COMPLETED',
        description: `Cashback from ${source}`,
        metadata: { source, sourceId },
      },
    });

    // Update wallet balance
    await this.prisma.wallet.update({
      where: { userId },
      data: {
        balance: {
          increment: new Decimal(amount),
        },
      },
    });
  }

  async getTransactions(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({
        where: { userId },
      }),
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
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.type !== 'WITHDRAWAL') {
      throw new BadRequestException('Transaction is not a withdrawal');
    }

    if (transaction.status !== 'PENDING') {
      throw new BadRequestException('Transaction is not pending');
    }

    // Approve withdrawal
    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'COMPLETED',
        metadata: {
          ...(transaction.metadata as object),
          approvedBy: adminId,
          approvedAt: new Date().toISOString(),
        },
      },
    });

    return transaction;
  }

  async rejectWithdrawal(transactionId: string, adminId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== 'PENDING') {
      throw new BadRequestException('Transaction is not pending');
    }

    // Reject and refund
    await this.prisma.$transaction([
      this.prisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'CANCELLED' },
      }),
      this.prisma.wallet.update({
        where: { userId: transaction.userId },
        data: {
          balance: {
            increment: transaction.amount,
          },
        },
      }),
    ]);

    return transaction;
  }
}
