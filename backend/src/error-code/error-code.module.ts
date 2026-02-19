import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorCode } from './error-code.entity';
import { ErrorCodeService } from './error-code.service';
import { ErrorCodeController } from './error-code.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ErrorCode])],
  controllers: [ErrorCodeController],
  providers: [ErrorCodeService],
  exports: [ErrorCodeService],
})
export class ErrorCodeModule {}

