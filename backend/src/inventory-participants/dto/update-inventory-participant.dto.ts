import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class UpdateInventoryParticipantDto {
    @IsOptional()
    @IsInt()
    usuarioId?: number;

    @IsOptional()
    @IsBoolean()
    esResponsable?: boolean;
}
