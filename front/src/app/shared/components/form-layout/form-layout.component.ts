import { Component, Input } from '@angular/core';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-form-layout',
  imports: [MaterialModule],
  templateUrl: './form-layout.component.html',
  styleUrls: ['./form-layout.component.scss']
})
export class FormLayoutComponent {
  @Input() maxWidth: string | null = null;
  @Input() title?: string;
}
