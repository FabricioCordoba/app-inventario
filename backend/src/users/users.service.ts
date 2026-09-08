import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { In, Repository } from 'typeorm';
import { Jerarquia } from '../hierarchies/entities/jerarquia.entity';
import { Rol } from '../roles/entities/rol.entity';
import { UsuarioRol } from '../roles/entities/usuario-rol.entity';
import { Usuario } from './entities/usuario.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Jerarquia)
    private readonly jerarquiaRepository: Repository<Jerarquia>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
    @InjectRepository(UsuarioRol)
    private readonly usuarioRolRepository: Repository<UsuarioRol>,
  ) {}

  private baseRelations = {
    jerarquia: true,
    usuarioRoles: {
      rol: {
        rolPermisos: {
          permiso: true,
        },
      },
    },
  } as const;

  async findAll(activo?: boolean): Promise<Usuario[]> {
    return this.usuarioRepository.find({
      where: activo === undefined ? {} : { activo },
      relations: this.baseRelations,
      order: { id: 'DESC' },
    });
  }

  async findOneById(id: number): Promise<Usuario> {
    const user = await this.usuarioRepository.findOne({
      where: { id },
      relations: this.baseRelations,
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { email: email.toLowerCase().trim(), activo: true },
      relations: this.baseRelations,
    });
  }

  findByIdForAuth(id: number): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { id, activo: true },
      relations: this.baseRelations,
    });
  }

  async create(createUserDto: CreateUserDto): Promise<Usuario> {
    const email = createUserDto.email.trim().toLowerCase();

    const existingUser = await this.usuarioRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Ya existe un usuario con ese email');
    }

    const jerarquia = await this.jerarquiaRepository.findOne({
      where: { id: createUserDto.jerarquiaId },
    });

    if (!jerarquia) {
      throw new NotFoundException('Jerarquía no encontrada');
    }

    const roles = createUserDto.rolIds?.length
      ? await this.rolRepository.find({
          where: { id: In(createUserDto.rolIds), activo: true },
        })
      : [];

    if (createUserDto.rolIds && roles.length !== createUserDto.rolIds.length) {
      throw new BadRequestException('Uno o más roles no existen o están inactivos');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 12);
    const user = this.usuarioRepository.create({
      nombre: createUserDto.nombre.trim(),
      apellido: createUserDto.apellido.trim(),
      email,
      passwordHash,
      jerarquiaId: jerarquia.id,
      activo: true,
    });

    const savedUser = await this.usuarioRepository.save(user);

    if (roles.length > 0) {
      await this.usuarioRolRepository.save(
        roles.map((rol) =>
          this.usuarioRolRepository.create({
            usuarioId: savedUser.id,
            rolId: rol.id,
          }),
        ),
      );
    }

    return this.findOneById(savedUser.id);
  }

  async setActive(id: number, activo: boolean): Promise<Usuario> {
    const user = await this.findOneById(id);
    user.activo = activo;
    await this.usuarioRepository.save(user);
    return this.findOneById(id);
  }

  async updateUltimoAcceso(id: number): Promise<void> {
    await this.usuarioRepository.update(id, { ultimoAcceso: new Date() });
  }
}
