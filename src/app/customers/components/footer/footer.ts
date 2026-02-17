import { Component } from '@angular/core';
import {Facebook01Icon, InstagramFreeIcons, Location01Icon, SmartPhone02Icon} from '@hugeicons/core-free-icons';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {

  protected readonly Location01Icon = Location01Icon;
  protected readonly SmartPhone02Icon = SmartPhone02Icon;
  protected readonly Facebook01Icon = Facebook01Icon;
  protected readonly InstagramFreeIcons = InstagramFreeIcons;
}
