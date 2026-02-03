import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { ChancesModule } from './modules/chances/chances.module';
import { LotteryModule } from './modules/lottery/lottery.module';
import { WheelModule } from './modules/wheel/wheel.module';
import { SlideModule } from './modules/slide/slide.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { AdminModule } from './modules/admin/admin.module';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    WalletModule,
    TicketsModule,
    ChancesModule,
    LotteryModule,
    WheelModule,
    SlideModule,
    ReferralsModule,
    AdminModule,
  ],
})
export class AppModule {}
