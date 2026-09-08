export interface JwtPayload {
  sub: number;
  email: string;
  type: 'access' | 'refresh';
}

export interface AuthJerarquia {
  id: number;
  nombre: string;
  nivel: number;
}

export interface AuthUser {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  jerarquia: AuthJerarquia;
  roles: string[];
  permisos: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}
