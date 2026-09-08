import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Session } from './entities/session.entity';
import { Verification } from './entities/verification.entity';
import { SessionAuthService } from './session-auth/session-auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Session, Verification])],
  providers: [SessionAuthService],
  exports: [SessionAuthService],
})
export class AuthModule {}
