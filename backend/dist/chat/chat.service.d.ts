import { MachineService } from '../machine/machine.service';
import { ErrorCodeService } from '../error-code/error-code.service';
import { MaintenanceService } from '../maintenance/maintenance.service';
import { QueryLogService } from '../query-log/query-log.service';
export declare class ChatService {
    private machineService;
    private errorCodeService;
    private maintenanceService;
    private queryLogService;
    constructor(machineService: MachineService, errorCodeService: ErrorCodeService, maintenanceService: MaintenanceService, queryLogService: QueryLogService);
    processQuery(query: string, machineId?: number): Promise<string>;
    diagnoseImage(imageDataUrl: string, machineId?: number, note?: string): Promise<string>;
    diagnoseParameters(request: {
        machineId?: number;
        machineType?: string;
        temperatureC: number;
        vibrationMmS: number;
        currentA: number;
        oilPressureBar?: number;
        rpm: number;
        runtimeHours: number;
        noiseLevel: 'normal' | 'unusual';
        leakObserved: boolean;
        note?: string;
    }): Promise<string>;
    estimateDataUrlBytes(dataUrl: string): number;
    getThresholdsForMachineType(machineType: string): {
        tempWarn: number;
        tempCritical: number;
        vibrationWarn: number;
        vibrationCritical: number;
        currentWarn: number;
        currentCritical: number;
        oilPressureMin: number;
        runtimeWarnHours: number;
    };
    getLikelyIssue(machineType: string, flags: string[]): string;
    getImmediateActions(machineType: string, condition: string, request: {
        leakObserved: boolean;
        noiseLevel: 'normal' | 'unusual';
    }): string[];
    private getDefaultBaseUrl;
    private getDefaultModel;
    private buildContext;
    private buildSystemPrompt;
    private getFallbackResponse;
}
