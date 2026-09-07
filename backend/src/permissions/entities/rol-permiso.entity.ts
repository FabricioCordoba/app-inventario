import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Rol } from '../../roles/entities/rol.entity';
import { Permiso } from './permiso.entity';

@Entity('rol_permisos')
export class RolPermiso {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'rol_id', type: 'bigint', unsigned: true })
  rolId: number;

  @Column({ name: 'permiso_id', type: 'bigint', unsigned: true })
  permisoId: number;

  @ManyToOne(() => Rol, (rol) => rol.rolPermisos, { nullable: false })
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @ManyToOne(() => Permiso, (permiso) => permiso.rolPermisos, {
    nullable: false,
  })
  @JoinColumn({ name: 'permiso_id' })
  permiso: Permiso;

  @Column({
    name: 'created_at',
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  createdAt: Date;
}
