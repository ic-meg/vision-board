export class CreateProjectDto {
	name: string;
	description?: string;
	status?: 'planning' | 'active' | 'completed';
	phase?: string | null;
	dueDate: string; // ISO date string from UI (YYYY-MM-DD)
	ownerId?: number;
}
