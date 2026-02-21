import { Component } from '@angular/core';
import {
  BrushIcon, Calendar03Icon,
  CalendarBlock01Icon, DateTimeIcon,
  Door01Icon, Leaf01Icon,
  Logout02Icon,
  UserIcon,
  UserMultipleIcon
} from '@hugeicons/core-free-icons';

@Component({
  selector: 'app-admin-home',
  standalone: false,
  templateUrl: './admin-home.html',
  styleUrl: './admin-home.css',
})
export class AdminHome {

  protected readonly Logout02Icon = Logout02Icon;
  protected readonly Door01Icon = Door01Icon;
  protected readonly BrushIcon = BrushIcon;
  protected readonly UserMultipleIcon = UserMultipleIcon;
  protected readonly UserIcon = UserIcon;
  protected readonly CalendarBlock01Icon = CalendarBlock01Icon;
  protected readonly Calendar03Icon = Calendar03Icon;
  protected readonly DateTimeIcon = DateTimeIcon;
  protected readonly Leaf01Icon = Leaf01Icon;
}
