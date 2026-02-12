import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';

describe('AuthGuard', () => {
    let guard: AuthGuard;
    let jwtService: jest.Mocked<Partial<JwtService>>;

    beforeEach(async () => {
        jwtService = {
            verifyAsync: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthGuard,
                {
                    provide: JwtService,
                    useValue: jwtService,
                },
            ],
        }).compile();

        guard = module.get<AuthGuard>(AuthGuard);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    const createMockContext = (authHeader?: string): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: {
                        authorization: authHeader,
                    },
                }),
            }),
        } as any;
    };

    it('should allow access with valid token', async () => {
        const context = createMockContext('Bearer valid_token');
        jwtService.verifyAsync.mockResolvedValue({ idUs: 1, rol: ['user'] });

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
        expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid_token', expect.any(Object));
    });

    it('should throw UnauthorizedException if no token provided', async () => {
        const context = createMockContext(undefined);

        await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
        const context = createMockContext('Bearer invalid_token');
        jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

        await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token type is not Bearer', async () => {
        const context = createMockContext('Basic token');

        await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });
});
