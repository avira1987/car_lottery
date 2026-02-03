import { Controller, Get, Post, Body, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { SlideService } from './slide.service';
import { PlaySlideDto } from './dto/play-slide.dto';
import { SetTargetDto } from './dto/set-target.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('slide')
export class SlideController {
  constructor(private slideService: SlideService) {}

  @Public()
  @Get('winners')
  async getRecentWinners(@Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10) {
    return this.slideService.getRecentWinners(limit);
  }

  @Public()
  @Get('target')
  async getCurrentTarget() {
    return this.slideService.getCurrentTarget();
  }

  @UseGuards(JwtAuthGuard)
  @Post('play')
  async playSlide(@CurrentUser() user: any, @Body() playSlideDto: PlaySlideDto) {
    return this.slideService.playSlide(user.userId, playSlideDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-games')
  async getMyGames(
    @CurrentUser() user: any,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.slideService.getUserGames(user.userId, page, limit);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('set-target')
  async setTargetNumber(@Body() setTargetDto: SetTargetDto) {
    return this.slideService.setTargetNumber(setTargetDto);
  }
}
