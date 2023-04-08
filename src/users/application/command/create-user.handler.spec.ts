import * as uuid from 'uuid';
import * as ulid from 'ulid';
import { Test } from '@nestjs/testing';
import { CreateUserHandler } from './create-user.handler';
import { UserFactory } from '../../domain/user.factory';
import { UserRepository } from '../../infra/db/repository/UserRepository';
import { CreateUserCommand } from './create-user.command';
import { UnprocessableEntityException } from '@nestjs/common';

jest.mock('uuid');
jest.mock('ulid');

//외부의 라이브러리가 생성하는 임의의 문자열이 항상 같은 값이 나오도록 한다.
jest.spyOn(uuid, 'v1').mockReturnValue('0000-0000-0000-0000');
jest.spyOn(ulid, 'ulid').mockReturnValue('ulid');

describe('CreateUserHandler', () => {
  //CreateUserHandler가 의존하고 있는 클래스 선언
  let createUserHandler: CreateUserHandler;
  let userFactory: UserFactory;
  let userRepository: UserRepository;

  beforeAll(async () => {
    //UserFactory, UserRepository를 모의객체로 제공함
    const module = await Test.createTestingModule({
      providers: [
        CreateUserHandler,
        {
          provide: UserFactory,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: 'UserRepository',
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    createUserHandler = module.get(CreateUserHandler);
    userFactory = module.get(UserFactory);
    userRepository = module.get('UserRepository');
  });

  const id = ulid.ulid();
  const name = 'minhyeong';
  const email = 'usupool94@gmail.com';
  const password = 'ehvkpfqhajwgofiv';
  const signupVerifyToken = uuid.v1();

  describe('execute', () => {
    it('should execute CreateUserCommand', async () => {
      // Given: 해당 테스트 케스 동작하기 위 갖춰져야 하는 선행조건 (어떤 상황이 주어졌을 때)
      // 기본 테스트 케이스를 위해 userRepository에 저장된 유저가 없는 조건을 설정
      userRepository.findByEmail = jest.fn().mockResolvedValue(null);

      // When: 테스트하고자 하는 대상 코드를 실행합니다. (대상 코드가 동작한다면)
      await createUserHandler.execute(
        new CreateUserCommand(name, email, password),
      );

      // Then: 대상 코드의 수행 결과를 판단합니다. (기대한 값과 수행 결과가 맞는지)
      // UserFactory 테스트의 경우엔 테스트 대상 클래스가 의존하고 있는 객체의 함수를
      // 단순히 호출하는지만 검증했다면, 이번에는 인수까지 제대로 넘기고 있는지 검증
      expect(userRepository.save).toBeCalledWith(
        id,
        name,
        email,
        password,
        signupVerifyToken,
        0,
      );
      expect(userFactory.create).toBeCalledWith(
        id,
        name,
        email,
        password,
        signupVerifyToken,
        0,
      );
    });

    it('should throw UnprocessableEntityException when user exists', async () => {
      // Given: 해당 테스트 케스 동작하기 위 갖춰져야 하는 선행조건 (어떤 상황이 주어졌을 때)
      // 유저 정보가 있는 경우 테스트
      userRepository.findByEmail = jest.fn().mockResolvedValue({
        id,
        name,
        email,
        password,
        signupVerifyToken,
      });

      // When
      // Then: 대상 코드의 수행 결과를 판단합니다. (기대한 값과 수행 결과가 맞는지)
      // 예외가 발생하는지 검증
      await expect(
        createUserHandler.execute(new CreateUserCommand(name, email, password)),
      ).rejects.toThrowError(UnprocessableEntityException);
    });
  });
});
