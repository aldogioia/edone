import {Component, computed, input} from '@angular/core';
import {Door01Icon, ImageNotFound01Icon, PackageIcon, UserIcon} from '@hugeicons/core-free-icons';

@Component({
  selector: 'app-list-item',
  standalone: false,
  templateUrl: './list-item.html',
  styleUrl: './list-item.css',
})
export class ListItem {
  title = input.required<string>();
  type = input.required<string>();

  currentIcon = ImageNotFound01Icon;
  readonly icon = computed(() => {
    const type = this.type();
    if (type === 'customer') return UserIcon;
    if (type === 'tool') return PackageIcon;
    if (type === 'room') return Door01Icon;
    return ImageNotFound01Icon;
  });

}
