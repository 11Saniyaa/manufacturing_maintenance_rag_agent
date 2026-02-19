import { DataSource } from 'typeorm';
import { Machine } from '../machine/machine.entity';
import { ErrorCode } from '../error-code/error-code.entity';
import { Maintenance } from '../maintenance/maintenance.entity';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Seed script to populate the database with initial data
 * Run with: npm run seed
 */
async function seed() {
  // Create database directory if it doesn't exist
  const dbDir = path.join(__dirname, '../../database');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dataSource = new DataSource({
    type: 'sqlite',
    database: path.join(dbDir, 'maintenance.db'),
    entities: [Machine, ErrorCode, Maintenance],
    synchronize: true,
  });

  try {
    await dataSource.initialize();
    console.log('📦 Database connected');

    const machineRepository = dataSource.getRepository(Machine);
    const errorCodeRepository = dataSource.getRepository(ErrorCode);
    const maintenanceRepository = dataSource.getRepository(Maintenance);

    // Clear existing data
    await maintenanceRepository.delete({});
    await errorCodeRepository.delete({});
    await machineRepository.delete({});
    console.log('🗑️  Cleared existing data');

    // Seed Machines
    const machines = [
      {
        name: 'Conveyor Belt System A',
        type: 'Conveyor',
        description: 'Main production line conveyor belt system',
        manufacturer: 'Industrial Conveyors Inc.',
        model: 'IC-5000',
      },
      {
        name: 'Industrial Motor Unit 1',
        type: 'Motor',
        description: 'High-power industrial motor for heavy machinery',
        manufacturer: 'Power Motors Ltd.',
        model: 'PM-3000',
      },
      {
        name: 'CNC Milling Machine',
        type: 'CNC',
        description: 'Computer numerical control milling machine for precision manufacturing',
        manufacturer: 'Precision CNC Systems',
        model: 'PCNC-2000',
      },
      {
        name: 'Air Compressor Station',
        type: 'Air Compressor',
        description: 'Industrial air compressor for pneumatic systems',
        manufacturer: 'AirTech Industries',
        model: 'AT-1500',
      },
    ];

    const savedMachines = await machineRepository.save(machines);
    console.log(`✅ Seeded ${savedMachines.length} machines`);

    // Seed Error Codes
    const errorCodes = [
      {
        code: 'E45',
        meaning: 'Overheating',
        description: 'Machine temperature exceeds safe operating limits',
        troubleshootingSteps: '1. Check cooling fan operation\n2. Inspect ventilation system\n3. Reduce machine load\n4. Clean air filters\n5. Check for blocked vents',
        machineId: savedMachines[0].id,
      },
      {
        code: 'E12',
        meaning: 'Motor Overload',
        description: 'Motor is drawing excessive current',
        troubleshootingSteps: '1. Check motor load\n2. Inspect for mechanical binding\n3. Verify power supply voltage\n4. Check motor bearings\n5. Reduce operational load',
        machineId: savedMachines[1].id,
      },
      {
        code: 'M101',
        meaning: 'Spindle Error',
        description: 'CNC spindle malfunction detected',
        troubleshootingSteps: '1. Check spindle motor connections\n2. Inspect spindle bearings\n3. Verify spindle speed settings\n4. Check for tool holder issues\n5. Review CNC program parameters',
        machineId: savedMachines[2].id,
      },
      {
        code: 'C88',
        meaning: 'Low Air Pressure',
        description: 'Compressed air pressure below required threshold',
        troubleshootingSteps: '1. Check air filter condition\n2. Inspect for air leaks\n3. Verify compressor oil level\n4. Check pressure regulator settings\n5. Inspect air lines for blockages',
        machineId: savedMachines[3].id,
      },
      {
        code: 'E23',
        meaning: 'Belt Slippage',
        description: 'Conveyor belt is slipping on drive pulley',
        troubleshootingSteps: '1. Check belt tension\n2. Inspect belt condition\n3. Verify pulley alignment\n4. Check for material buildup\n5. Inspect drive motor',
        machineId: savedMachines[0].id,
      },
    ];

    await errorCodeRepository.save(errorCodes);
    console.log(`✅ Seeded ${errorCodes.length} error codes`);

    // Seed Maintenance Schedules
    const maintenanceSchedules = [
      {
        task: 'Oil Change',
        description: 'Replace hydraulic oil and filter',
        frequency: 'Every 1000 operating hours',
        steps: '1. Shut down machine safely\n2. Drain old oil\n3. Replace oil filter\n4. Fill with recommended oil type\n5. Check oil level\n6. Test operation',
        machineId: savedMachines[1].id,
      },
      {
        task: 'Belt Inspection',
        description: 'Inspect and adjust conveyor belt',
        frequency: 'Monthly',
        steps: '1. Check belt tension\n2. Inspect for wear or damage\n3. Clean belt surface\n4. Adjust tracking if needed\n5. Lubricate bearings\n6. Document findings',
        machineId: savedMachines[0].id,
      },
      {
        task: 'Spindle Maintenance',
        description: 'Clean and lubricate CNC spindle',
        frequency: 'Every 500 hours',
        steps: '1. Power down machine\n2. Remove tool holder\n3. Clean spindle taper\n4. Apply recommended lubricant\n5. Reinstall tool holder\n6. Run test program',
        machineId: savedMachines[2].id,
      },
      {
        task: 'Air Filter Replacement',
        description: 'Replace compressor air filter',
        frequency: 'Quarterly',
        steps: '1. Shut off compressor\n2. Remove old filter\n3. Clean filter housing\n4. Install new filter\n5. Check filter seal\n6. Restart and verify pressure',
        machineId: savedMachines[3].id,
      },
      {
        task: 'General Inspection',
        description: 'Comprehensive machine inspection',
        frequency: 'Weekly',
        steps: '1. Visual inspection of all components\n2. Check for unusual sounds\n3. Verify safety systems\n4. Check fluid levels\n5. Inspect electrical connections\n6. Document any issues',
        machineId: savedMachines[0].id,
      },
    ];

    await maintenanceRepository.save(maintenanceSchedules);
    console.log(`✅ Seeded ${maintenanceSchedules.length} maintenance schedules`);

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

seed();

