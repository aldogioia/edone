import { Component } from '@angular/core';
import {
  BrushIcon, Calendar01Icon,
  CalendarBlock01Icon, DateTimeIcon,
  Door01Icon, Leaf01Icon,
  Logout02Icon,
  UserIcon,
  UserMultipleIcon
} from '@hugeicons/core-free-icons';
import {AuthService} from '../../service/auth-service';
import {ActivatedRoute, Router} from '@angular/router';

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
  protected readonly Calendar01Icon = Calendar01Icon;
  protected readonly DateTimeIcon = DateTimeIcon;
  protected readonly Leaf01Icon = Leaf01Icon;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  protected signOut() {
    this.authService.signOut().subscribe({
      next: () => {
        this.router.navigateByUrl(
          this.route.snapshot.queryParams['returnUrl'] || '/login'
        ).then();
      }
    });
  }

}
