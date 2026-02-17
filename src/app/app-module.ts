import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import {HugeiconsIconComponent} from '@hugeicons/angular';
import {ReactiveFormsModule} from '@angular/forms';
import {Service} from './customers/components/service/service';
import {Footer} from './customers/components/footer/footer';
import {Rating} from './customers/components/rating/rating';
import {AppFeature} from './customers/components/app-feature/app-feature';
import {AppStores} from './customers/components/app-stores/app-stores';
import {Login} from './admin/screens/login/login';
import {Home} from './customers/screen/home/home';
import {ListItem} from './admin/components/list-item/list-item';
import {CustomersPage} from './admin/customers-page/customers-page';
import {ToolsPage} from './admin/screens/tools-page/tools-page';
import {AdminHome} from './admin/admin-home/admin-home';

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
