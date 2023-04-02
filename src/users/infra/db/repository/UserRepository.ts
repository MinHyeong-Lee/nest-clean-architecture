import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IUserRepository } from 'src/users/domain/repository/iuser.repository';
import { UserEntity } from '../entity/user.entity';
import { User } from 'src/users/domain/user';
import { UserFactory } from 'src/users/domain/user.factory';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private userFactory: UserFactory,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({
      where: { email },
    });
    if (!userEntity) {
      return null;
    }

    const { id, name, signupVerifyToken, password, status } = userEntity;

    //유저 객체를 발행하는 userFactory의 멤버 함수
    return this.userFactory.reconstitute(
      id,
      name,
      email,
      password,
      signupVerifyToken,
      status,
    );
  }

  async findByEmailAndPassword(
    email: string,
    password: string,
  ): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({
      where: { email, password },
    });
    if (!userEntity) {
      return null;
    }

    const { id, name, signupVerifyToken, status } = userEntity;

    return this.userFactory.reconstitute(
      id,
      name,
      email,
      password,
      signupVerifyToken,
      status,
    );
  }

  async findBySignupVerifyToken(
    signupVerifyToken: string,
  ): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({
      where: { signupVerifyToken },
    });
    if (!userEntity) {
      return null;
    }

    const { id, name, email, password, status } = userEntity;

    return this.userFactory.reconstitute(
      id,
      name,
      email,
      password,
      signupVerifyToken,
      status,
    );
  }

  async save(
    id: string,
    name: string,
    email: string,
    password: string,
    signupVerifyToken: string,
    status: number,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = new UserEntity();
      user.id = id;
      user.name = name;
      user.email = email;
      user.password = password;
      user.signupVerifyToken = signupVerifyToken;
      user.status = status;

      await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();
    } catch (e) {
      console.log(e);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
