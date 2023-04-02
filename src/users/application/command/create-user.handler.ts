import * as uuid from 'uuid';
import { ulid } from 'ulid';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import {
  Injectable,
  UnprocessableEntityException,
  InternalServerErrorException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../infra/db/entity/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { UserFactory } from 'src/users/domain/user.factory';
import { IUserRepository } from 'src/users/domain/repository/iuser.repository';

@Injectable()
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private userFactory: UserFactory,

    /**
     * IUserRepository는 클래스가 아니기 때문에 의존성 클래스로 주입받을 수 없음
     * @Inject 데커레이터와 UserRepository 토큰을 이용하여 구체 클래스를 주입받는다.
     */
    @Inject('UserRepository') private userRepository: IUserRepository,
  ) {}

  async execute(command: CreateUserCommand) {
    const { name, email, password } = command;

    //IUserRepository가 제공하는 인터페이스를 이용하여 데이터를 조회하고 저장
    const user = await this.userRepository.findByEmail(email);
    if (user !== null) {
      throw new UnprocessableEntityException(
        '해당 이메일로는 가입할 수 없습니다.',
      );
    }

    const id = ulid();
    const signupVerifyToken = uuid.v1();
    const status = 0;

    await this.userRepository.save(
      id,
      name,
      email,
      password,
      signupVerifyToken,
      status,
    );

    //여기서 전달해주는 변수 순서가 user.factory.ts 파일 내 create method랑 일치해야 함
    this.userFactory.create(
      id,
      name,
      email,
      password,
      signupVerifyToken,
      status,
    );
  }

  // private async saveUserUsingQueryRunner(
  //   name: string,
  //   email: string,
  //   password: string,
  //   signupVerifyToken: string,
  //   status: number,
  // ) {
  //   const queryRunner = this.dataSource.createQueryRunner();

  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     const user = new UserEntity();
  //     user.id = ulid();
  //     user.name = name;
  //     user.email = email;
  //     user.password = password;
  //     user.signupVerifyToken = signupVerifyToken;
  //     user.status = status;

  //     await queryRunner.manager.save(user);

  //     await queryRunner.commitTransaction();
  //   } catch (e) {
  //     console.log(e);
  //     await queryRunner.rollbackTransaction();
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }
}
