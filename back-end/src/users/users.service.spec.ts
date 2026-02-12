import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Locality } from '../localities/entities/locality.entity';
import { Purchase } from '../purchases/entities/purchase.entity';
import { Shipment, STATUS } from '../shipments/entities/shipment.entity';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Rol } from '../common/enums/rol.enum';

describe('UsersService', () => {
    let service: UsersService;
    let userRepository: Repository<User>;
    let localityRepository: Repository<Locality>;
    let purchaseRepository: Repository<Purchase>;

    const mockLocality: Locality = {
        idLo: 1,
        nameLo: 'Test Locality',
        postalCode: 1234,
        cost: 100,
        user: [],
        shipment: [],
        isActive: true,
    };

    const mockUser: User = {
        idUs: 1,
        nameUs: 'Test User',
        lastNameUs: 'Test Lastname',
        emailUs: 'test@example.com',
        passwordUs: 'hashedpassword',
        phoneUs: '1234567890',
        addressUs: 'address',
        rol: Rol.USER,
        isActive: true,
        locality: mockLocality,
        purchases: [],
    };

    const mockPurchase: Purchase = {
        idPu: 1,
        datePu: new Date('2023-01-01'),
        amount: 100,
        paymentId: 'pref_123',
        user: mockUser,
        shipment: { status: STATUS.PENDING } as Shipment,
        purchaseClothe: [],
    };

    const mockUserRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        findOneBy: jest.fn(),
        find: jest.fn(),
        update: jest.fn(),
        createQueryBuilder: jest.fn(() => ({
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValue({ affected: 1 }),
        })),
    };

    const mockLocalityRepository = {
        findOne: jest.fn(),
    };

    const mockPurchaseRepository = {
        find: jest.fn(),
    };

    const mockShipmentRepository = {}; // Not directly used in service methods tested here

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
                {
                    provide: getRepositoryToken(Locality),
                    useValue: mockLocalityRepository,
                },
                {
                    provide: getRepositoryToken(Purchase),
                    useValue: mockPurchaseRepository,
                },
                {
                    provide: getRepositoryToken(Shipment),
                    useValue: mockShipmentRepository,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        localityRepository = module.get<Repository<Locality>>(getRepositoryToken(Locality));
        purchaseRepository = module.get<Repository<Purchase>>(getRepositoryToken(Purchase));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should successfully create a user', async () => {
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

            mockLocalityRepository.findOne.mockResolvedValue(mockLocality);
            mockUserRepository.create.mockReturnValue(mockUser);
            mockUserRepository.save.mockResolvedValue(mockUser);

            const result = await service.create(createDto);

            expect(result).toEqual(mockUser);
            expect(mockLocalityRepository.findOne).toHaveBeenCalledWith({ where: { idLo: createDto.idLo } });
            expect(mockUserRepository.create).toHaveBeenCalledWith({ ...createDto, locality: mockLocality });
            expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
        });

        it('should throw BadRequestException if locality not found', async () => {
            const createDto: CreateUserDto = {
                idLo: 999,
                nameUs: 'Test',
                lastNameUs: 'User',
                emailUs: 'test@example.com',
                passwordUs: 'password',
                dni: 12345678,
                phoneUs: '1234567890',
                addressUs: 'address'
            };

            mockLocalityRepository.findOne.mockResolvedValue(null);

            await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
            expect(mockUserRepository.create).not.toHaveBeenCalled();
            expect(mockUserRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should return an array of users', async () => {
            mockUserRepository.find.mockResolvedValue([mockUser]);

            const result = await service.findAll();

            expect(result).toEqual([mockUser]);
            expect(mockUserRepository.find).toHaveBeenCalledWith({ where: { isActive: true } });
        });
    });

    describe('findOne', () => {
        it('should return a user by ID', async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUser);

            const result = await service.findOne(1);

            expect(result).toEqual(mockUser);
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { idUs: 1, isActive: true }, relations: ['locality'] });
        });
    });

    describe('update', () => {
        it('should update user without locality change', async () => {
            const updateDto: UpdateUserDto = { nameUs: 'Updated Name' };
            const updatedUser = { ...mockUser, ...updateDto };

            mockUserRepository.update.mockResolvedValue({ affected: 1 });
            mockUserRepository.findOne.mockResolvedValue(updatedUser);

            const result = await service.update(1, updateDto);

            expect(result).toEqual(updatedUser);
            expect(mockUserRepository.update).toHaveBeenCalledWith(1, updateDto);
        });

        it('should update user with locality change', async () => {
            const updateDto: UpdateUserDto = { idLo: 2 };
            const newLocality = { ...mockLocality, idLo: 2, nameLo: 'New Locality' };

            mockLocalityRepository.findOne.mockResolvedValue(newLocality);
            // mockUserRepository.createQueryBuilder already setup in beforeEach
            mockUserRepository.findOne.mockResolvedValue({ ...mockUser, locality: newLocality });

            const result = await service.update(1, updateDto);

            expect(result.locality).toEqual(newLocality);
            expect(mockLocalityRepository.findOne).toHaveBeenCalledWith({ where: { idLo: 2 } });
            // Cannot easily spy on chained builder calls without more complex mocks, but verifying outcome is good
        });
    });

    describe('changePassword', () => {
        it('should change password successfully', async () => {
            const currentPassword = 'password';
            const newPassword = 'newpassword';

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            // Mock bcrypt compare to return true
            jest.spyOn(bcryptjs, 'compare').mockImplementation(async () => true);
            // Mock bcrypt hash
            jest.spyOn(bcryptjs, 'hash').mockImplementation(async () => 'newhashedpassword');
            mockUserRepository.update.mockResolvedValue({ affected: 1 });

            const result = await service.changePassword(1, currentPassword, newPassword);

            expect(result).toEqual({ message: 'Contraseña actualizada correctamente' });
            expect(bcryptjs.compare).toHaveBeenCalledWith(currentPassword, mockUser.passwordUs);
            expect(mockUserRepository.update).toHaveBeenCalledWith(1, { passwordUs: 'newhashedpassword' });
        });

        it('should throw BadRequestException for incorrect current password', async () => {
            const currentPassword = 'wrongpassword';
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            jest.spyOn(bcryptjs, 'compare').mockImplementation(async () => false);

            await expect(service.changePassword(1, currentPassword, 'new')).rejects.toThrow(BadRequestException);
            expect(mockUserRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        it('should soft delete the user', async () => {
            mockUserRepository.update.mockResolvedValue({ affected: 1 });

            await service.remove(1);

            expect(mockUserRepository.update).toHaveBeenCalledWith(1, { isActive: false });
        });
    });

    describe('findAllWithStats', () => {
        it('should return users with stats', async () => {
            const mockUserWithStatsExpected = {
                ...mockUser,
                purchaseCount: 1,
                lastPurchaseDate: mockPurchase.datePu,
                pendingShipments: 1
            };
            // delete passwordUs from expected object as service removes it
            delete (mockUserWithStatsExpected as any).passwordUs;

            mockUserRepository.find.mockResolvedValue([mockUser]);
            mockPurchaseRepository.find.mockResolvedValue([mockPurchase]);

            const result = await service.findAllWithStats();

            expect(result).toHaveLength(1);
            expect(result[0].purchaseCount).toBe(1);
            expect(result[0].pendingShipments).toBe(1);
            // Ensure password is strictly not present
            expect(result[0]).not.toHaveProperty('passwordUs');
        });
    });
});
