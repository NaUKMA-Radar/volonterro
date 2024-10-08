import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { MockDataStorage, mockFollowingRepository } from './following.mock';
import { FollowingModule } from 'src/following/following.module';
import * as request from 'supertest';
import { AllExceptionFilter } from 'src/core/exceptions/exception.filter';
import { HttpAdapterHost } from '@nestjs/core';
import ValidationPipes from 'src/core/config/validation-pipes';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { MockAuthGuard } from 'test/core/auth/mock-auth-guard';
import { JwtStrategy } from 'src/core/auth/strategies/jwt.strategy';
import { MockAuthStrategy } from 'test/core/auth/mock-auth-strategy';
import * as cookieParser from 'cookie-parser';
import { accessToken } from 'test/core/auth/mock-auth';

describe('FollowingController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [FollowingModule],
      providers: [
        {
          provide: JwtAuthGuard,
          useValue: MockAuthGuard,
        },
        {
          provide: JwtStrategy,
          useClass: MockAuthStrategy,
        },
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockFollowingRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(ValidationPipes.validationPipe);
    app.useGlobalFilters(new AllExceptionFilter(app.get(HttpAdapterHost)));
    app.use(cookieParser());
    await app.init();
  });

  it('/users/:id/followers (GET) --> 200 OK', () => {
    MockDataStorage.setDefaultItems();

    const initialData = [...MockDataStorage.items()];
    return request(app.getHttpServer())
      .get(`/users/${MockDataStorage.items()[0].userId}/followers`)
      .set('authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`Volonterro-Access-Token=${accessToken}; Path=/; HttpOnly;`])
      .expect(HttpStatus.OK)
      .then(response => {
        expect(JSON.stringify(response.body)).toEqual(JSON.stringify([MockDataStorage.items()[0]]));
        expect(MockDataStorage.items()).toEqual(initialData);
        MockDataStorage.setDefaultItems();
      });
  });

  it('/users/:id/followings (GET) --> 200 OK', () => {
    MockDataStorage.setDefaultItems();

    const initialData = [...MockDataStorage.items()];
    return request(app.getHttpServer())
      .get(`/users/${MockDataStorage.items()[0].userId}/followings`)
      .set('authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`Volonterro-Access-Token=${accessToken}; Path=/; HttpOnly;`])
      .expect(HttpStatus.OK)
      .then(response => {
        expect(JSON.stringify(response.body)).toEqual(JSON.stringify([MockDataStorage.items()[4]]));
        expect(MockDataStorage.items()).toEqual(initialData);
        MockDataStorage.setDefaultItems();
      });
  });

  it('/users/:userId/followers/:followerId (POST) --> 201 CREATED', () => {
    MockDataStorage.setDefaultItems();

    const initialData = [...MockDataStorage.items()];
    return request(app.getHttpServer())
      .post(
        `/users/${MockDataStorage.createFollowingDtoList[0].userId}/followers/${MockDataStorage.createFollowingDtoList[0].followerId}`,
      )
      .set('authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`Volonterro-Access-Token=${accessToken}; Path=/; HttpOnly;`])
      .expect(HttpStatus.CREATED)
      .then(response => {
        expect(JSON.stringify(response.body)).toEqual(
          JSON.stringify(MockDataStorage.createFollowingDtoList[0]),
        );
        expect(MockDataStorage.items()).toEqual([
          ...initialData,
          MockDataStorage.createFollowingDtoList[0],
        ]);
        MockDataStorage.setDefaultItems();
      });
  });

  it('/users/:userId/followers/:followerId (POST) --> 409 CONFLICT | Following with specified userId and followerId already exists', () => {
    MockDataStorage.setDefaultItems();

    const initialData = [...MockDataStorage.items()];
    return request(app.getHttpServer())
      .post(
        `/users/${MockDataStorage.items()[0].userId}/followers/${
          MockDataStorage.items()[0].followerId
        }`,
      )
      .set('authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`Volonterro-Access-Token=${accessToken}; Path=/; HttpOnly;`])
      .expect(HttpStatus.CONFLICT)
      .then(() => {
        expect(MockDataStorage.items()).toEqual(initialData);
        MockDataStorage.setDefaultItems();
      });
  });

  it('/users/:userId/followers/:followerId (DELETE) --> 200 OK', () => {
    MockDataStorage.setDefaultItems();

    const initialData = [...MockDataStorage.items()];
    return request(app.getHttpServer())
      .delete(
        `/users/${MockDataStorage.removeFollowingDtoList[0].userId}/followers/${MockDataStorage.removeFollowingDtoList[0].followerId}`,
      )
      .set('authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`Volonterro-Access-Token=${accessToken}; Path=/; HttpOnly;`])
      .expect(HttpStatus.OK)
      .then(response => {
        expect(JSON.stringify(response.body)).toEqual(
          JSON.stringify(MockDataStorage.removeFollowingDtoList[0]),
        );
        expect(MockDataStorage.items()).toEqual(
          initialData.filter(
            item =>
              item.userId !== MockDataStorage.removeFollowingDtoList[0].userId ||
              item.followerId !== MockDataStorage.removeFollowingDtoList[0].followerId,
          ),
        );
        MockDataStorage.setDefaultItems();
      });
  });

  it('/users/:userId/followers/:followerId (DELETE) --> 404 NOT FOUND | Following with specified userId and followerId was not found', () => {
    MockDataStorage.setDefaultItems();

    const initialData = [...MockDataStorage.items()];
    return request(app.getHttpServer())
      .delete(
        `/users/${MockDataStorage.createFollowingDtoList[0].userId}/followers/${MockDataStorage.createFollowingDtoList[0].followerId}`,
      )
      .set('authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`Volonterro-Access-Token=${accessToken}; Path=/; HttpOnly;`])
      .expect(HttpStatus.NOT_FOUND)
      .then(() => {
        expect(MockDataStorage.items()).toEqual(initialData);
        MockDataStorage.setDefaultItems();
      });
  });
});
