import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guard/auth.guard';
import { RolesGuard } from './guard/roles.guard';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: jest.Mocked<Partial<AuthService>>;

    beforeEach(async () => {
        authService = {
            register: jest.fn(),
            login: jest.fn(),
            profile: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: authService,
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<AuthController>(AuthController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('register', () => {
        it('should register a new user', async () => {
            const registerDto = {
                nameUs: 'Juan',
                lastNameUs: 'Perez',
                emailUs: 'juan@test.com',
                passwordUs: '123456',
                addressUs: 'Calle 123',
                phoneUs: '1234567890',
                dni: 12345678,
                idLo: 1,
            };

            authService.register.mockResolvedValue({
                emailUs: registerDto.emailUs,
                nameUs: registerDto.nameUs,
            });

            const result = await controller.register(registerDto);

            expect(result).toEqual({
                emailUs: registerDto.emailUs,
                nameUs: registerDto.nameUs,
            });
            expect(authService.register).toHaveBeenCalledWith(registerDto);
        });
    });

    describe('login', () => {
        it('should login a user', async () => {
            const loginDto = { emailUs: 'juan@test.com', passwordUs: '123456' };
            authService.login.mockResolvedValue({
                token: 'token',
                emailUs: loginDto.emailUs,
            });

            const result = await controller.login(loginDto);

            expect(result).toEqual({
                token: 'token',
                emailUs: loginDto.emailUs,
            });
            expect(authService.login).toHaveBeenCalledWith(loginDto);
        });
    });

    describe('profile', () => {
        it('should return user profile', async () => {
            const user = { emailUs: 'juan@test.com', rol: ['user'], idUs: 1 };
            const profile = { ...user, nameUs: 'Juan' };
            authService.profile.mockResolvedValue(profile as any);

            const result = await controller.profile(user);

            expect(result).toEqual(profile);
            expect(authService.profile).toHaveBeenCalledWith(user);
        });
    });
});
