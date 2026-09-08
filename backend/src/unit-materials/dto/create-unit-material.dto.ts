import {
  IsBoolean,
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUnitMaterialDto {
  @IsInt()
  @IsNotEmpty()
  unidadId: number;

  @IsInt()
  @IsNotEmpty()
  materialId: number;

  @IsInt()
  @IsNotEmpty()
  sectorId: number;

  @IsOptional()
  @IsDecimal({}, { message: 'cantidadRequerida debe ser un decimal' })
  cantidadRequerida?: number;

  @IsOptional()
  @IsDecimal({}, { message: 'valorNominal debe ser un decimal' })
  valorNominal?: number;

  @IsOptional()
  @IsDecimal({}, { message: 'valorMinimo debe ser un decimal' })
  valorMinimo?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
