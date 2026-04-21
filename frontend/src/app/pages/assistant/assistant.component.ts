import { Component } from '@angular/core';

@Component({
  selector: 'app-assistant-page',
  templateUrl: './assistant.component.html',
  styleUrls: ['./assistant.component.css'],
})
export class AssistantComponent {
  selectedMachineId?: number;

  onMachineSelected(machineId: number | undefined) {
    this.selectedMachineId = machineId;
  }
}
