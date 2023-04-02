import { Injectable } from '@nestjs/common';
import { EmailService as ExternalEmailService } from 'src/email/email.service';
import { IEmailService } from 'src/users/application/adapter/iemail.service';

@Injectable()
export class EmailService implements IEmailService {
  constructor(
    //Email모듈이 UsersModule과 같은 서비스에 존재하기 때문에 직접 주입받을 수 있음
    //MSA를 적용하여 별개의 서비스로 분리했다면, HTTP 등 다른 프로토콜을 이용하여 호출
    private emailService: ExternalEmailService,
  ) {}

  async sendMemberJoinVerification(
    email: string,
    signupVerifyToken: string,
  ): Promise<void> {
    this.emailService.sendMemberJoinVerification(email, signupVerifyToken);
  }
}
