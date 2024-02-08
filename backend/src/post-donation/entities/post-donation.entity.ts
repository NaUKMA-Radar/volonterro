import { ApiProperty } from '@nestjs/swagger';
import { PostDonation } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsDecimal,
  IsDefined,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MaxDate,
  MaxLength,
  Validate,
} from 'class-validator';
import { DecimalMin } from 'src/core/validation/decorators/decimal-min.decorator';
import { PostEntity } from 'src/post/entities/post.entity';

export class PostDonationEntity implements PostDonation {
  @ApiProperty({
    description: 'Post donation uuid',
    examples: ['b7af9cd4-5533-4737-862b-78bce985c987', '989d32c2-abd4-43d3-a420-ee175ae16b98'],
    default: 'b7af9cd4-5533-4737-862b-78bce985c987',
  })
  @IsUUID()
  @IsNotEmpty()
  @IsDefined()
  id: string;

  @ApiProperty({
    description: 'Post uuid',
    examples: ['b7af9cd4-5533-4737-862b-78bce985c987', '989d32c2-abd4-43d3-a420-ee175ae16b98'],
    default: '989d32c2-abd4-43d3-a420-ee175ae16b98',
  })
  @IsUUID()
  @IsNotEmpty()
  @IsDefined()
  postId: string;

  @ApiProperty({
    description: 'The card number of donater of the post donation',
    examples: ['1234567890987654', '5594148605144157', '9684037525861053'],
    default: '5594148605144157',
  })
  @Matches(/^\d{16}$/gu)
  @MaxLength(16)
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  cardNumber: string;

  @ApiProperty({
    description: 'The amount of money of the donation',
    examples: [1551.6, 1000.0, 8500.5],
    default: 8500.5,
  })
  @Transform(value => new Decimal(value.value))
  @Validate(DecimalMin, [0.01])
  @IsDecimal()
  @IsDefined()
  donation: Decimal;

  @ApiProperty({
    description: 'The date and time of the post donation',
    examples: [new Date('2024-01-03'), new Date('2023-11-02'), new Date('2023-06-30')],
    default: new Date('2023-06-30'),
  })
  @IsDate()
  @MaxDate(new Date())
  @IsNotEmpty()
  @IsDefined()
  datetime: Date;

  @ApiProperty({ description: 'The nested post object of this post donation' })
  post?: PostEntity;
}
