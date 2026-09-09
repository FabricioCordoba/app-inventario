import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EstadoInventario } from '../common/enums';
import { Inventario } from './entities/inventario.entity';
import { InventoriesService } from './inventories.service';
import { Unidad } from '../units/entities/unidad.entity';
import { Usuario } from '../users/entities/usuario.entity';
import { InventoryItemsService } from '../inventory-items/inventory-items.service';
import { InventarioParticipante } from '../inventory-participants/entities/inventario-participante.entity';

describe('InventoriesService', () => {
  let service: InventoriesService;
  const inventarioRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const unidadRepo = {
    findOne: jest.fn(),
  };
  const usuarioRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const participanteRepo = {
    create: jest.fn((dto) => dto),
    save: jest.fn((dto) => Promise.resolve(dto)),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        InventoriesService,
        { provide: getRepositoryToken(Inventario), useValue: inventarioRepo },
        { provide: getRepositoryToken(Unidad), useValue: unidadRepo },
        { provide: getRepositoryToken(Usuario), useValue: usuarioRepo },
        { provide: getRepositoryToken(InventarioParticipante), useValue: participanteRepo },
        { provide: InventoryItemsService, useValue: { generateForInventory: jest.fn() } },
      ],
    }).compile();

    service = moduleRef.get<InventoriesService>(InventoriesService);
    jest.clearAllMocks();
  });

  it('should create an inventory with default in-progress status', async () => {
    unidadRepo.findOne.mockResolvedValue({ id: 1, numero: 'U-01' });
    usuarioRepo.findOne.mockResolvedValue({ id: 2, activo: true, nombre: 'Ana' });
    usuarioRepo.find.mockResolvedValue([{ id: 2, activo: true, jerarquia: { nivel: 1 } }]);
    inventarioRepo.create.mockImplementation((dto) => dto);
    inventarioRepo.save.mockImplementation((dto) => Promise.resolve({ id: 10, ...dto }));

    const result = await service.create({
      unidadId: 1,
      responsableId: 2,
      observacionesGenerales: 'Control de stock',
    });

    expect(result.estado).toBe(EstadoInventario.EN_PROCESO);
    expect(inventarioRepo.save).toHaveBeenCalled();
  });

  it('should reject creating inventory for an inactive responsible user', async () => {
    unidadRepo.findOne.mockResolvedValue({ id: 1, numero: 'U-01' });
    usuarioRepo.findOne.mockResolvedValue({ id: 2, activo: false });
    usuarioRepo.find.mockResolvedValue([]);

    await expect(
      service.create({ unidadId: 1, responsableId: 2 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject inventory creation when unit does not exist', async () => {
    unidadRepo.findOne.mockResolvedValue(null);

    await expect(
      service.create({ unidadId: 999, responsableId: 2 }),
    ).rejects.toThrow(NotFoundException);
  });
});
