import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { LotteryService } from './lottery.service';
import { CreateLotteryDto } from './dto/create-lottery.dto';
import { EnterLotteryDto } from './dto/enter-lottery.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('lottery')
export class LotteryController {
  constructor(private lotteryService: LotteryService) {}

  @Public()
  @Get()
  async getLotteries(@Query('status') status?: string) {
    return this.lotteryService.getLotteries(status);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-entries/list')
  async getMyLotteries(@CurrentUser() user: any) {
    return this.lotteryService.getUserLotteries(user.userId);
  }

  @Public()
  @Get(':id')
  async getLotteryDetails(@Param('id') id: string) {
    return this.lotteryService.getLotteryDetails(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/entry')
  async checkEntry(@Param('id') id: string, @CurrentUser() user: any) {
    return this.lotteryService.checkUserEntry(user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('enter')
  async enterLottery(@CurrentUser() user: any, @Body() enterLotteryDto: EnterLotteryDto) {
    return this.lotteryService.enterLottery(user.userId, enterLotteryDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async createLottery(@Body() createLotteryDto: CreateLotteryDto) {
    return this.lotteryService.createLottery(createLotteryDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post(':id/draw')
  async drawLottery(@Param('id') id: string) {
    return this.lotteryService.drawLottery(id);
  }
}
