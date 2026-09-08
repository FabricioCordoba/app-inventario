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
import { EstadoNovedad } from '../common/enums';
import { CreateNoveltyDto } from './dto/create-novelty.dto';
import { UpdateNoveltyDto } from './dto/update-novelty.dto';
import { NoveltiesService } from './novelties.service';

@Controller('novelties')
export class NoveltiesController {
    constructor(private readonly noveltiesService: NoveltiesService) { }

    @RequirePermissions('NOVEDADES_VER')
    @Get()
    findAll(
        @Query('inventarioId') inventarioId?: string,
        @Query('unidadId') unidadId?: string,
        @Query('estado') estado?: string,
    ) {
        return this.noveltiesService.findAll(
            inventarioId !== undefined ? Number(inventarioId) : undefined,
            unidadId !== undefined ? Number(unidadId) : undefined,
            estado !== undefined ? (estado as EstadoNovedad) : undefined,
        );
    }

    @RequirePermissions('NOVEDADES_VER')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.noveltiesService.findOneById(id);
    }

    @RequirePermissions('NOVEDADES_CREAR')
    @Post()
    create(@Body() createNoveltyDto: CreateNoveltyDto) {
        return this.noveltiesService.create(createNoveltyDto);
    }

    @RequirePermissions('NOVEDADES_EDITAR')
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateNoveltyDto: UpdateNoveltyDto,
    ) {
        return this.noveltiesService.update(id, updateNoveltyDto);
    }

    @RequirePermissions('NOVEDADES_RESOLVER')
    @Patch(':id/resolve')
    resolve(
        @Param('id', ParseIntPipe) id: number,
        @Body('resueltoPorId') resueltoPorId: number,
        @Body('observacionResolucion') observacionResolucion?: string,
    ) {
        return this.noveltiesService.resolve(id, resueltoPorId, observacionResolucion);
    }
}
