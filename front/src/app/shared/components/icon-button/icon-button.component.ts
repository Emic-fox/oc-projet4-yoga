import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemePalette } from '@angular/material/core';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-icon-button',
  imports: [MaterialModule, RouterLink],
  templateUrl: './icon-button.component.html'
})
export class IconButtonComponent {
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) label!: string;
  @Input() color: ThemePalette = 'primary';
  @Input() routerLink?: string | unknown[];

  @Output() buttonClick = new EventEmitter<void>();

  public onClick(): void {
    if (!this.routerLink) {
      this.buttonClick.emit();
    }
  }
}
