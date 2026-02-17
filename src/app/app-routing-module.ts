import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {Home} from './customers/screen/home/home';
import {Login} from './admin/screens/login/login';
import {AdminHome} from './admin/admin-home/admin-home';
import {CustomersPage} from './admin/screens/customers-page/customers-page';
import {ToolsPage} from './admin/screens/tools-page/tools-page';

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
