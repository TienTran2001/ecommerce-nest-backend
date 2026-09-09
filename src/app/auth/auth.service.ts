import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Verification } from './entities/verification.entity';
import { Repository } from 'typeorm';
import { PinoLogger } from 'nestjs-pino';
import { UserService } from '../user/user.service';
import { apiBadRequest } from 'src/shared/helpers/api-18n';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Verification)
    private readonly verificationRepository: Repository<Verification>,
    private readonly logger: PinoLogger,
    private readonly userService: UserService,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async verifyEmailCustom(token: string, email: string) {
    const record = await this.verificationRepository.findOne({
      where: { value: token },
    });

    if (!record) {
      this.logger.warn({ msg: 'auth.verify.tokenNotFound', email });
      apiBadRequest('errors.auth.verificationFailed');
    }

    if (record.expiresAt.getTime() < Date.now()) {
      await this.verificationRepository.delete({ id: record.id });
      this.logger.warn({ msg: 'auth.verify.tokenExpired', email });
      apiBadRequest('errors.auth.tokenExpired');
    }

    if (record.identifier.toLowerCase() !== email.toLowerCase()) {
      this.logger.warn({
        msg: 'auth.verify.emailMismatch',
        tokenEmail: record.identifier,
        providedEmail: email,
      });
      apiBadRequest('errors.auth.emailMismatch');
    }

    await this.userService.verifyUser(email);
    await this.verificationRepository.delete({ id: record.id });

    this.logger.info({ msg: 'auth.email.verified', email });

    return {
      success: true,
      message: 'Email verified successfully',
      user: null,
    };
  }
}
