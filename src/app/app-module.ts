import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Footer } from './components/footer/footer';
import {HugeiconsIconComponent} from '@hugeicons/angular';
import { Service } from './components/service/service';
import { AppFeature } from './components/app-feature/app-feature';
import { AppStores } from './components/app-stores/app-stores';

@NgModule({
  declarations: [
    App,
    Service,
    Footer,
    AppFeature,
    AppStores
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HugeiconsIconComponent
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }
