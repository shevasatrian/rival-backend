/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import slugify from 'slugify';

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBlogDto) {
    const baseSlug = slugify(dto.title, { lower: true, strict: true });

    let slug = baseSlug;
    let counter = 1;

    while (
      await this.prisma.blog.findUnique({
        where: { slug },
      })
    ) {
      slug = `${baseSlug}-${counter++}`;
    }

    return this.prisma.blog.create({
      data: {
        ...dto,
        slug,
        userId,
      },
    });
  }

  async update(userId: string, blogId: string, dto: UpdateBlogDto) {
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (blog.userId !== userId) {
      throw new ForbiddenException('You are not the owner');
    }

    return this.prisma.blog.update({
      where: { id: blogId },
      data: dto,
    });
  }

  async delete(userId: string, blogId: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (blog.userId !== userId) {
      throw new ForbiddenException('You are not the owner');
    }

    await this.prisma.blog.delete({
      where: { id: blogId },
    });

    return { message: 'Blog deleted successfully' };
  }

  async getMyBlogs(userId: string) {
    return this.prisma.blog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
  }

  async getById(userId: string, blogId: string) {
    const blog = await this.prisma.blog.findUnique({
        where: { id: blogId },
    });

    if (!blog) {
        throw new NotFoundException('Blog not found');
    }

    if (blog.userId !== userId) {
        throw new ForbiddenException('You are not the owner');
    }

    return blog;
  }

  //public
  async getBySlug(slug: string) {
    const blog = await this.prisma.blog.findFirst({
        where: {
        slug,
        isPublished: true,
        },
        include: {
        user: {
            select: {
            id: true,
            email: true,
            },
        },
        _count: {
            select: {
            likes: true,
            comments: true,
            },
        },
        },
    });

    if (!blog) {
        throw new NotFoundException('Blog not found');
    }

    return blog;
  }

  async getPublicFeed(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [blogs, total] = await this.prisma.$transaction([
        this.prisma.blog.findMany({
        where: { isPublished: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            title: true,
            slug: true,
            createdAt: true,
            user: {
            select: {
                id: true,
                email: true,
            },
            },
            _count: {
            select: {
                likes: true,
                comments: true,
            },
            },
        },
        }),
        this.prisma.blog.count({
        where: { isPublished: true },
        }),
    ]);

    const formatted = blogs.map((blog) => ({
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        createdAt: blog.createdAt,
        author: blog.user,
        likeCount: blog._count.likes,
        commentCount: blog._count.comments,
    }));

    return {
        data: formatted,
        meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        },
    };
  }

  async likeBlog(userId: string, blogId: string) {
    try {
        await this.prisma.like.create({
        data: {
            userId,
            blogId,
        },
        });
    } catch (error) {
        throw new BadRequestException('Already liked');
    }

    const count = await this.prisma.like.count({
        where: { blogId },
    });

    return { likes: count };
  }

  async unlikeBlog(userId: string, blogId: string) {
    await this.prisma.like.deleteMany({
        where: {
        userId,
        blogId,
        },
    });

    const count = await this.prisma.like.count({
        where: { blogId },
    });

    return { likes: count };
  }

  async getLikeStatus(userId: string, blogId: string) {
    const like = await this.prisma.like.findFirst({
        where: { userId, blogId },
    });
    return { isLiked: !!like };
  }

  async addComment(userId: string, blogId: string, content: string) {
    const comment = await this.prisma.comment.create({
        data: {
        content,
        userId,
        blogId,
        },
        include: {
        user: {
            select: {
            id: true,
            email: true,
            },
        },
        },
    });

    return comment;
  }

  async getComments(blogId: string) {
    return this.prisma.comment.findMany({
        where: { blogId },
        include: {
        user: {
            select: {
            id: true,
            email: true,
            },
        },
        },
        orderBy: {
        createdAt: 'desc',
        },
    });
  }

}