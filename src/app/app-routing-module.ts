import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {Home} from './customers/screen/home/home';
import {Login} from './admin/screens/login/login';
import {AdminHome} from './admin/admin-home/admin-home';
import {CustomersPage} from './admin/screens/customers-page/customers-page';
import {ToolsPage} from './admin/screens/tools-page/tools-page';
import {RoomsPage} from './admin/screens/rooms-page/rooms-page';
import {authGuard} from './security/auth-guard';
import {OperatorsPage} from './admin/screens/operators-page/operators-page';
import {StandardSchedulePage} from './admin/screens/standard-schedule-page/standard-schedule-page';
import {ServicesPage} from './admin/screens/services-page/services-page';
import {ScheduleExceptionPage} from './admin/screens/schedule-exception-page/schedule-exception-page';
import {BookingPage} from './admin/screens/booking-page/booking-page';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // TODO: Change to home after development
  { path: 'home', component: Home, title: 'Home Page'},
  { path: 'login', component: Login, title: 'Login' },
  {
    path: 'admin',
    canActivate: [authGuard],
    component: AdminHome,
    title: 'Admin Home',
    children: [
      { path: '', redirectTo: 'bookings', pathMatch: 'full' },
      { path: 'customers', component: CustomersPage, title: 'Customers Page' },
      { path: 'operators', component: OperatorsPage, title: 'Operators Page' },
      { path: 'services', component: ServicesPage, title: 'Services Page' },
      { path: 'tools', component: ToolsPage, title: 'Tools Page' },
      { path: 'rooms', component: RoomsPage, title: 'Rooms Page' },
      { path: 'schedules', component: StandardSchedulePage, title: 'Standard Schedule Page' },
      { path: 'exceptions', component: ScheduleExceptionPage, title: 'Schedule Exception Page' },
      { path: 'bookings', component: BookingPage, title: 'Booking Page' }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
