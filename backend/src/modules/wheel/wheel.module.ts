import { Module } from '@nestjs/common';
import { WheelService } from './wheel.service';
import { WheelController } from './wheel.controller';
import { ChancesModule } from '../chances/chances.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [ChancesModule, WalletModule],
  controllers: [WheelController],
  providers: [WheelService],
  exports: [WheelService],
})
export class WheelModule {}
