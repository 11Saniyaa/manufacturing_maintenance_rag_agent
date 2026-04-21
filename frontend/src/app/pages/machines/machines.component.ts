import { Component } from '@angular/core';

@Component({
  selector: 'app-machines-page',
  templateUrl: './machines.component.html',
  styleUrls: ['./machines.component.css'],
})
export class MachinesComponent {
  selectedMachineId?: number;

  onMachineSelected(machineId: number | undefined) {
    this.selectedMachineId = machineId;
  }
}
