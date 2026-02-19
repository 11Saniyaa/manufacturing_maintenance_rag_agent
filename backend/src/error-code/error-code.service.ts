import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorCode } from './error-code.entity';

@Injectable()
export class ErrorCodeService {
  constructor(
    @InjectRepository(ErrorCode)
    private errorCodeRepository: Repository<ErrorCode>,
  ) {}

  /**
   * Get all error codes
   */
  async findAll(): Promise<ErrorCode[]> {
    return this.errorCodeRepository.find({
      relations: ['machine'],
    });
  }

  /**
   * Get error code by code string
   */
  async findByCode(code: string): Promise<ErrorCode[]> {
    return this.errorCodeRepository.find({
      where: { code },
      relations: ['machine'],
    });
  }

  /**
   * Search error codes by keyword
   */
  async search(keyword: string): Promise<ErrorCode[]> {
    return this.errorCodeRepository
      .createQueryBuilder('errorCode')
      .leftJoinAndSelect('errorCode.machine', 'machine')
      .where('errorCode.code LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('errorCode.meaning LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('errorCode.description LIKE :keyword', { keyword: `%${keyword}%` })
      .getMany();
  }

  /**
   * Get error codes for a specific machine
   */
  async findByMachineId(machineId: number): Promise<ErrorCode[]> {
    return this.errorCodeRepository.find({
      where: { machineId },
      relations: ['machine'],
    });
  }

  /**
   * Create a new error code
   */
  async create(errorCode: Partial<ErrorCode>): Promise<ErrorCode> {
    const newErrorCode = this.errorCodeRepository.create(errorCode);
    return this.errorCodeRepository.save(newErrorCode);
  }
}

