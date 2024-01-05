import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { UsersBanListRecordEntity } from './entities/users-ban-list-record.entity';
import { CreateUsersBanListRecordDto } from './dto/create-users-ban-list-record.dto';
import { UpdateUsersBanListRecordDto } from './dto/update-users-ban-list-record.dto';

@Injectable()
export class UsersBanListRecordService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<UsersBanListRecordEntity[]> {
    return this.prismaService.usersBanListRecord.findMany();
  }

  async findById(id: string): Promise<UsersBanListRecordEntity> {
    return this.prismaService.usersBanListRecord.findUniqueOrThrow({ where: { id } });
  }

  async create(data: CreateUsersBanListRecordDto): Promise<UsersBanListRecordEntity> {
    return this.prismaService.usersBanListRecord.create({ data });
  }

  async update(id: string, data: UpdateUsersBanListRecordDto): Promise<UsersBanListRecordEntity> {
    return this.prismaService.usersBanListRecord.update({ where: { id }, data });
  }

  async remove(id: string): Promise<UsersBanListRecordEntity> {
    return this.prismaService.usersBanListRecord.delete({ where: { id } });
  }
}
