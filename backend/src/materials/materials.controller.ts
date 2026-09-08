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
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { MaterialsService } from './materials.service';

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @RequirePermissions('MATERIALES_VER')
  @Get()
  findAll(@Query('activo') activoParam?: string) {
    const activo = activoParam === undefined ? undefined : activoParam === 'true';
    return this.materialsService.findAll(activo);
  }

  @RequirePermissions('MATERIALES_VER')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.materialsService.findOneById(id);
  }

  @RequirePermissions('MATERIALES_CREAR')
  @Post()
  create(@Body() createMaterialDto: CreateMaterialDto) {
    return this.materialsService.create(createMaterialDto);
  }

  @RequirePermissions('MATERIALES_EDITAR')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ) {
    return this.materialsService.update(id, updateMaterialDto);
  }

  @RequirePermissions('MATERIALES_DESACTIVAR')
  @Patch(':id/active')
  setActive(
    @Param('id', ParseIntPipe) id: number,
    @Body('activo') activo: boolean,
  ) {
    return this.materialsService.setActive(id, activo);
  }
}
