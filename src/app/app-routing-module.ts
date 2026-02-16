import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {Login} from './screen/login/login';
import {Home} from './screen/home/home';

const routes: Routes = [
  { path: '', component: Home, title: 'Home Page'},
  { path: 'admin/login', component: Login, title: 'Admin Login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
