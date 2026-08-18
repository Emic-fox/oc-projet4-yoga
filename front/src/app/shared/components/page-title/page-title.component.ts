import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-page-title',
  imports: [MaterialModule, RouterLink],
  templateUrl: './page-title.component.html'
})
export class PageTitleComponent {
  @Input({ required: true }) title!: string;
  @Input() backRouterLink?: string | unknown[];

  public onClick(): void {
    if (!this.backRouterLink) {
      window.history.back();
    }
  }
}
