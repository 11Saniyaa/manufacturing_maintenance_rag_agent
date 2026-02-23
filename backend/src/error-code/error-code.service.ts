import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Or } from 'typeorm';
import { ErrorCode } from './error-code.entity';

@Injectable()
export class ErrorCodeService {
  constructor(
    @InjectRepository(ErrorCode)
    private errorCodeRepository: Repository<ErrorCode>,
  ) {}

  async findAll(): Promise<ErrorCode[]> {
    return this.errorCodeRepository.find({
      relations: ['machine'],
    });
  }

  async findByCode(code: string): Promise<ErrorCode[]> {
    return this.errorCodeRepository.find({
      where: { code },
      relations: ['machine'],
    });
  }

  async search(keyword: string): Promise<ErrorCode[]> {
    if (!keyword || !keyword.trim()) {
      return [];
    }

    const searchTerm = `%${keyword.trim()}%`;
    
    // Enhanced search with case-insensitive matching and multiple fields
    return this.errorCodeRepository
      .createQueryBuilder('errorCode')
      .leftJoinAndSelect('errorCode.machine', 'machine')
      .where('LOWER(errorCode.code) LIKE LOWER(:keyword)', { keyword: searchTerm })
      .orWhere('LOWER(errorCode.meaning) LIKE LOWER(:keyword)', { keyword: searchTerm })
      .orWhere('LOWER(errorCode.description) LIKE LOWER(:keyword)', { keyword: searchTerm })
      .orderBy('errorCode.code', 'ASC')
      .getMany();
  }

  async findByMachineId(machineId: number): Promise<ErrorCode[]> {
    return this.errorCodeRepository.find({
      where: { machineId },
      relations: ['machine'],
    });
  }

  async create(errorCode: Partial<ErrorCode>): Promise<ErrorCode> {
    const newErrorCode = this.errorCodeRepository.create(errorCode);
    return this.errorCodeRepository.save(newErrorCode);
  }
}

