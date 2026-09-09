import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
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
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'cantidadRequerida debe ser un número válido' })
  @Min(0)
  cantidadRequerida?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 }, { message: 'valorNominal debe ser un número válido' })
  @Min(0)
  valorNominal?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 }, { message: 'valorMinimo debe ser un número válido' })
  @Min(0)
  valorMinimo?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
