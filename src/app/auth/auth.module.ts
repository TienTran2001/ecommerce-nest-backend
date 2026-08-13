import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Session } from './entities/session.entity';
import { Verification } from './entities/verification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Session, Verification])],
})
export class AuthModule {}
