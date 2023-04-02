import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EmailService } from 'src/email/email.service';
import { UserCreatedEvent } from '../../domain/user-created.event';
import { IEmailService } from '../adapter/iemail.service';

@EventsHandler(UserCreatedEvent)
export class UserEventsHandler implements IEventHandler<UserCreatedEvent> {
  constructor(@Inject('EmailService') private emailService: IEmailService) {}

  async handle(event: UserCreatedEvent) {
    switch (event.name) {
      case UserCreatedEvent.name:
        {
          console.log('UserCreatedEvent!');
          const { email, signupVerifyToken } = event as UserCreatedEvent;
          console.log(event);
          console.log(signupVerifyToken);
          await this.emailService.sendMemberJoinVerification(
            email,
            signupVerifyToken,
          );
          break;
        }
        dafault: break;
    }
  }
}
