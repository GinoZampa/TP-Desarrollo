import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ExecutionContext } from '@nestjs/common';
import { Rol } from '../../common/enums/rol.enum';
import { ROLES_KEY } from '../decorators/roles.decorators';

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: jest.Mocked<Reflector>;

    beforeEach(() => {
        reflector = {
            getAllAndOverride: jest.fn(),
        } as any;

        guard = new RolesGuard(reflector);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    const createMockContext = (userRole: string): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({
                    user: { user: { rol: userRole } },
                }),
            }),
            getHandler: () => jest.fn(),
            getClass: () => jest.fn(),
        } as any;
    };

    it('should allow access if no roles are required', () => {
        reflector.getAllAndOverride.mockReturnValue(undefined);
        const context = createMockContext(Rol.USER);

        const result = guard.canActivate(context);

        expect(result).toBe(true);
    });

    it('should allow access if user is ADMIN', () => {
        reflector.getAllAndOverride.mockReturnValue(Rol.USER);
        const context = createMockContext(Rol.ADMIN);

        const result = guard.canActivate(context);

        expect(result).toBe(true);
    });

    it('should allow access if user has required role', () => {
        reflector.getAllAndOverride.mockReturnValue(Rol.USER);
        const context = createMockContext(Rol.USER);

        const result = guard.canActivate(context);

        expect(result).toBe(true);
    });

    it('should deny access if user does not have required role', () => {
        reflector.getAllAndOverride.mockReturnValue(Rol.ADMIN);
        const context = createMockContext(Rol.USER);

        const result = guard.canActivate(context);

        expect(result).toBe(false);
    });
});
