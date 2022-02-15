import { Test, TestingModule } from '@nestjs/testing';
import { DiariesService } from './diaries.service';

describe('DiariesService', () => {
  let service: DiariesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiariesService],
    }).compile();

    service = module.get<DiariesService>(DiariesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
