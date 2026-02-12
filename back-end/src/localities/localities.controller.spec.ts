import { Test, TestingModule } from '@nestjs/testing';
import { LocalitiesController } from './localities.controller';
import { LocalitiesService } from './localities.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { CreateLocalityDto } from './dto/create-locality.dto';
import { NotFoundException } from '@nestjs/common';

describe('LocalitiesController', () => {
    let controller: LocalitiesController;
    let service: LocalitiesService;

    const mockLocalitiesService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findActiveLocalities: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        activate: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [LocalitiesController],
            providers: [
                {
                    provide: LocalitiesService,
                    useValue: mockLocalitiesService,
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<LocalitiesController>(LocalitiesController);
        service = module.get<LocalitiesService>(LocalitiesService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a locality', async () => {
            const dto: CreateLocalityDto = { nameLo: 'New York', postalCode: 10001, cost: 100 };
            const result = { idLo: 1, ...dto, isActive: true };
            mockLocalitiesService.create.mockResolvedValue(result);

            expect(await controller.create(dto)).toEqual(result);
            expect(service.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {
        it('should return all localities', async () => {
            const result = [{ idLo: 1, nameLo: 'New York' }];
            mockLocalitiesService.findAll.mockResolvedValue(result);
            expect(await controller.findAll()).toEqual(result);
        });
    });

    describe('findActiveLocalities', () => {
        it('should return active localities', async () => {
            const result = [{ idLo: 1, nameLo: 'New York', isActive: true }];
            mockLocalitiesService.findActiveLocalities.mockResolvedValue(result);
            expect(await controller.findActiveLocalities()).toEqual(result);
        });
    });

    describe('findOne', () => {
        it('should return a locality', async () => {
            const result = { idLo: 1, nameLo: 'New York' };
            mockLocalitiesService.findOne.mockResolvedValue(result);
            expect(await controller.findOne(1)).toEqual(result);
        });

        it('should throw NotFoundException if not found', async () => {
            mockLocalitiesService.findOne.mockRejectedValue(new NotFoundException());
            await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update a locality', async () => {
            const dto = { nameLo: 'New Jersey' };
            const result = { idLo: 1, nameLo: 'New Jersey' };
            mockLocalitiesService.update.mockResolvedValue(result);
            expect(await controller.update(1, dto)).toEqual(result);
            expect(service.update).toHaveBeenCalledWith(1, dto);
        });
    });

    describe('remove', () => {
        it('should deactivate a locality', async () => {
            mockLocalitiesService.remove.mockResolvedValue(undefined);
            expect(await controller.remove(1)).toBeUndefined();
            expect(service.remove).toHaveBeenCalledWith(1);
        });
    });

    describe('activate', () => {
        it('should activate a locality', async () => {
            mockLocalitiesService.activate.mockResolvedValue(undefined);
            expect(await controller.activate(1)).toBeUndefined();
            expect(service.activate).toHaveBeenCalledWith(1);
        });
    });
});
