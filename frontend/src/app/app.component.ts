import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Maintenance Query Agent';
  selectedMachineId?: number;

  onMachineSelected(machineId: number | undefined) {
    this.selectedMachineId = machineId;
  }
}
