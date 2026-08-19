import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-nav-link',
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet],
  templateUrl: './nav-link.component.html'
})
export class NavLinkComponent {
  @Input() link?: string | unknown[];

  @Output() linkClick = new EventEmitter<void>();

  public onClick(): void {
    if (!this.link) {
      this.linkClick.emit();
    }
  }
}
