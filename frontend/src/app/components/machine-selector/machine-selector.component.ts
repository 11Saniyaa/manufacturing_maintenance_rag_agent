import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ApiService, Machine } from '../../services/api.service';

@Component({
  selector: 'app-machine-selector',
  templateUrl: './machine-selector.component.html',
  styleUrls: ['./machine-selector.component.css'],
})
export class MachineSelectorComponent implements OnInit {
  machines: Machine[] = [];
  selectedMachineId: number | null = null;
  @Output() machineSelected = new EventEmitter<number | null>();

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadMachines();
  }

  loadMachines() {
    this.apiService.getMachines().subscribe({
      next: (machines) => {
        this.machines = machines;
      },
      error: (error) => {
        console.error('Error loading machines:', error);
      },
    });
  }

  onMachineChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const machineId = selectElement.value ? +selectElement.value : null;
    this.selectedMachineId = machineId;
    this.machineSelected.emit(machineId);
  }

  clearSelection() {
    this.selectedMachineId = null;
    const selectElement = document.getElementById('machine-select') as HTMLSelectElement;
    if (selectElement) {
      selectElement.value = '';
    }
    this.machineSelected.emit(null);
  }
}

