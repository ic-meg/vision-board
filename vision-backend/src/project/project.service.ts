import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        // Accept YYYY-MM-DD from UI and let Prisma parse
        dueDate: new Date(data.dueDate),
        ownerId: data.ownerId ?? null,
      },
    });
  }

  findAll(ownerId?: number) {
    return this.prisma.project.findMany({
      where: ownerId ? { ownerId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { tasks: true } },
        tasks: { select: { status: true } },
      } as any,
    }).then((projects: any[]) =>
      projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description ?? '',
        dueDate: p.dueDate.toISOString().slice(0, 10),
        tasksTotal: p._count?.tasks ?? 0,
        tasksCompleted: p.tasks.filter((t: any) => t.status === 'completed').length,
      })),
    );
  }

  findOne(id: number) {
    return this.prisma.project.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateProjectDto) {
    return this.prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
    });
  }

  remove(id: number) {
    // Delete related tasks first to satisfy FK constraints, then the project
    return this.prisma.$transaction([
      this.prisma.task.deleteMany({ where: { projectId: id } }),
      this.prisma.project.delete({ where: { id } }),
    ]);
  }
}
