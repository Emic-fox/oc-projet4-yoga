import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionInformation } from 'src/app/core/models/session-information.interface';
import { SessionService } from 'src/app/core/services/session.service';
import { AuthService } from '../../core/services/auth.service';
import {MaterialModule} from "../../shared/material.module";
import { LoginFormControls } from './login.interface';
import { FormLayoutComponent } from "../../shared/components/form-layout/form-layout.component";

@Component({
  selector: 'app-login',
  imports: [MaterialModule, FormLayoutComponent],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private sessionService = inject(SessionService);
  private destroyRef = inject(DestroyRef);

  public hide = true;
  public onError = false;

  public form: FormGroup<LoginFormControls> = this.fb.nonNullable.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(3)
      ]
    ]
  });

  public submit(): void {
    const loginRequest = this.form.getRawValue();
    this.authService
      .login(loginRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response: SessionInformation) => {
        this.sessionService.logIn(response);
        this.router.navigate(['/sessions']);
      },
      error: () => this.onError = true,
    });
  }
}
