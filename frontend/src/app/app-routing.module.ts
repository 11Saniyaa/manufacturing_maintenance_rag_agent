import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AssistantComponent } from './pages/assistant/assistant.component';
import { ErrorCodesComponent } from './pages/error-codes/error-codes.component';
import { MachinesComponent } from './pages/machines/machines.component';
import { PhotoDiagnosisComponent } from './pages/photo-diagnosis/photo-diagnosis.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'assistant', component: AssistantComponent },
  { path: 'photo-diagnosis', component: PhotoDiagnosisComponent },
  { path: 'error-codes', component: ErrorCodesComponent },
  { path: 'machines', component: MachinesComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
