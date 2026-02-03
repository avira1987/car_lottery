import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { RegisterReferralDto } from './dto/register-referral.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('referrals')
@UseGuards(JwtAuthGuard)
export class ReferralsController {
  constructor(private referralsService: ReferralsService) {}

  @Get('code')
  async getReferralCode(@CurrentUser() user: any) {
    return this.referralsService.getReferralCode(user.userId);
  }

  @Get('stats')
  async getStats(@CurrentUser() user: any) {
    return this.referralsService.getReferralStats(user.userId);
  }

  @Get('my-referrer')
  async getMyReferrer(@CurrentUser() user: any) {
    return this.referralsService.getMyReferrer(user.userId);
  }

  @Post('register')
  async registerReferral(
    @CurrentUser() user: any,
    @Body() registerReferralDto: RegisterReferralDto,
  ) {
    return this.referralsService.registerReferral(user.userId, registerReferralDto);
  }
}
