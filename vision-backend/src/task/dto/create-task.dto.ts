export class CreateTaskDto {
	title: string;
	description?: string;
	projectId: number;
	dueDate: string; // ISO date string from UI (YYYY-MM-DD)
	status?: 'todo' | 'in_progress' | 'completed' | 'open' | 'overdue';
	priority?: 'low' | 'medium' | 'high';
	assigneeId?: number | null;
}
