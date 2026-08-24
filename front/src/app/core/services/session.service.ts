import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SessionInformation } from '../models/session-information.interface';

const SESSION_STORAGE_KEY = 'sessionInformation';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  public sessionInformation: SessionInformation | undefined = this.restoreSession();
  public isLogged = !!this.sessionInformation;

  private isLoggedSubject = new BehaviorSubject<boolean>(this.isLogged);

  public $isLogged(): Observable<boolean> {
    return this.isLoggedSubject.asObservable();
  }

  public logIn(user: SessionInformation): void {
    this.sessionInformation = user;
    this.isLogged = true;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    this.next();
  }

  public logOut(): void {
    this.sessionInformation = undefined;
    this.isLogged = false;
    localStorage.removeItem(SESSION_STORAGE_KEY);
    this.next();
  }

  private restoreSession(): SessionInformation | undefined {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return undefined;
    }
    try {
      return JSON.parse(raw) as SessionInformation;
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return undefined;
    }
  }

  private next(): void {
    this.isLoggedSubject.next(this.isLogged);
  }
}
