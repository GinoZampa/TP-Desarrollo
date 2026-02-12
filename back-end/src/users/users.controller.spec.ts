import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Rol } from '../common/enums/rol.enum';
import { UnauthorizedException } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';

describe('UsersController', () => {
    let controller: UsersController;
    let usersService: UsersService;
    let jwtService: JwtService;

    const mockUser: User = {
        idUs: 1,
        nameUs: 'Test',
        lastNameUs: 'User',
        emailUs: 'test@example.com',
        passwordUs: 'hashedpassword',
        phoneUs: '1234567890',
        addressUs: 'address',
        rol: Rol.USER,
        isActive: true,
        locality: null,
        purchases: [],
    };

    const mockUsersService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findAllWithStats: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        changePassword: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<UsersController>(UsersController);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a user', async () => {
            const createDto: CreateUserDto = {
                idLo: 1,
                nameUs: 'Test',
                lastNameUs: 'User',
                emailUs: 'test@example.com',
                passwordUs: 'password',
                dni: 12345678,
                phoneUs: '1234567890',
                addressUs: 'address'
            };
            mockUsersService.create.mockResolvedValue(mockUser);

            const result = await controller.create(createDto);

            expect(result).toEqual(mockUser);
            expect(mockUsersService.create).toHaveBeenCalledWith(createDto);
        });
    });

    describe('findAll', () => {
        it('should return all users', async () => {
            mockUsersService.findAll.mockResolvedValue([mockUser]);

            const result = await controller.findAll();

            expect(result).toEqual([mockUser]);
            expect(mockUsersService.findAll).toHaveBeenCalled();
        });
    });

    describe('findAllWithStats', () => {
        it('should return users with stats', async () => {
            const stats = [{ ...mockUser, purchaseCount: 5 }];
            mockUsersService.findAllWithStats.mockResolvedValue(stats);

            const result = await controller.findAllWithStats();

            expect(result).toEqual(stats);
            expect(mockUsersService.findAllWithStats).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return a user', async () => {
            mockUsersService.findOne.mockResolvedValue(mockUser);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockUser);
            expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
        });
    });

    describe('update', () => {
        it('should update user and return user with new token', async () => {
            const updateDto: UpdateUserDto = { nameUs: 'Updated' };
            const updatedUser = { ...mockUser, nameUs: 'Updated' };
            const token = 'new_token';

            mockUsersService.update.mockResolvedValue(updatedUser);
            mockJwtService.sign.mockReturnValue(token);

            const result = await controller.update(1, updateDto);

            expect(result).toEqual({ user: updatedUser, token });
            expect(mockUsersService.update).toHaveBeenCalledWith(1, updateDto);
            expect(mockJwtService.sign).toHaveBeenCalledWith({ user: updatedUser });
        });
    });

    describe('remove', () => {
        it('should remove user if password is correct', async () => {
            const deleteDto = { password: 'password' };
            mockUsersService.findOne.mockResolvedValue(mockUser);
            // Mock bcrypt
            jest.spyOn(bcryptjs, 'compare').mockImplementation(async () => true);
            mockUsersService.remove.mockResolvedValue(undefined);

            await controller.remove(1, deleteDto);

            expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
            expect(bcryptjs.compare).toHaveBeenCalledWith(deleteDto.password, mockUser.passwordUs);
            expect(mockUsersService.remove).toHaveBeenCalledWith(1);
        });

        it('should throw UnauthorizedException if password is incorrect', async () => {
            const deleteDto = { password: 'wrong' };
            mockUsersService.findOne.mockResolvedValue(mockUser);
            jest.spyOn(bcryptjs, 'compare').mockImplementation(async () => false);

            await expect(controller.remove(1, deleteDto)).rejects.toThrow(UnauthorizedException);
            expect(mockUsersService.remove).not.toHaveBeenCalled();
        });
    });

    describe('changePassword', () => {
        it('should change password', async () => {
            const dto = { currentPassword: 'old', newPassword: 'new' };
            const response = { message: 'Success' };
            mockUsersService.changePassword.mockResolvedValue(response);

            const result = await controller.changePassword(1, dto);

            expect(result).toEqual(response);
            expect(mockUsersService.changePassword).toHaveBeenCalledWith(1, dto.currentPassword, dto.newPassword);
        });
    });
});
