import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Inventario } from '../inventories/entities/inventario.entity';
import { Usuario } from '../users/entities/usuario.entity';
import { InventarioParticipante } from './entities/inventario-participante.entity';
import { InventoryParticipantsService } from './inventory-participants.service';

describe('InventoryParticipantsService', () => {
    let service: InventoryParticipantsService;

    const participanteRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
    };

    const inventarioRepo = {
        findOne: jest.fn(),
        save: jest.fn(),
    };

    const usuarioRepo = {
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                InventoryParticipantsService,
                {
                    provide: getRepositoryToken(InventarioParticipante),
                    useValue: participanteRepo,
                },
                { provide: getRepositoryToken(Inventario), useValue: inventarioRepo },
                { provide: getRepositoryToken(Usuario), useValue: usuarioRepo },
            ],
        }).compile();

        service = moduleRef.get<InventoryParticipantsService>(
            InventoryParticipantsService,
        );
        jest.clearAllMocks();
    });

    it('should create a participant and set them as responsible', async () => {
        inventarioRepo.findOne.mockResolvedValue({ id: 9, estado: 'EN_PROCESO', responsableId: 2 });
        usuarioRepo.findOne.mockResolvedValue({ id: 5, activo: true, nombre: 'María' });
        participanteRepo.findOne.mockResolvedValue(null);
        participanteRepo.create.mockImplementation((dto) => dto);
        participanteRepo.save.mockImplementation((dto) => Promise.resolve({ id: 11, ...dto }));

        const result = await service.create({
            inventarioId: 9,
            usuarioId: 5,
            esResponsable: true,
        });

        expect(result.esResponsable).toBe(true);
        expect(participanteRepo.save).toHaveBeenCalled();
    });

    it('should reject a duplicate participant in the same inventory', async () => {
        inventarioRepo.findOne.mockResolvedValue({ id: 9, estado: 'EN_PROCESO', responsableId: 2 });
        usuarioRepo.findOne.mockResolvedValue({ id: 5, activo: true });
        participanteRepo.findOne.mockResolvedValue({ id: 12, inventarioId: 9, usuarioId: 5 });

        await expect(
            service.create({ inventarioId: 9, usuarioId: 5 }),
        ).rejects.toThrow(BadRequestException);
    });

    it('should reject inactive users as participants', async () => {
        inventarioRepo.findOne.mockResolvedValue({ id: 9, estado: 'EN_PROCESO', responsableId: 2 });
        usuarioRepo.findOne.mockResolvedValue({ id: 6, activo: false });

        await expect(
            service.create({ inventarioId: 9, usuarioId: 6 }),
        ).rejects.toThrow(BadRequestException);
    });
});
