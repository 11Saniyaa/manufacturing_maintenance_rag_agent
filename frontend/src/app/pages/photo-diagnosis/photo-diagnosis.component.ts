import { Component } from '@angular/core';

@Component({
  selector: 'app-photo-diagnosis-page',
  templateUrl: './photo-diagnosis.component.html',
  styleUrls: ['./photo-diagnosis.component.css'],
})
export class PhotoDiagnosisComponent {
  selectedMachineId?: number;

  onMachineSelected(machineId: number | undefined) {
    this.selectedMachineId = machineId;
  }
}
