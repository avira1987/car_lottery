import { Controller, Get, Post, Body, Param, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { WheelService } from './wheel.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('wheel')
export class WheelController {
  constructor(private wheelService: WheelService) {}

  @Public()
  @Get('prizes')
  async getPrizes() {
    return this.wheelService.getWheelPrizes();
  }

  @UseGuards(JwtAuthGuard)
  @Post('spin')
  async spinWheel(@CurrentUser() user: any) {
    return this.wheelService.spinWheel(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-spins')
  async getMySpins(
    @CurrentUser() user: any,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.wheelService.getUserSpins(user.userId, page, limit);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('prizes')
  async createPrize(@Body() data: any) {
    return this.wheelService.createWheelPrize(data);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('prizes/:id')
  async updatePrize(@Param('id') id: string, @Body() data: any) {
    return this.wheelService.updateWheelPrize(id, data);
  }
}
