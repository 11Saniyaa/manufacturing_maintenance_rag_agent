import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { Maintenance } from './maintenance.entity';

@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  async getAllMaintenance(): Promise<Maintenance[]> {
    return this.maintenanceService.findAll();
  }

  @Get('search')
  async searchMaintenance(@Query('q') keyword: string): Promise<Maintenance[]> {
    return this.maintenanceService.search(keyword);
  }

  @Get('machine/:machineId')
  async getMaintenanceByMachine(@Param('machineId') machineId: string): Promise<Maintenance[]> {
    return this.maintenanceService.findByMachineId(+machineId);
  }

  @Post()
  async createMaintenance(@Body() maintenance: Partial<Maintenance>): Promise<Maintenance> {
    return this.maintenanceService.create(maintenance);
  }
}

