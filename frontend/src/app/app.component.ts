import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Manufacturing Equipment Maintenance Query Agent';
  selectedMachineId: number | null = null;

  onMachineSelected(machineId: number | null) {
    this.selectedMachineId = machineId;
  }
}

