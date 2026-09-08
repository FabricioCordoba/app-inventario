import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../users/entities/usuario.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { AuthUser, LoginResponse } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private mapAuthUser(user: Usuario): AuthUser {
    const roles = Array.from(
      new Set(
        (user.usuarioRoles ?? [])
          .map((usuarioRol) => usuarioRol.rol?.codigo)
          .filter((codigo): codigo is string => Boolean(codigo)),
      ),
    );

    const permisos = Array.from(
      new Set(
        (user.usuarioRoles ?? [])
          .flatMap((usuarioRol) => usuarioRol.rol?.rolPermisos ?? [])
          .map((rolPermiso) => rolPermiso.permiso?.codigo)
          .filter((codigo): codigo is string => Boolean(codigo)),
      ),
    );

    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      jerarquia: {
        id: user.jerarquia.id,
        nombre: user.jerarquia.nombre,
        nivel: user.jerarquia.nivel,
      },
      roles,
      permisos,
    };
  }

  async validateActiveUser(id: number): Promise<AuthUser | null> {
    const user = await this.usersService.findByIdForAuth(id);
    if (!user) {
      return null;
    }

    return this.mapAuthUser(user);
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const authUser = this.mapAuthUser(user);
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      type: 'access',
    });

    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'refresh',
      },
      {
        expiresIn: (this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d') as any,
      },
    );

    return {
      accessToken,
      refreshToken,
      user: authUser,
    };
  }
}
