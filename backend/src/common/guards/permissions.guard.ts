import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthUser } from '../../auth/interfaces/auth.interface';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest<{ user: AuthUser }>();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('Acceso denegado');
        }

        if (!Array.isArray(user.permisos)) {
            throw new ForbiddenException('El usuario no tiene permisos válidos');
        }

        const hasPermission = requiredPermissions.every((permission) =>
            user.permisos.includes(permission),
        );

        if (!hasPermission) {
            throw new ForbiddenException('No tiene permisos para realizar esta acción');
        }

        return true;
    }
}
