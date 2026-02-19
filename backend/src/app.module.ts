import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MachineModule } from './machine/machine.module';
import { ErrorCodeModule } from './error-code/error-code.module';
import { ChatModule } from './chat/chat.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { QueryLogModule } from './query-log/query-log.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    // Configure SQLite database
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database/maintenance.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Auto-create tables (set to false in production)
      logging: false,
    }),
    DatabaseModule,
    MachineModule,
    ErrorCodeModule,
    ChatModule,
    MaintenanceModule,
    QueryLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

