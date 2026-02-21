import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MachineService, Machine } from '../../services/machine.service';

@Component({
  selector: 'app-machine-selector',
  templateUrl: './machine-selector.component.html',
  styleUrls: ['./machine-selector.component.css']
})
export class MachineSelectorComponent implements OnInit {
  @Output() machineSelected = new EventEmitter<number | undefined>();

  machines: Machine[] = [];
  selectedMachineId?: number;
  isLoading: boolean = false;

  constructor(private machineService: MachineService) { }

  ngOnInit() {
    this.loadMachines();
  }

  loadMachines() {
    this.isLoading = true;
    this.machineService.getAllMachines().subscribe({
      next: (machines) => {
        this.machines = machines;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading machines:', error);
        this.isLoading = false;
      }
    });
  }

  onMachineChange() {
    this.machineSelected.emit(this.selectedMachineId);
  }

  clearSelection() {
    this.selectedMachineId = undefined;
    this.machineSelected.emit(undefined);
  }
}


