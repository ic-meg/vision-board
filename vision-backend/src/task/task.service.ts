import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

function mapUiStatusToDb(status: string | undefined) {
  if (!status) return undefined;
  if (status === 'in-progress') return 'in_progress';
  return status;
}

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        projectId: data.projectId,
        dueDate: new Date(data.dueDate),
        status: mapUiStatusToDb(data.status ?? 'open') as any,
        priority: (data.priority ?? 'medium') as any,
        assigneeId: data.assigneeId ?? null,
      },
    });
  }

  findAll(ownerId?: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.task.findMany({
      where: ownerId ? { project: { ownerId } } : undefined,
      orderBy: { dueDate: 'asc' },
    }).then((tasks) =>
      tasks.map((t) => {
        const isOverdue = t.status !== 'completed' && t.dueDate < today;
        const baseStatus = t.status === 'in_progress' ? 'in-progress' : t.status;

        return {
          id: t.id,
          title: t.title,
          description: t.description ?? '',
          projectId: t.projectId,
          dueDate: t.dueDate.toISOString().slice(0, 10),
          status: isOverdue ? 'overdue' : baseStatus,
          priority: t.priority,
          assigneeId: t.assigneeId ?? undefined,
        };
      }),
    );
  }

  findOne(id: number) {
    return this.prisma.task.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateTaskDto) {
    return this.prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: mapUiStatusToDb(data.status) as any,
        priority: data.priority as any,
        assigneeId: data.assigneeId,
      },
    });
  }

  remove(id: number) {
    return this.prisma.task.delete({ where: { id } });
  }
}
