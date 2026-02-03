import { Module } from '@nestjs/common';
import { ChancesService } from './chances.service';
import { ChancesController } from './chances.controller';

@Module({
  controllers: [ChancesController],
  providers: [ChancesService],
  exports: [ChancesService],
})
export class ChancesModule {}
