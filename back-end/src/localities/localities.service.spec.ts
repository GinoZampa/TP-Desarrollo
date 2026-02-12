import { Test, TestingModule } from '@nestjs/testing';
import { LocalitiesService } from './localities.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Locality } from './entities/locality.entity';
import { NotFoundException } from '@nestjs/common';

describe('LocalitiesService', () => {
    let service: LocalitiesService;
    let repository: any;

    const mockLocalityRepository = {
        create: jest.fn().mockImplementation((dto) => dto),
        save: jest.fn().mockImplementation((locality) => Promise.resolve({ idLo: 1, ...locality })),
        find: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LocalitiesService,
                {
                    provide: getRepositoryToken(Locality),
                    useValue: mockLocalityRepository,
                },
            ],
        }).compile();

        service = module.get<LocalitiesService>(LocalitiesService);
        repository = module.get(getRepositoryToken(Locality));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a locality', async () => {
        const dto = { nameLo: 'New York', postalCode: 10001, cost: 100 };
        const result = await service.create(dto as any);
        expect(result).toEqual({ idLo: 1, ...dto });
        expect(repository.create).toHaveBeenCalledWith(dto);
        expect(repository.save).toHaveBeenCalledWith(dto);
    });

    it('should find all localities', async () => {
        const localities = [{ idLo: 1, nameLo: 'New York' }];
        repository.find.mockResolvedValue(localities);
        const result = await service.findAll();
        expect(result).toEqual(localities);
        expect(repository.find).toHaveBeenCalled();
    });

    it('should find active localities', async () => {
        const localities = [{ idLo: 1, nameLo: 'New York', isActive: true }];
        repository.find.mockResolvedValue(localities);
        const result = await service.findActiveLocalities();
        expect(result).toEqual(localities);
        expect(repository.find).toHaveBeenCalledWith({ where: { isActive: true } });
    });

    it('should find one locality by ID', async () => {
        const locality = { idLo: 1, nameLo: 'New York', isActive: true };
        repository.findOne.mockResolvedValue(locality);
        const result = await service.findOne(1);
        expect(result).toEqual(locality);
        expect(repository.findOne).toHaveBeenCalledWith({ where: { idLo: 1, isActive: true } });
    });

    it('should throw NotFoundException if locality not found', async () => {
        repository.findOne.mockResolvedValue(null);
        await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should update a locality', async () => {
        const dto = { nameLo: 'New Jersey' };
        const locality = { idLo: 1, nameLo: 'New Jersey', isActive: true };
        repository.update.mockResolvedValue(undefined);
        repository.findOne.mockResolvedValue(locality);

        const result = await service.update(1, dto);
        expect(result).toEqual(locality);
        expect(repository.update).toHaveBeenCalledWith(1, dto);
    });

    it('should deactivate a locality', async () => {
        repository.update.mockResolvedValue(undefined);
        await service.remove(1);
        expect(repository.update).toHaveBeenCalledWith(1, { isActive: false });
    });

    it('should activate a locality', async () => {
        repository.update.mockResolvedValue(undefined);
        await service.activate(1);
        expect(repository.update).toHaveBeenCalledWith(1, { isActive: true });
    });
});
