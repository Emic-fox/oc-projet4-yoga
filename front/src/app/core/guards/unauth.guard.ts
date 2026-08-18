import {inject, Injectable} from "@angular/core";
import {CanActivate, Router} from "@angular/router";
import { SessionService } from "../services/session.service";

@Injectable({providedIn: 'root'})
export class UnauthGuard implements CanActivate {
  private router = inject(Router);
  private sessionService = inject(SessionService);

  public canActivate(): boolean {
    if (this.sessionService.isLogged) {
      this.router.navigate(['rentals']);
      return false;
    }
    return true;
  }
}
