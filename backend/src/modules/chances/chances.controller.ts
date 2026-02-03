import { Controller, Get, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { ChancesService } from './chances.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('chances')
@UseGuards(JwtAuthGuard)
export class ChancesController {
  constructor(private chancesService: ChancesService) {}

  @Get()
  async getChances(@CurrentUser() user: any) {
    return this.chancesService.getUserChances(user.userId);
  }

  @Get('history')
  async getHistory(
    @CurrentUser() user: any,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.chancesService.getChanceHistory(user.userId, page, limit);
  }
}
