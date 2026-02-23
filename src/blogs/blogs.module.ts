import { Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { PublicController } from 'src/public/public.controller';

@Module({
  providers: [BlogsService],
  controllers: [BlogsController, PublicController],
})
export class BlogsModule {}
