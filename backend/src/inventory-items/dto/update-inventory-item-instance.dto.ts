import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { EstadoMaterial } from '../../common/enums';

export class UpdateInventoryItemInstanceDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  valorMedido?: number;

  @IsOptional()
  @IsEnum(EstadoMaterial)
  estado?: EstadoMaterial;

  @IsOptional()
  @IsString()
  observacion?: string | null;
}
