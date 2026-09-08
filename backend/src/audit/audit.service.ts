import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auditoria } from './entities/auditoria.entity';

export interface AuditLogInput {
  usuarioId?: number | null;
  accion: string;
  entidad: string;
  entidadId?: number | null;
  descripcion?: string | null;
  metadataJson?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(Auditoria)
    private readonly auditoriaRepository: Repository<Auditoria>,
  ) {}

  async log(input: AuditLogInput): Promise<void> {
    const registro = this.auditoriaRepository.create({
      usuarioId: input.usuarioId ?? null,
      accion: input.accion,
      entidad: input.entidad,
      entidadId: input.entidadId ?? null,
      descripcion: input.descripcion ?? null,
      metadataJson: input.metadataJson ?? null,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
    });

    await this.auditoriaRepository.save(registro);
  }
}
