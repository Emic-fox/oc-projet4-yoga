import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SessionInformation } from '../../../../core/models/session-information.interface';
import { SessionService } from '../../../../core/services/session.service';
import { Session } from '../../../../core/models/session.interface';
import { SessionApiService } from '../../../../core/services/session-api.service';
import { MaterialModule } from "../../../../shared/material.module";
import { RouterModule } from "@angular/router";
import { AsyncPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-list',
  imports: [AsyncPipe, DatePipe, MaterialModule, RouterModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent {
  private sessionApiService = inject(SessionApiService);
  private sessionService = inject(SessionService);

  public sessions$: Observable<Session[]> = this.sessionApiService.all();

  get user(): SessionInformation | undefined {
    return this.sessionService.sessionInformation;
  }
}
