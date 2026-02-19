import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ErrorCodeService } from './error-code.service';
import { ErrorCode } from './error-code.entity';

@Controller('error-codes')
export class ErrorCodeController {
  constructor(private readonly errorCodeService: ErrorCodeService) {}

  @Get()
  async getAllErrorCodes(): Promise<ErrorCode[]> {
    return this.errorCodeService.findAll();
  }

  @Get('search')
  async searchErrorCodes(@Query('q') keyword: string): Promise<ErrorCode[]> {
    return this.errorCodeService.search(keyword);
  }

  @Get('code/:code')
  async getErrorCodeByCode(@Param('code') code: string): Promise<ErrorCode[]> {
    return this.errorCodeService.findByCode(code);
  }

  @Get('machine/:machineId')
  async getErrorCodesByMachine(@Param('machineId') machineId: string): Promise<ErrorCode[]> {
    return this.errorCodeService.findByMachineId(+machineId);
  }

  @Post()
  async createErrorCode(@Body() errorCode: Partial<ErrorCode>): Promise<ErrorCode> {
    return this.errorCodeService.create(errorCode);
  }
}

