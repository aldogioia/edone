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
import {ReactiveFormsModule} from '@angular/forms';
import { Home } from './screen/home/home';
import { ListItem } from './admin-components/list-item/list-item';
import { CustomersPage } from './screen/customers-page/customers-page';
import { ToolsPage } from './screen/tools-page/tools-page';
import { AdminHome } from './screen/admin-home/admin-home';

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
    Home,
    ListItem,
    CustomersPage,
    ToolsPage,
    AdminHome,
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
