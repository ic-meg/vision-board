import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AuthService {
	constructor(private readonly prisma: PrismaService) {}

	async create(data: CreateUserDto) {
		const user = await this.prisma.user.create({
			data: {
				name: data.name,
				email: data.email,
				passwordHash: data.passwordHash ?? null,
			},
		});
		const { passwordHash, ...safe } = user;
		return safe;
	}

	async findAll() {
		const users = await this.prisma.user.findMany();
		return users.map(({ passwordHash, ...u }) => u);
	}

	async findOne(id: number) {
		const user = await this.prisma.user.findUnique({ where: { id } });
		if (!user) return null;
		const { passwordHash, ...safe } = user;
		return safe;
	}

	async signIn(email: string, password: string) {
		const user = await this.prisma.user.findUnique({ where: { email } });
		if (!user) {
			throw new UnauthorizedException('No account found with this email');
		}
		if (user.passwordHash !== password) {
			throw new UnauthorizedException('Incorrect password');
		}
		const { passwordHash, ...safe } = user;
		return safe;
	}

	async update(id: number, data: UpdateUserDto) {
		const user = await this.prisma.user.update({
			where: { id },
			data: {
				name: data.name,
				email: data.email,
				passwordHash: data.passwordHash,
			},
		});
		const { passwordHash, role, avatar, ...safe } = user;
		return safe;
	}

	async remove(id: number) {
		// Clean up relations before deleting the user to satisfy FKs
		const [user] = await this.prisma.$transaction([
			// Unassign as owner from projects
			this.prisma.project.updateMany({ where: { ownerId: id }, data: { ownerId: null } }),
			// Unassign from tasks
			this.prisma.task.updateMany({ where: { assigneeId: id }, data: { assigneeId: null } }),
			// Remove project memberships
			this.prisma.projectMember.deleteMany({ where: { userId: id } }),
			// Finally delete the user
			this.prisma.user.delete({ where: { id } }),
		]);
		const { passwordHash, ...safe } = user as any;
		return safe;
	}
}
