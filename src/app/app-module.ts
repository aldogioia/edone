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
import { StatisticCard } from './components/statistic-card/statistic-card';

@NgModule({
  declarations: [
    App,
    Service,
    Footer,
    Rating,
    Footer,
    AppFeature,
    AppStores,
    StatisticCard
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
