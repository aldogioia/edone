import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {Login} from './screen/login/login';
import {Home} from './screen/home/home';
import {CustomersPage} from './screen/customers-page/customers-page';
import {ToolsPage} from './screen/tools-page/tools-page';
import {AdminHome} from './screen/admin-home/admin-home';

const routes: Routes = [
  { path: '', component: Home, title: 'Home Page'},
  { path: 'admin/login', component: Login, title: 'Admin Login' },
  {
    path: 'admin',
    component: AdminHome,
    title: 'Admin Home',
    children: [
      { path: 'customers', component: CustomersPage},
      { path: 'tools', component: ToolsPage},
    ]
  },



];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
