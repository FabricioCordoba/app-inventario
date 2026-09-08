import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { EstadoInventario } from '../common/enums';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoriesService } from './inventories.service';

@Controller('inventories')
export class InventoriesController {
  constructor(private readonly inventoriesService: InventoriesService) {}

  @RequirePermissions('INVENTARIOS_VER')
  @Get()
  findAll(
    @Query('unidadId') unidadId?: string,
    @Query('responsableId') responsableId?: string,
    @Query('estado') estado?: string,
  ) {
    const parsedUnidadId = unidadId !== undefined ? Number(unidadId) : undefined;
    const parsedResponsableId =
      responsableId !== undefined ? Number(responsableId) : undefined;
    const parsedEstado =
      estado !== undefined ? (estado as EstadoInventario) : undefined;

    return this.inventoriesService.findAll(
      parsedUnidadId,
      parsedResponsableId,
      parsedEstado,
    );
  }

  @RequirePermissions('INVENTARIOS_VER')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoriesService.findOneById(id);
  }

  @RequirePermissions('INVENTARIOS_CREAR')
  @Post()
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoriesService.create(createInventoryDto);
  }

  @RequirePermissions('INVENTARIOS_EDITAR')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoriesService.update(id, updateInventoryDto);
  }

  @RequirePermissions('INVENTARIOS_CERRAR')
  @Patch(':id/close')
  close(@Param('id', ParseIntPipe) id: number) {
    return this.inventoriesService.close(id);
  }

  @RequirePermissions('INVENTARIOS_EDITAR')
  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.inventoriesService.cancel(id);
  }
}
