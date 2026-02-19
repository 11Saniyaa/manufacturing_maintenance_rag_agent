import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MachineService } from './machine.service';
import { Machine } from './machine.entity';

@Controller('machines')
export class MachineController {
  constructor(private readonly machineService: MachineService) {}

  @Get()
  async getAllMachines(): Promise<Machine[]> {
    return this.machineService.findAll();
  }

  @Get(':id')
  async getMachine(@Param('id') id: string): Promise<Machine> {
    return this.machineService.findOne(+id);
  }

  @Get('type/:type')
  async getMachinesByType(@Param('type') type: string): Promise<Machine[]> {
    return this.machineService.findByType(type);
  }

  @Post()
  async createMachine(@Body() machine: Partial<Machine>): Promise<Machine> {
    return this.machineService.create(machine);
  }
}

