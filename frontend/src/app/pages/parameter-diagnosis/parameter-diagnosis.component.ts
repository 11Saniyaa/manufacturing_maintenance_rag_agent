import { Component } from '@angular/core';
import { finalize } from 'rxjs';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-parameter-diagnosis',
  templateUrl: './parameter-diagnosis.component.html',
  styleUrls: ['./parameter-diagnosis.component.css'],
})
export class ParameterDiagnosisComponent {
  selectedMachineId?: number;
  machineType = 'Conveyor';

  temperatureC = 55;
  vibrationMmS = 3.5;
  currentA = 12;
  oilPressureBar?: number;
  rpm = 1450;
  runtimeHours = 120;
  noiseLevel: 'normal' | 'unusual' = 'normal';
  leakObserved = false;
  note = '';

  resultText = '';
  isLoading = false;
  errorText = '';

  readonly machineTypes = ['Conveyor', 'Motor', 'CNC', 'Air Compressor'];

  constructor(private chatService: ChatService) {}

  onMachineSelected(machineId: number | undefined) {
    this.selectedMachineId = machineId;
  }

  analyze() {
    this.errorText = '';
    this.resultText = '';

    if (this.temperatureC < 0 || this.temperatureC > 200) {
      this.errorText = 'Temperature value looks invalid.';
      return;
    }
    if (this.vibrationMmS < 0 || this.currentA < 0 || this.rpm < 0 || this.runtimeHours < 0) {
      this.errorText = 'Parameter values cannot be negative.';
      return;
    }

    this.isLoading = true;
    this.chatService
      .diagnoseParameters({
        machineId: this.selectedMachineId,
        machineType: this.machineType,
        temperatureC: this.temperatureC,
        vibrationMmS: this.vibrationMmS,
        currentA: this.currentA,
        oilPressureBar: this.oilPressureBar,
        rpm: this.rpm,
        runtimeHours: this.runtimeHours,
        noiseLevel: this.noiseLevel,
        leakObserved: this.leakObserved,
        note: this.note.trim() || undefined,
      })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          this.resultText = res.response;
        },
        error: (error) => {
          console.error('Parameter diagnosis failed:', error);
          this.errorText = 'Could not run parameter diagnosis. Please try again.';
        },
      });
  }
}
