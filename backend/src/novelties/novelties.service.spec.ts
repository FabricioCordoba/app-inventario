import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EstadoNovedad } from '../common/enums';
import { Inventario } from '../inventories/entities/inventario.entity';
import { Material } from '../materials/entities/material.entity';
import { Sector } from '../sectors/entities/sector.entity';
import { Unidad } from '../units/entities/unidad.entity';
import { Usuario } from '../users/entities/usuario.entity';
import { Novedad } from './entities/novedad.entity';
import { NoveltiesService } from './novelties.service';

describe('NoveltiesService', () => {
    let service: NoveltiesService;

    const novedadRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
    };

    const inventarioRepo = {
        findOne: jest.fn(),
    };

    const unidadRepo = {
        findOne: jest.fn(),
    };

    const usuarioRepo = {
        findOne: jest.fn(),
    };

    const sectorRepo = {
        findOne: jest.fn(),
    };

    const materialRepo = {
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                NoveltiesService,
                { provide: getRepositoryToken(Novedad), useValue: novedadRepo },
                { provide: getRepositoryToken(Inventario), useValue: inventarioRepo },
                { provide: getRepositoryToken(Unidad), useValue: unidadRepo },
                { provide: getRepositoryToken(Sector), useValue: sectorRepo },
                { provide: getRepositoryToken(Material), useValue: materialRepo },
                { provide: getRepositoryToken(Usuario), useValue: usuarioRepo },
            ],
        }).compile();

        service = moduleRef.get<NoveltiesService>(NoveltiesService);
        jest.clearAllMocks();
    });

    it('should create a novelty with pending status', async () => {
        inventarioRepo.findOne.mockResolvedValue({ id: 7, unidadId: 3, estado: 'EN_PROCESO' });
        unidadRepo.findOne.mockResolvedValue({ id: 3, activo: true });
        usuarioRepo.findOne.mockResolvedValue({ id: 10, activo: true });
        novedadRepo.create.mockImplementation((dto) => dto);
        novedadRepo.save.mockImplementation((dto) => Promise.resolve({ id: 40, ...dto }));

        const result = await service.create({
            inventarioId: 7,
            unidadId: 3,
            descripcion: 'Falta material en sector',
            registradoPorId: 10,
        });

        expect(result.estado).toBe(EstadoNovedad.PENDIENTE);
        expect(novedadRepo.save).toHaveBeenCalled();
    });

    it('should reject a novelty for a missing unit', async () => {
        unidadRepo.findOne.mockResolvedValue(null);

        await expect(
            service.create({
                unidadId: 999,
                descripcion: 'No debería existir',
                registradoPorId: 10,
            }),
        ).rejects.toThrow(NotFoundException);
    });

    it('should reject resolving a novelty without resolver user', async () => {
        novedadRepo.findOne.mockResolvedValue({
            id: 10,
            estado: EstadoNovedad.PENDIENTE,
            registradoPorId: 10,
        });

        await expect(
            service.resolve(10, 0, 'Se cerró'),
        ).rejects.toThrow(BadRequestException);
    });
});
