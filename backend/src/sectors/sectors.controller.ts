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
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { SectorsService } from './sectors.service';

@Controller('sectors')
export class SectorsController {
  constructor(private readonly sectorsService: SectorsService) {}

  @RequirePermissions('SECTORES_VER')
  @Get()
  findAll(@Query('unidadId') unidadId?: string, @Query('activo') activoParam?: string) {
    const unitId = unidadId !== undefined ? Number(unidadId) : undefined;
    const activo = activoParam === undefined ? undefined : activoParam === 'true';
    return this.sectorsService.findAll(unitId, activo);
  }

  @RequirePermissions('SECTORES_VER')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sectorsService.findOneById(id);
  }

  @RequirePermissions('SECTORES_CREAR')
  @Post()
  create(@Body() createSectorDto: CreateSectorDto) {
    return this.sectorsService.create(createSectorDto);
  }

  @RequirePermissions('SECTORES_EDITAR')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSectorDto: UpdateSectorDto,
  ) {
    return this.sectorsService.update(id, updateSectorDto);
  }

  @RequirePermissions('SECTORES_DESACTIVAR')
  @Patch(':id/active')
  setActive(
    @Param('id', ParseIntPipe) id: number,
    @Body('activo') activo: boolean,
  ) {
    return this.sectorsService.setActive(id, activo);
  }
}
