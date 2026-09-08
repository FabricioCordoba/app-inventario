import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CreateInventoryParticipantDto } from './dto/create-inventory-participant.dto';
import { UpdateInventoryParticipantDto } from './dto/update-inventory-participant.dto';
import { InventoryParticipantsService } from './inventory-participants.service';

@Controller('inventory-participants')
export class InventoryParticipantsController {
    constructor(
        private readonly inventoryParticipantsService: InventoryParticipantsService,
    ) { }

    @RequirePermissions('INVENTARIOS_VER')
    @Get()
    findAll(
        @Query('inventarioId') inventarioId?: string,
        @Query('usuarioId') usuarioId?: string,
    ) {
        return this.inventoryParticipantsService.findAll(
            inventarioId !== undefined ? Number(inventarioId) : undefined,
            usuarioId !== undefined ? Number(usuarioId) : undefined,
        );
    }

    @RequirePermissions('INVENTARIOS_VER')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.inventoryParticipantsService.findOneById(id);
    }

    @RequirePermissions('INVENTARIOS_EDITAR')
    @Post()
    create(@Body() createDto: CreateInventoryParticipantDto) {
        return this.inventoryParticipantsService.create(createDto);
    }

    @RequirePermissions('INVENTARIOS_EDITAR')
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateInventoryParticipantDto,
    ) {
        return this.inventoryParticipantsService.update(id, updateDto);
    }

    @RequirePermissions('INVENTARIOS_EDITAR')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.inventoryParticipantsService.remove(id);
    }
}
