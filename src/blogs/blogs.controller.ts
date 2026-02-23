/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('blogs')
@UseGuards(JwtAuthGuard) // 🔥 protected dashboard routes
export class BlogsController {
  constructor(private blogsService: BlogsService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateBlogDto) {
    return this.blogsService.create(req.user.userId, dto);
  }

  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdateBlogDto) {
    return this.blogsService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  delete(@Req() req, @Param('id') id: string) {
    return this.blogsService.delete(req.user.userId, id);
  }

  @Get('my')
  getMy(@Req() req) {
    return this.blogsService.getMyBlogs(req.user.userId);
  }

  @Get(':id')
    getById(@Req() req, @Param('id') id: string) {
    return this.blogsService.getById(req.user.userId, id);
 }

  @Post(':id/like')
  like(@Req() req, @Param('id') id: string) {
    return this.blogsService.likeBlog(req.user.userId, id);
  }

  @Delete(':id/like')
  unlike(@Req() req, @Param('id') id: string) {
    return this.blogsService.unlikeBlog(req.user.userId, id);
  }

  @Get(':id/like/status')
    getLikeStatus(@Req() req, @Param('id') id: string) {
    return this.blogsService.getLikeStatus(req.user.userId, id);
  }

  @Post(':id/comments')
  addComment(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.blogsService.addComment(
        req.user.userId,
        id,
        dto.content,
    );
  }

  @Get(':id/comments')
    getComments(@Param('id') id: string) {
    return this.blogsService.getComments(id);
  }
}