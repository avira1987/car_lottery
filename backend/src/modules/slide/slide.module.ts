import { Module } from '@nestjs/common';
import { SlideService } from './slide.service';
import { SlideController } from './slide.controller';
import { SlideGateway } from './slide.gateway';
import { ChancesModule } from '../chances/chances.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [ChancesModule, WalletModule],
  controllers: [SlideController],
  providers: [SlideService, SlideGateway],
  exports: [SlideService],
})
export class SlideModule {}
