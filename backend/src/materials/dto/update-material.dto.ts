import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TipoControl, UnidadMedida } from '../../common/enums';

export class UpdateMaterialDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(TipoControl)
  tipoControl?: TipoControl;

  @IsOptional()
  @IsEnum(UnidadMedida)
  unidadMedida?: UnidadMedida;

  @IsOptional()
  requiereInstancias?: boolean;

  @IsOptional()
  activo?: boolean;
}
