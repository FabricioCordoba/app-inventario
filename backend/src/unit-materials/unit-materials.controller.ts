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
import { CreateUnitMaterialDto } from './dto/create-unit-material.dto';
import { UpdateUnitMaterialDto } from './dto/update-unit-material.dto';
import { UnitMaterialsService } from './unit-materials.service';

@Controller('unit-materials')
export class UnitMaterialsController {
  constructor(private readonly service: UnitMaterialsService) {}

  @RequirePermissions('UNIDAD_MATERIALES_VER')
  @Get()
  findAll(
    @Query('unidadId') unidadId?: string,
    @Query('sectorId') sectorId?: string,
    @Query('materialId') materialId?: string,
    @Query('activo') activoParam?: string,
  ) {
    const parsedUnitId = unidadId !== undefined ? Number(unidadId) : undefined;
    const parsedSectorId = sectorId !== undefined ? Number(sectorId) : undefined;
    const parsedMaterialId = materialId !== undefined ? Number(materialId) : undefined;
    const activo = activoParam === undefined ? undefined : activoParam === 'true';

    return this.service.findAll(parsedUnitId, parsedSectorId, parsedMaterialId, activo);
  }

  @RequirePermissions('UNIDAD_MATERIALES_VER')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneById(id);
  }

  @RequirePermissions('UNIDAD_MATERIALES_EDITAR')
  @Post()
  create(@Body() createDto: CreateUnitMaterialDto) {
    return this.service.create(createDto);
  }

  @RequirePermissions('UNIDAD_MATERIALES_EDITAR')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUnitMaterialDto,
  ) {
    return this.service.update(id, updateDto);
  }

  @RequirePermissions('UNIDAD_MATERIALES_EDITAR')
  @Patch(':id/active')
  setActive(
    @Param('id', ParseIntPipe) id: number,
    @Body('activo') activo: boolean,
  ) {
    return this.service.setActive(id, activo);
  }
}
