import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ChatComponent } from './components/chat/chat.component';
import { MachineSelectorComponent } from './components/machine-selector/machine-selector.component';
import { ErrorCodeSearchComponent } from './components/error-code-search/error-code-search.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { AssistantComponent } from './pages/assistant/assistant.component';
import { ErrorCodesComponent } from './pages/error-codes/error-codes.component';
import { MachinesComponent } from './pages/machines/machines.component';
import { PhotoDiagnosisComponent } from './pages/photo-diagnosis/photo-diagnosis.component';
import { ParameterDiagnosisComponent } from './pages/parameter-diagnosis/parameter-diagnosis.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    MachineSelectorComponent,
    ErrorCodeSearchComponent,
    HomeComponent,
    AssistantComponent,
    ErrorCodesComponent,
    MachinesComponent,
    PhotoDiagnosisComponent,
    ParameterDiagnosisComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

