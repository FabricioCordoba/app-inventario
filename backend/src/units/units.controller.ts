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
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { UnitsService } from './units.service';

@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @RequirePermissions('UNIDADES_VER')
  @Get()
  findAll(@Query('activo') activoParam?: string) {
    const activo = activoParam === undefined ? undefined : activoParam === 'true';
    return this.unitsService.findAll(activo);
  }

  @RequirePermissions('UNIDADES_VER')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.unitsService.findOneById(id);
  }

  @RequirePermissions('UNIDADES_CREAR')
  @Post()
  create(@Body() createUnitDto: CreateUnitDto) {
    return this.unitsService.create(createUnitDto);
  }

  @RequirePermissions('UNIDADES_EDITAR')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUnitDto: UpdateUnitDto,
  ) {
    return this.unitsService.update(id, updateUnitDto);
  }

  @RequirePermissions('UNIDADES_DESACTIVAR')
  @Patch(':id/active')
  setActive(
    @Param('id', ParseIntPipe) id: number,
    @Body('activo') activo: boolean,
  ) {
    return this.unitsService.setActive(id, activo);
  }
}
