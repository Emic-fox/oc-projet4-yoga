import { Component, inject } from '@angular/core';
import {Router, RouterModule, RouterOutlet} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { SessionService } from './core/services/session.service';
import {MaterialModule} from "./shared/material.module";
import { AsyncPipe } from '@angular/common';
import { NavLinkComponent } from './shared/components/nav-link/nav-link.component';

@Component({
  selector: 'app-root',
  imports: [AsyncPipe, MaterialModule, RouterOutlet, RouterModule, NavLinkComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private sessionService = inject(SessionService);

  public $isLogged(): Observable<boolean> {
    return this.sessionService.$isLogged();
  }

  public logout(): void {
    this.sessionService.logOut();
    this.router.navigate([''])
  }
}
