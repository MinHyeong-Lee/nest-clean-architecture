import { Test } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { UserFactory } from './user.factory';
import { User } from './user';

describe('UserFactory', () => {
  let userFactory: UserFactory; // 테스트 스위트 전체에서 사용할 UserFactory 선언

  /**
   * 유저 생성하는 factory의 create 동작을 테스트하기 위해서 eventbus로
   * UserCreatedEvent가 발행되어야 함. 모의 객체를 선언한다.
   */
  let eventBus: jest.Mocked<EventBus>;

  beforeAll(async () => {
    /**
     * 테스트 모듈 생성
     * 이 함수의 인수가 ModuleMetadata이므로 모듈을 임포트할 때와 동일하게 컴포넌트를 가져올 수 있음
     * UserFactory가 대상 클래스이므로 이 모듈을 프로바이더로 가져온다.
     * 모듈을 가져오는 것은 전체 테스트 스위트 내에서 한 번만 이루어지면 되므로 설정 단계인
     * beforeAll 구문 내에 작성
     */
    const module = await Test.createTestingModule({
      providers: [
        UserFactory,
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(), //어떠한 동작도 하지 않는 함수임을 의미함
          },
        },
      ],
    }).compile();
    /**
     * createTestingModule 함수의 리턴값은 TestingModuleBuilder이다.
     * compile 함수를 수행해서 모듈 생성을 완료한다. 이 함수는 비동기로 처리된다.
     */

    userFactory = module.get(UserFactory);
    eventBus = module.get(EventBus);
  });

  describe('create', () => {
    it('shoud create user', () => {
      // Given: 해당 테스트 케스 동작하기 위 갖춰져야 하는 선행조건 (어떤 상황이 주어졌을 때)
      // create함수는 주어진 조건은 딱히 없으므로 비워둠

      // When: 테스트하고자 하는 대상 코드를 실행합니다. (대상 코드가 동작한다면)
      // UserFactory가 create 함수를 수행한다.
      const user = userFactory.create(
        'user-id',
        'YOUR_NAME',
        'YOUR_EMAIL@gmail.com',
        'signup-verify-token',
        'pass1234',
        0,
      );

      // Then: 대상 코드의 수행 결과를 판단합니다. (기대한 값과 수행 결과가 맞는지)
      // 수행결과가 원하는 결과와 맞는지, When 단계를 수행했을 때 원하는 결과를 기술하고
      // Jest에서 제공하는 매처를 이용해서 판단함
      const expected = new User(
        'user-id',
        'YOUR_NAME',
        'YOUR_EMAIL@gmail.com',
        'signup-verify-token',
        'pass1234',
        0,
      );

      expect(expected).toEqual(user); //UserFactory.create를 통해 생성한 User 객체가 원하는 객체와 맞는지 검사
      expect(eventBus.publish).toBeCalledTimes(1); // 이벤트 버스가 한 번 호출되었는지 판단
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute user', () => {
      // Given: 해당 테스트 케스 동작하기 위 갖춰져야 하는 선행조건 (어떤 상황이 주어졌을 때)
      // When: 테스트하고자 하는 대상 코드를 실행합니다. (대상 코드가 동작한다면)
      // UserFactory가 create 함수를 수행한다.
      const user = userFactory.reconstitute(
        'user-id',
        'YOUR_NAME',
        'YOUR_EMAIL@gmail.com',
        'signup-verify-token',
        'pass1234',
        0,
      );

      // Then: 대상 코드의 수행 결과를 판단합니다. (기대한 값과 수행 결과가 맞는지)
      // 수행결과가 원하는 결과와 맞는지, When 단계를 수행했을 때 원하는 결과를 기술하고
      // Jest에서 제공하는 매처를 이용해서 판단함
      const expected = new User(
        'user-id',
        'YOUR_NAME',
        'YOUR_EMAIL@gmail.com',
        'signup-verify-token',
        'pass1234',
        0,
      );

      expect(expected).toEqual(user);
    });
  });
});
