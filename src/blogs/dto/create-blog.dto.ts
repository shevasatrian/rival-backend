/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsBoolean, IsString, MinLength } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  content: string;

  @IsBoolean()
  isPublished: boolean;
}