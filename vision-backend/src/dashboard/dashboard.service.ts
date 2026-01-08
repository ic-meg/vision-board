import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
	constructor(private readonly prisma: PrismaService) {}

	async getOverview() {
		const [projects, tasks] = await Promise.all([
			this.prisma.project.findMany({
				orderBy: { createdAt: 'desc' },
				include: {
					_count: { select: { tasks: true } },
					tasks: { select: { status: true } },
				} as any,
			}),
			this.prisma.task.findMany({ orderBy: { dueDate: 'asc' } }),
		]);

		const mappedProjects = projects.map((p: any) => ({
			id: p.id,
			name: p.name,
			description: p.description ?? '',
			status: p.status,
			phase: p.phase ?? 'planning',
			progress: p.progress ?? 0,
			startDate: p.startDate ? p.startDate.toISOString().slice(0, 10) : '',
			endDate: p.endDate ? p.endDate.toISOString().slice(0, 10) : '',
			dueDate: p.dueDate.toISOString().slice(0, 10),
			tasksTotal: p._count?.tasks ?? 0,
			tasksCompleted: p.tasks.filter((t: any) => t.status === 'completed').length,
		}));

		const mappedTasks = tasks.map((t) => ({
			id: t.id,
			title: t.title,
			description: t.description ?? '',
			projectId: t.projectId,
			dueDate: t.dueDate.toISOString().slice(0, 10),
			status: t.status === 'in_progress' ? 'in-progress' : t.status,
			priority: t.priority,
			assigneeId: t.assigneeId ?? undefined,
		}));

		const totalProjects = mappedProjects.length;
		const totalTasks = mappedTasks.length;
		const inProgress = mappedProjects.filter(
			(project) => project.tasksCompleted > 0 && project.tasksCompleted < project.tasksTotal,
		).length;
		const completed = mappedProjects.filter(
			(project) => project.tasksCompleted === project.tasksTotal && project.tasksTotal > 0,
		).length;
		const overdue = mappedTasks.filter((task) => task.status === 'overdue').length;

		const stats = { totalProjects, totalTasks, inProgress, completed, overdue };
		const recentProjects = mappedProjects.slice(0, 3);
		const upcomingTasks = mappedTasks.slice(0, 5);

		return { stats, recentProjects, upcomingTasks };
	}
}
