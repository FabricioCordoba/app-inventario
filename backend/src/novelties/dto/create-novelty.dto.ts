import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNoveltyDto {
    @IsOptional()
    @IsInt()
    inventarioId?: number;

    @IsInt()
    @IsNotEmpty()
    unidadId: number;

    @IsOptional()
    @IsInt()
    sectorId?: number;

    @IsOptional()
    @IsInt()
    materialId?: number;

    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @IsInt()
    @IsNotEmpty()
    registradoPorId: number;
}
