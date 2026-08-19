import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, DestroyRef, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { User } from '../../core/models/user.interface';
import { SessionService } from '../../core/services/session.service';
import { UserService } from '../../core/services/user.service';
import { MaterialModule } from "../../shared/material.module";
import { AsyncPipe, UpperCasePipe } from "@angular/common";
import { Observable } from 'rxjs';
import { IconButtonComponent } from "../../shared/components/icon-button/icon-button.component";
import { PageTitleComponent } from "../../shared/components/page-title/page-title.component";
import { RecordDatesComponent } from "../../shared/components/record-dates/record-dates.component";

@Component({
  selector: 'app-me',
  imports: [AsyncPipe, UpperCasePipe, MaterialModule, IconButtonComponent, PageTitleComponent, RecordDatesComponent],
  templateUrl: './me.component.html'
})
export class MeComponent {
  private router = inject(Router);
  private sessionService = inject(SessionService);
  private matSnackBar = inject(MatSnackBar);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  public user$: Observable<User> = this.userService.getById(this.sessionService.sessionInformation!.id.toString())
  
  public delete(): void {
    this.userService
      .delete(this.sessionService.sessionInformation!.id.toString())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.matSnackBar.open("Your account has been deleted !", 'Close', { duration: 3000 });
        this.sessionService.logOut();
        this.router.navigate(['/']);
      })
  }

}
