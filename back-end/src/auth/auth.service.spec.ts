import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
    let service: AuthService;
    let usersService: jest.Mocked<Partial<UsersService>>;
    let jwtService: jest.Mocked<Partial<JwtService>>;

    const mockUser = {
        idUs: 1,
        nameUs: 'Juan',
        emailUs: 'juan@test.com',
        passwordUs: 'hashedPassword',
        rol: ['user'],
    };

    beforeEach(async () => {
        usersService = {
            findOneByEmail: jest.fn(),
            create: jest.fn(),
        };

        jwtService = {
            sign: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: usersService,
                },
                {
                    provide: JwtService,
                    useValue: jwtService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
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

            usersService.findOneByEmail.mockResolvedValue(null);
            (bcryptjs.hash as jest.Mock).mockResolvedValue('hashedPassword');
            usersService.create.mockResolvedValue(mockUser as any);

            const result = await service.register(registerDto);

            expect(result).toEqual({
                emailUs: registerDto.emailUs,
                nameUs: registerDto.nameUs,
            });
            expect(usersService.findOneByEmail).toHaveBeenCalledWith(registerDto.emailUs);
            expect(bcryptjs.hash).toHaveBeenCalledWith('123456', 10);
            expect(usersService.create).toHaveBeenCalledWith({
                ...registerDto,
                passwordUs: 'hashedPassword',
            });
        });

        it('should throw BadRequestException if user already exists', async () => {
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

            usersService.findOneByEmail.mockResolvedValue(mockUser as any);

            await expect(service.register(registerDto)).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('login', () => {
        it('should return a token for valid credentials', async () => {
            const loginDto = { emailUs: 'juan@test.com', passwordUs: '123456' };
            usersService.findOneByEmail.mockResolvedValue(mockUser as any);
            (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
            jwtService.sign.mockReturnValue('jwt-token');

            const result = await service.login(loginDto);

            expect(result).toEqual({
                token: 'jwt-token',
                emailUs: loginDto.emailUs,
            });
            expect(jwtService.sign).toHaveBeenCalledWith({ user: mockUser });
        });

        it('should throw UnauthorizedException for invalid email', async () => {
            usersService.findOneByEmail.mockResolvedValue(null);

            await expect(
                service.login({ emailUs: 'wrong@test.com', passwordUs: '123456' }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException for invalid password', async () => {
            usersService.findOneByEmail.mockResolvedValue(mockUser as any);
            (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

            await expect(
                service.login({ emailUs: 'juan@test.com', passwordUs: 'wrong' }),
            ).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('profile', () => {
        it('should return user profile', async () => {
            usersService.findOneByEmail.mockResolvedValue(mockUser as any);

            const result = await service.profile({ emailUs: 'juan@test.com', rol: ['user'] });

            expect(result).toEqual(mockUser);
            expect(usersService.findOneByEmail).toHaveBeenCalledWith('juan@test.com');
        });
    });
});
