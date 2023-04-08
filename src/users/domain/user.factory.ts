import { Inject, Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { UserCreatedEvent } from './user-created.event';
import { User } from './user';

@Injectable()
export class UserFactory {
  constructor(private eventBus: EventBus) {}

  /**
   * UserFactory의 create 함수 로직 내에는 UserCreateEvent를 발행하는 로직이 포함되어 있음
   * 따라서, 재사용할 수 없음
   */
  create(
    id: string,
    name: string,
    email: string,
    password: string,
    signupVerifyToken: string,
    status: number,
  ): User {
    const user = new User(id, name, email, password, signupVerifyToken, status);

    //이벤트버스에 이메일 전송 이벤트를 생성하여 가입과 이메일 로직을 분리함
    this.eventBus.publish(new UserCreatedEvent(email, signupVerifyToken));

    return user;
  }

  /**
   * reconstitute ?
   * 도메인 객체를 생성할 때 그 객체의 속성을 모두 알고 있는 경우,
   * 해당 객체를 다시 구성한느 패턴이다.
   */
  reconstitute(
    id: string,
    name: string,
    email: string,
    password: string,
    signupVerifyToken: string,
    status: number,
  ): User {
    return new User(id, name, email, password, signupVerifyToken, status);
  }
}
