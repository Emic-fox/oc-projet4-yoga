import { HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";
import { SessionService } from "../services/session.service";
import { inject } from "@angular/core";

export function jwtInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const sessionService = inject(SessionService);
  if (sessionService.isLogged) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${sessionService.sessionInformation!.token}`,
      },
    });
  }
  return next(request);
}
