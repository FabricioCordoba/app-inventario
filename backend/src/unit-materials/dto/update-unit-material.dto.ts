import { IsBoolean, IsDecimal, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateUnitMaterialDto {
  @IsOptional()
  @IsInt()
  materialId?: number;

  @IsOptional()
  @IsInt()
  sectorId?: number;

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
