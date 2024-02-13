import { ApiProperty } from '@nestjs/swagger';
import { ChatMessageAttachment } from '@prisma/client';
import { IsDefined, IsNotEmpty, IsString, IsUUID, MaxLength, ValidateIf } from 'class-validator';
import { ChatMessageEntity } from 'src/chat-message/entities/chat-message.entity';

export class ChatMessageAttachmentEntity implements ChatMessageAttachment {
  @ApiProperty({
    description: 'The uuid of chat message attachment',
    examples: ['b7af9cd4-5533-4737-862b-78bce985c987', '989d32c2-abd4-43d3-a420-ee175ae16b98'],
    default: '989d32c2-abd4-43d3-a420-ee175ae16b98',
  })
  @IsUUID()
  @IsNotEmpty()
  @IsDefined()
  id: string;

  @ApiProperty({
    description: 'The uuid of chat message of the chat message attachment',
    examples: ['b7af9cd4-5533-4737-862b-78bce985c987', '989d32c2-abd4-43d3-a420-ee175ae16b98'],
    default: 'b7af9cd4-5533-4737-862b-78bce985c987',
  })
  @IsUUID()
  @IsNotEmpty()
  @IsDefined()
  messageId: string;

  @ApiProperty({
    description: 'The filepath of chat message attachment',
    examples: [
      'chat_message_attachments/989d32c2-abd4-43d3-a420-ee175ae16b98.pptx',
      'chat_message_attachments/b7af9cd4-5533-4737-862b-78bce985c987.jpg',
      'chat_message_attachments/jg741k58-9471-5432-581g-25fal951o571.txt',
    ],
    default: 'chat_message_attachments/jg741k58-9471-5432-581g-25fal951o571.txt',
  })
  @IsString()
  @MaxLength(255)
  @IsDefined()
  file: string;

  @ApiProperty({
    description: 'Custom filename of the file of the chat message attachment',
    examples: ['Image', 'Attachment_123', 'Document'],
    default: 'Image',
  })
  @IsString()
  @MaxLength(255)
  @ValidateIf((_, value) => value)
  filename: string | null;

  @ApiProperty({
    description: 'Resource type of the file of the chat message attachment',
    examples: ['raw', 'image', 'video'],
    default: 'raw',
  })
  @IsString()
  @MaxLength(255)
  @IsDefined()
  resourceType: string;

  @ApiProperty({ description: 'Nested message object for this chat message attachment' })
  message?: ChatMessageEntity;
}
