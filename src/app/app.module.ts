import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {LoginButtonComponent} from './login/login-button/login-button.component';
import {GenerateButtonComponent} from './verification/generate-button/generate-button.component';
import {HttpClientModule} from "@angular/common/http";
import {QRCodeModule} from "angular2-qrcode";

@NgModule({
  declarations: [
    AppComponent,
    LoginButtonComponent,
    GenerateButtonComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    QRCodeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
