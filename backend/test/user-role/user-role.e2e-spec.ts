import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { UserRoleModule } from 'src/user-role/user-role.module';
import { MockDataStorage, mockUserRoleRepository } from './user-role.mock';
import * as request from 'supertest';
import ValidationPipes from 'src/core/config/validation-pipes';
import { AllExceptionFilter } from 'src/core/exceptions/exception.filter';
import { HttpAdapterHost } from '@nestjs/core';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { MockAuthGuard } from 'test/core/auth/mock-auth-guard';
import { JwtStrategy } from 'src/core/auth/strategies/jwt.strategy';
import { MockAuthStrategy } from 'test/core/auth/mock-auth-strategy';
import * as cookieParser from 'cookie-parser';
import { accessToken } from 'test/core/auth/mock-auth';

// To allow parsing BigInt to JSON
(BigInt.prototype as any).toJSON = function () {
  return Number(this.toString());
};

describe('UserRoleController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserRoleModule],
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
      .useValue(mockUserRoleRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(ValidationPipes.validationPipe);
    app.useGlobalFilters(new AllExceptionFilter(app.get(HttpAdapterHost)));
    app.use(cookieParser());
    await app.init();
  });

  it('/user-roles (GET) --> 200 OK', () => {
    MockDataStorage.setDefaultItems();

    const initialData = [...MockDataStorage.items()];
    return request(app.getHttpServer())
      .get('/user-roles')
      .set('authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`Volonterro-Access-Token=${accessToken}; Path=/; HttpOnly;`])
      .expect(HttpStatus.OK)
      .then(response => {
        expect(JSON.stringify(response.body)).toEqual(JSON.stringify(MockDataStorage.items()));
        expect(MockDataStorage.items()).toEqual(initialData);
        MockDataStorage.setDefaultItems();
      });
  });

  it('/user-roles (POST) --> 201 CREATED', () => {
    MockDataStorage.setDefaultItems();

    const initialData = [...MockDataStorage.items()];
    return request(app.getHttpServer())
      .post('/user-roles')
      .set('authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`Volonterro-Access-Token=${accessToken}; Path=/; HttpOnly;`])
      .send(MockDataStorage.createUserRoleDtoList[0])
      .expect(HttpStatus.CREATED)
      .then(response => {
        expect(JSON.stringify(response.body)).toEqual(
          JSON.stringify(MockDataStorage.createUserRoleDtoList[0]),
        );
        expect(JSON.stringify(MockDataStorage.items())).toEqual(
          JSON.stringify([...initialData, MockDataStorage.createUserRoleDtoList[0]]),
        );
        MockDataStorage.setDefaultItems();
      });
  });

  it('/user-roles (POST) --> 409 CONFLICT | User role with specified name already exists', () => {
    MockDataStorage.setDefaultItems();

    const initialData = [...MockDataStorage.items()];
    return request(app.getHttpServer())
      .post('/user-roles')
      .set('authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`Volonterro-Access-Token=${accessToken}; Path=/; HttpOnly;`])
      .send(MockDataStorage.items()[0])
      .expect(HttpStatus.CONFLICT)
      .then(() => {
        expect(MockDataStorage.items()).toEqual(initialData);
        MockDataStorage.setDefaultItems();
      });
  });

  it('/user-roles/:name (PUT) --> 200 OK', () => {
    MockDataStorage.setDefaultItems();

    const initialData = [...MockDataStorage.items()];
    return request(app.getHttpServer())
      .put(`/user-roles/${MockDataStorage.updateUserRoleDtoList[0].name}`)
      .set('authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`Volonterro-Access-Token=${accessToken}; Path=/; HttpOnly;`])
      .send(MockDataStorage.updateUserRoleDtoList[0].data)
      .expect(HttpStatus.OK)
      .then(response => {
        expect(JSON.stringify(response.body)).toEqual(
          JSON.stringify(MockDataStorage.updateUserRoleDtoList[0].data),
        );
        expect(JSON.stringify(MockDataStorage.items())).toEqual(
          JSON.stringify(
            initialData.map(item =>
              item.name === MockDataStorage.updateUserRoleDtoList[0].name
                ? MockDataStorage.updateUserRoleDtoList[0].data
                : item,
            ),
          ),
        );
        MockDataStorage.setDefaultItems();
      });
  });

  it('/user-roles/:name (PUT) --> 404 NOT FOUND | User role with specified name was not found', () => {
    MockDataStorage.setDefaultItems();

    const initialData = [...MockDataStorage.items()];
    return request(app.getHttpServer())
      .put(`/user-roles/${MockDataStorage.createUserRoleDtoList[0].name}_not_existing_name`)
      .set('authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`Volonterro-Access-Token=${accessToken}; Path=/; HttpOnly;`])
      .send(MockDataStorage.updateUserRoleDtoList[0].data)
      .expect(HttpStatus.NOT_FOUND)
      .then(() => {
        expect(MockDataStorage.items()).toEqual(initialData);
        MockDataStorage.setDefaultItems();
      });
  });

  it('/user-roles/:name (DELETE) --> 200 OK', () => {
    MockDataStorage.setDefaultItems();

    const initialData = [...MockDataStorage.items()];
    return request(app.getHttpServer())
      .delete(`/user-roles/${MockDataStorage.removeUserRoleDtoList[1].name}`)
      .set('authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`Volonterro-Access-Token=${accessToken}; Path=/; HttpOnly;`])
      .expect(HttpStatus.OK)
      .then(response => {
        expect(JSON.stringify(response.body)).toEqual(
          JSON.stringify(MockDataStorage.removeUserRoleDtoList[1]),
        );
        expect(MockDataStorage.items()).toEqual(
          initialData.filter(item => item.name !== MockDataStorage.removeUserRoleDtoList[1].name),
        );
        MockDataStorage.setDefaultItems();
      });
  });

  it('/user-roles/:name (DELETE) --> 404 NOT FOUND | User role with specified name was not found', () => {
    MockDataStorage.setDefaultItems();

    const initialData = [...MockDataStorage.items()];
    return request(app.getHttpServer())
      .delete(`/user-roles/${MockDataStorage.removeUserRoleDtoList[0].name}_not_existing_name`)
      .set('authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`Volonterro-Access-Token=${accessToken}; Path=/; HttpOnly;`])
      .expect(HttpStatus.NOT_FOUND)
      .then(() => {
        expect(MockDataStorage.items()).toEqual(initialData);
        MockDataStorage.setDefaultItems();
      });
  });
});
