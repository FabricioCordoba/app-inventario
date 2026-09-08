import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateNoveltyDto {
    @IsOptional()
    @IsInt()
    inventarioId?: number;

    @IsOptional()
    @IsInt()
    unidadId?: number;

    @IsOptional()
    @IsInt()
    sectorId?: number;

    @IsOptional()
    @IsInt()
    materialId?: number;

    @IsOptional()
    @IsString()
    descripcion?: string;
}
