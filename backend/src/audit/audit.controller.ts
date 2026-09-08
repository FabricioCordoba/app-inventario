import { Controller, Get, Query } from '@nestjs/common';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { AuditService } from './audit.service';
import { Auditoria } from './entities/auditoria.entity';

@Controller('audit')
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @RequirePermissions('AUDITORIA_VER')
    @Get()
    findAll(
        @Query('usuarioId') usuarioId?: string,
        @Query('entidad') entidad?: string,
    ): Promise<Auditoria[]> {
        const query = this.auditService['auditoriaRepository'];
        const where: Record<string, unknown> = {};

        if (usuarioId !== undefined) {
            where.usuarioId = Number(usuarioId);
        }

        if (entidad !== undefined) {
            where.entidad = entidad;
        }

        return query.find({
            where,
            order: { createdAt: 'DESC' },
            relations: { usuario: true },
        });
    }
}
