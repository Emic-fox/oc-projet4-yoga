import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-record-dates',
  imports: [DatePipe],
  templateUrl: './record-dates.component.html'
})
export class RecordDatesComponent {
  @Input() createdAt?: Date;
  @Input() updatedAt?: Date;
}
