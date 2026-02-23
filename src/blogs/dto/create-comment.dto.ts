/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(2)
  content: string;
}
