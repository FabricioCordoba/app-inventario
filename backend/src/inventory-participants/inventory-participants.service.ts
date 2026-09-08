import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoInventario } from '../common/enums';
import { Inventario } from '../inventories/entities/inventario.entity';
import { Usuario } from '../users/entities/usuario.entity';
import { CreateInventoryParticipantDto } from './dto/create-inventory-participant.dto';
import { UpdateInventoryParticipantDto } from './dto/update-inventory-participant.dto';
import { InventarioParticipante } from './entities/inventario-participante.entity';

@Injectable()
export class InventoryParticipantsService {
    constructor(
        @InjectRepository(InventarioParticipante)
        private readonly participanteRepository: Repository<InventarioParticipante>,
        @InjectRepository(Inventario)
        private readonly inventarioRepository: Repository<Inventario>,
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
    ) { }

    async findAll(
        inventarioId?: number,
        usuarioId?: number,
    ): Promise<InventarioParticipante[]> {
        return this.participanteRepository.find({
            where: {
                ...(inventarioId !== undefined ? { inventarioId } : {}),
                ...(usuarioId !== undefined ? { usuarioId } : {}),
            },
            order: { id: 'ASC' },
            relations: { inventario: true, usuario: true },
        });
    }

    async findOneById(id: number): Promise<InventarioParticipante> {
        const participante = await this.participanteRepository.findOne({
            where: { id },
            relations: { inventario: true, usuario: true },
        });

        if (!participante) {
            throw new NotFoundException('Participante no encontrado');
        }

        return participante;
    }

    private async validateInventoryAndUser(
        inventarioId: number,
        usuarioId: number,
    ): Promise<Inventario> {
        const inventario = await this.inventarioRepository.findOne({
            where: { id: inventarioId },
        });

        if (!inventario) {
            throw new NotFoundException('Inventario no encontrado');
        }

        if (
            inventario.estado === EstadoInventario.CERRADO ||
            inventario.estado === EstadoInventario.CANCELADO
        ) {
            throw new BadRequestException(
                'No se pueden modificar participantes en un inventario cerrado o cancelado',
            );
        }

        const usuario = await this.usuarioRepository.findOne({
            where: { id: usuarioId },
        });

        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }

        if (!usuario.activo) {
            throw new BadRequestException(
                'No se puede asignar un usuario inactivo como participante',
            );
        }

        return inventario;
    }

    async create(
        createDto: CreateInventoryParticipantDto,
    ): Promise<InventarioParticipante> {
        await this.validateInventoryAndUser(
            createDto.inventarioId,
            createDto.usuarioId,
        );

        const existing = await this.participanteRepository.findOne({
            where: {
                inventarioId: createDto.inventarioId,
                usuarioId: createDto.usuarioId,
            },
        });

        if (existing) {
            throw new BadRequestException(
                'Ese usuario ya participa en el inventario',
            );
        }

        const participacion = this.participanteRepository.create({
            ...createDto,
            esResponsable: createDto.esResponsable ?? false,
        });

        if (participacion.esResponsable) {
            await this.participanteRepository.update(
                { inventarioId: createDto.inventarioId, esResponsable: true },
                { esResponsable: false },
            );

            const inventario = await this.inventarioRepository.findOne({
                where: { id: createDto.inventarioId },
            });

            if (inventario) {
                inventario.responsableId = createDto.usuarioId;
                await this.inventarioRepository.save(inventario);
            }
        }

        return this.participanteRepository.save(participacion);
    }

    async update(
        id: number,
        updateDto: UpdateInventoryParticipantDto,
    ): Promise<InventarioParticipante> {
        const participante = await this.findOneById(id);

        if (updateDto.usuarioId !== undefined) {
            await this.validateInventoryAndUser(
                participante.inventarioId,
                updateDto.usuarioId,
            );

            const duplicate = await this.participanteRepository.findOne({
                where: {
                    inventarioId: participante.inventarioId,
                    usuarioId: updateDto.usuarioId,
                },
            });

            if (duplicate && duplicate.id !== id) {
                throw new BadRequestException(
                    'Ese usuario ya participa en el inventario',
                );
            }

            participante.usuarioId = updateDto.usuarioId;
        }

        if (updateDto.esResponsable !== undefined) {
            if (updateDto.esResponsable) {
                await this.participanteRepository.update(
                    { inventarioId: participante.inventarioId, esResponsable: true },
                    { esResponsable: false },
                );

                const inventario = await this.inventarioRepository.findOne({
                    where: { id: participante.inventarioId },
                });

                if (inventario) {
                    inventario.responsableId = participante.usuarioId;
                    await this.inventarioRepository.save(inventario);
                }
            }

            participante.esResponsable = updateDto.esResponsable;
        }

        await this.participanteRepository.save(participante);
        return this.findOneById(id);
    }

    async remove(id: number): Promise<{ message: string }> {
        const participante = await this.findOneById(id);

        await this.participanteRepository.delete(id);

        if (participante.esResponsable) {
            const remaining = await this.participanteRepository.find({
                where: { inventarioId: participante.inventarioId },
                order: { id: 'ASC' },
            });

            if (remaining.length > 0) {
                const nextResponsible = remaining[0];
                nextResponsible.esResponsable = true;
                await this.participanteRepository.save(nextResponsible);

                const inventario = await this.inventarioRepository.findOne({
                    where: { id: participante.inventarioId },
                });

                if (inventario) {
                    inventario.responsableId = nextResponsible.usuarioId;
                    await this.inventarioRepository.save(inventario);
                }
            }
        }

        return { message: 'Participante eliminado con éxito' };
    }
}
