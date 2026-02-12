import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Footer } from './components/footer/footer';
import {HugeiconsIconComponent} from '@hugeicons/angular';
import { Service } from './components/service/service';
import { Rating } from './components/rating/rating';
import { AppFeature } from './components/app-feature/app-feature';
import { AppStores } from './components/app-stores/app-stores';
import { Login } from './screen/login/login';
import {provideRouter} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import { Home } from './screen/home/home';


@NgModule({
  declarations: [
    App,
    Service,
    Footer,
    Rating,
    Footer,
    AppFeature,
    AppStores,
    Login,
    Home
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HugeiconsIconComponent,
    ReactiveFormsModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }
