import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Machine {
  id: number;
  name: string;
  type: string;
  description?: string;
  manufacturer?: string;
  model?: string;
  commonIssues?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MachineService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getAllMachines(): Observable<Machine[]> {
    return this.http.get<Machine[]>(`${this.apiUrl}/machines`);
  }

  getMachine(id: number): Observable<Machine> {
    return this.http.get<Machine>(`${this.apiUrl}/machines/${id}`);
  }
}




