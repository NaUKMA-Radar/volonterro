import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { PostModule } from 'src/post/post.module';
import { MockDataStorage, mockPostRepository } from './post.mock';
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

describe('PostController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PostModule],
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
      .useValue(mockPostRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(ValidationPipes.validationPipe);
    app.useGlobalFilters(new AllExceptionFilter(app.get(HttpAdapterHost)));
    app.use(cookieParser());
    await app.init();
  });

  it('/posts (GET) --> 200 OK', () => {
    MockDataStorage.setDefaultItems();

    const initialData = [...MockDataStorage.items()];
    return request(app.getHttpServer())
      .get('/posts')
      .set('authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`Volonterro-Access-Token=${accessToken}; Path=/; HttpOnly;`])
      .expect(HttpStatus.OK)
      .then(response => {
        expect(JSON.stringify(response.body)).toEqual(JSON.stringify(MockDataStorage.items()));
        expect(MockDataStorage.items()).toEqual(initialData);
        MockDataStorage.setDefaultItems();
      });
  });

  it('/posts/:id (GET) --> 200 OK', () => {
    MockDataStorage.setDefaultItems();

    const initialData = [...MockDataStorage.items()];
    return request(app.getHttpServer())
      .get(`/posts/${MockDataStorage.items()[0].id}`)
      .set('authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`Volonterro-Access-Token=${accessToken}; Path=/; HttpOnly;`])
      .expect(HttpStatus.OK)
      .then(response => {
        expect(JSON.stringify(response.body)).toEqual(JSON.stringify(MockDataStorage.items()[0]));
        expect(MockDataStorage.items()).toEqual(initialData);
        MockDataStorage.setDefaultItems();
      });
  });

  it('/posts/:id (GET) --> 404 NOT FOUND | Post with specified id was not found', () => {
    MockDataStorage.setDefaultItems();

    const initialData = [...MockDataStorage.items()];
    return request(app.getHttpServer())
      .get(`/posts/${MockDataStorage.items()[0].id}_not_existing_id`)
      .set('authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`Volonterro-Access-Token=${accessToken}; Path=/; HttpOnly;`])
      .expect(HttpStatus.NOT_FOUND)
      .then(() => {
        expect(MockDataStorage.items()).toEqual(initialData);
        MockDataStorage.setDefaultItems();
      });
  });

  it('/posts (POST) --> 201 CREATED', () => {
    MockDataStorage.setDefaultItems();

    const initialData = [...MockDataStorage.items()];
    return request(app.getHttpServer())
      .post('/posts')
      .set('authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`Volonterro-Access-Token=${accessToken}; Path=/; HttpOnly;`])
      .send(MockDataStorage.createPostDtoList[0])
      .expect(HttpStatus.CREATED)
      .then(response => {
        expect(JSON.stringify(response.body)).toEqual(
          JSON.stringify({ ...response.body, ...MockDataStorage.createPostDtoList[0] }),
        );
        expect(JSON.stringify(MockDataStorage.items())).toEqual(
          JSON.stringify([...initialData, response.body]),
        );
        MockDataStorage.setDefaultItems();
      });
  });

  it('/posts (POST) --> 409 CONFLICT | Create post dto has invalid format', () => {
    MockDataStorage.setDefaultItems();

    const initialData = [...MockDataStorage.items()];
    return request(app.getHttpServer())
      .post('/posts')
      .set('authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`Volonterro-Access-Token=${accessToken}; Path=/; HttpOnly;`])
      .send({ ...MockDataStorage.items()[0], asdasd: 123 })
      .expect(HttpStatus.CONFLICT)
      .then(() => {
        expect(MockDataStorage.items()).toEqual(initialData);
        MockDataStorage.setDefaultItems();
      });
  });

  it('/posts/:id (PUT) --> 200 OK', () => {
    MockDataStorage.setDefaultItems();

    const initialData = [...MockDataStorage.items()];
    return request(app.getHttpServer())
      .put(`/posts/${MockDataStorage.updatePostDtoList[0].id}`)
      .set('authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`Volonterro-Access-Token=${accessToken}; Path=/; HttpOnly;`])
      .send(MockDataStorage.updatePostDtoList[0].data)
      .expect(HttpStatus.OK)
      .then(response => {
        expect(JSON.stringify(response.body)).toEqual(
          JSON.stringify(
            Object.assign(
              {},
              MockDataStorage.items().find(
                item => item.id === MockDataStorage.updatePostDtoList[0].id,
              ),
              MockDataStorage.updatePostDtoList[0].data,
            ),
          ),
        );
        expect(JSON.stringify(MockDataStorage.items())).toEqual(
          JSON.stringify(
            initialData.map(item => (item.id === response.body.id ? response.body : item)),
          ),
        );
        MockDataStorage.setDefaultItems();
      });
  });

  it('/posts/:id (PUT) --> 404 NOT FOUND | Post with specified id was not found', () => {
    MockDataStorage.setDefaultItems();

    const initialData = [...MockDataStorage.items()];
    return request(app.getHttpServer())
      .put(`/posts/${MockDataStorage.items()[0].id}_not_existing_id`)
      .set('authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`Volonterro-Access-Token=${accessToken}; Path=/; HttpOnly;`])
      .send(MockDataStorage.updatePostDtoList[0].data)
      .expect(HttpStatus.NOT_FOUND)
      .then(() => {
        expect(MockDataStorage.items()).toEqual(initialData);
        MockDataStorage.setDefaultItems();
      });
  });

  it('/posts/:id (DELETE) --> 200 OK', () => {
    MockDataStorage.setDefaultItems();

    const initialData = [...MockDataStorage.items()];
    return request(app.getHttpServer())
      .delete(`/posts/${MockDataStorage.removePostDtoList[1].id}`)
      .set('authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`Volonterro-Access-Token=${accessToken}; Path=/; HttpOnly;`])
      .expect(HttpStatus.OK)
      .then(response => {
        expect(JSON.stringify(response.body)).toEqual(
          JSON.stringify({
            ...MockDataStorage.removePostDtoList[1],
            createdAt: response.body.createdAt,
            updatedAt: response.body.updatedAt,
            removedAt: response.body.removedAt,
          }),
        );
        expect(MockDataStorage.items()).toEqual(
          initialData.filter(item => item.id !== MockDataStorage.removePostDtoList[1].id),
        );
        MockDataStorage.setDefaultItems();
      });
  });

  it('/posts/:id (DELETE) --> 404 NOT FOUND | Post with specified id was not found', () => {
    MockDataStorage.setDefaultItems();

    const initialData = [...MockDataStorage.items()];
    return request(app.getHttpServer())
      .delete(`/posts/${MockDataStorage.removePostDtoList[0].id}_not_existing_id`)
      .set('authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`Volonterro-Access-Token=${accessToken}; Path=/; HttpOnly;`])
      .expect(HttpStatus.NOT_FOUND)
      .then(() => {
        expect(MockDataStorage.items()).toEqual(initialData);
        MockDataStorage.setDefaultItems();
      });
  });
});
