import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { BuyTicketsDto } from './dto/buy-tickets.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post('buy')
  async buyTickets(@CurrentUser() user: any, @Body() buyTicketsDto: BuyTicketsDto) {
    return this.ticketsService.buyTickets(user.userId, buyTicketsDto);
  }

  @Get('my-tickets')
  async getMyTickets(
    @CurrentUser() user: any,
    @Query('lotteryId') lotteryId?: string,
  ) {
    return this.ticketsService.getUserTickets(user.userId, lotteryId);
  }
}
