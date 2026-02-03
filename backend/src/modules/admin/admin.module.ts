import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { WalletModule } from '../wallet/wallet.module';
import { LotteryModule } from '../lottery/lottery.module';
import { WheelModule } from '../wheel/wheel.module';
import { SlideModule } from '../slide/slide.module';

@Module({
  imports: [WalletModule, LotteryModule, WheelModule, SlideModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
