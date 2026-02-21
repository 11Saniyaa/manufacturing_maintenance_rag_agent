import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ChatComponent } from './components/chat/chat.component';
import { MachineSelectorComponent } from './components/machine-selector/machine-selector.component';
import { ErrorCodeSearchComponent } from './components/error-code-search/error-code-search.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    MachineSelectorComponent,
    ErrorCodeSearchComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

