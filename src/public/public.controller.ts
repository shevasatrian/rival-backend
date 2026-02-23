/* eslint-disable prettier/prettier */
import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlogsService } from '../blogs/blogs.service';
import { Throttle } from '@nestjs/throttler';

@Controller('public')
export class PublicController {
  constructor(private blogsService: BlogsService) {}

  @Throttle({ short: { ttl: 1000, limit: 3 }, long: { ttl: 60000, limit: 30 } })
  @Get('blogs/:slug')
  getBlog(@Param('slug') slug: string) {
    return this.blogsService.getBySlug(slug);
  }

  @Throttle({ short: { ttl: 1000, limit: 3 }, long: { ttl: 60000, limit: 30 } })
  @Get('feed')
  getFeed(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.blogsService.getPublicFeed(
      Number(page),
      Number(limit),
    );
  }
}