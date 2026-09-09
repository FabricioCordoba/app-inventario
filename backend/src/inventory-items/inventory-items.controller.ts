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
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { InventoryItemsService } from './inventory-items.service';

@Controller('inventory-items')
export class InventoryItemsController {
  constructor(private readonly inventoryItemsService: InventoryItemsService) {}

  @RequirePermissions('INVENTARIOS_VER')
  @Get()
  findAll(@Query('inventarioId', ParseIntPipe) inventarioId: number) {
    return this.inventoryItemsService.findAll(inventarioId);
  }

  @RequirePermissions('INVENTARIOS_VER')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryItemsService.findOneById(id);
  }

  @RequirePermissions('INVENTARIOS_EDITAR')
  @Post('generate')
  generate(@Body('inventarioId', ParseIntPipe) inventarioId: number) {
    return this.inventoryItemsService.generateForInventory(inventarioId);
  }

  @RequirePermissions('INVENTARIOS_EDITAR')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateInventoryItemDto,
  ) {
    return this.inventoryItemsService.update(id, updateDto);
  }
}
