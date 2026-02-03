import { Controller, Get, Post, Body, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('balance')
  async getBalance(@CurrentUser() user: any) {
    return this.walletService.getBalance(user.userId);
  }

  @Post('deposit')
  async deposit(@CurrentUser() user: any, @Body() depositDto: DepositDto) {
    return this.walletService.deposit(user.userId, depositDto);
  }

  @Post('withdraw')
  async withdraw(@CurrentUser() user: any, @Body() withdrawDto: WithdrawDto) {
    return this.walletService.withdraw(user.userId, withdrawDto);
  }

  @Get('transactions')
  async getTransactions(
    @CurrentUser() user: any,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.walletService.getTransactions(user.userId, page, limit);
  }

  @Post('withdrawals/:id/approve')
  @UseGuards(AdminGuard)
  async approveWithdrawal(
    @CurrentUser() admin: any,
    @Body('id') transactionId: string,
  ) {
    return this.walletService.approveWithdrawal(transactionId, admin.userId);
  }

  @Post('withdrawals/:id/reject')
  @UseGuards(AdminGuard)
  async rejectWithdrawal(
    @CurrentUser() admin: any,
    @Body('id') transactionId: string,
  ) {
    return this.walletService.rejectWithdrawal(transactionId, admin.userId);
  }
}
