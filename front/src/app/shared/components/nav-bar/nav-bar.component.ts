import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SessionService } from '../../../core/services/session.service';
import { MaterialModule } from '../../material.module';
import { NavLinkComponent } from '../nav-link/nav-link.component';

@Component({
  selector: 'app-nav-bar',
  imports: [AsyncPipe, MaterialModule, NavLinkComponent],
  templateUrl: './nav-bar.component.html'
})
export class NavBarComponent {
  private sessionService = inject(SessionService);
  private router = inject(Router);

  public isLogged$: Observable<boolean> = this.sessionService.$isLogged();

  public logout(): void {
    this.sessionService.logOut();
    this.router.navigate(['']);
  }
}
