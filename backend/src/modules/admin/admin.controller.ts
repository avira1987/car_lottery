import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // User Management
  @Get('users')
  async getUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(page, limit, search);
  }

  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateUser(id, data);
  }

  // Transaction Management
  @Get('transactions')
  async getTransactions(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
  ) {
    return this.adminService.getTransactions(page, limit, { type, status, userId });
  }

  @Post('withdrawals/:id/approve')
  async approveWithdrawal(@Param('id') id: string, @CurrentUser() admin: any) {
    return this.adminService.approveWithdrawal(id, admin.userId);
  }

  @Post('withdrawals/:id/reject')
  async rejectWithdrawal(@Param('id') id: string, @CurrentUser() admin: any) {
    return this.adminService.rejectWithdrawal(id, admin.userId);
  }

  // Settings
  @Get('settings/:key')
  async getSetting(@Param('key') key: string) {
    if (key === 'ticket-base-price') {
      const price = await this.adminService.getTicketBasePrice();
      return { price };
    }
    const value = await this.adminService.getSetting(key);
    return { value };
  }

  @Post('settings/:key')
  async setSetting(
    @Param('key') key: string,
    @Body() data: { value: any; description?: string },
    @CurrentUser() admin: any,
  ) {
    return this.adminService.setSetting(key, data.value, data.description, admin.userId);
  }

  @Post('settings/ticket-base-price')
  async setTicketBasePrice(@Body() data: { price: number }, @CurrentUser() admin: any) {
    return this.adminService.setTicketBasePrice(data.price, admin.userId);
  }

  // Lottery Management
  @Post('lottery')
  async createLottery(@Body() data: any) {
    return this.adminService.createLottery(data);
  }

  @Post('lottery/:id/draw')
  async drawLottery(@Param('id') id: string) {
    return this.adminService.drawLottery(id);
  }

  // Wheel Management
  @Post('wheel/prizes')
  async createWheelPrize(@Body() data: any) {
    return this.adminService.createWheelPrize(data);
  }

  @Put('wheel/prizes/:id')
  async updateWheelPrize(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateWheelPrize(id, data);
  }

  // Slide Management
  @Post('slide/target')
  async setSlideTarget(@Body() data: { targetNumber: number }) {
    return this.adminService.setSlideTarget(data.targetNumber);
  }
}
