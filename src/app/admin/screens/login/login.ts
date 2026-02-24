import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '../../../service/auth-service';
import { PasswordService } from '../../../service/password-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';

// Validatore custom per controllare che le password coincidano
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return newPassword === confirmPassword ? null : { mismatch: true };
};

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrls: [
    './login.css',
    '../../../../../public/css/form.css',
    '../../../../../public/css/typography.css',
  ],
})
export class Login {
  loginForm!: FormGroup;
  resetForm!: FormGroup;

  pageIndex = 0; // 0: Login, 1: Richiesta Token, 2: Reset Password
  loading = false;

  protected readonly ArrowLeft01Icon = ArrowLeft01Icon;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private passwordService: PasswordService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initForms();
  }

  private initForms() {
    this.loginForm = this.formBuilder.group({
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern('^\\+?[0-9]{10}$')
      ]],
      password: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*\d).{8,}$/)
      ]]
    });

    this.resetForm = this.formBuilder.group({
      token: ['', [
        Validators.required,
        Validators.pattern('^[0-9]+$')
      ]],
      newPassword: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*\d).{8,}$/)
      ]],
      confirmPassword: ['', [
        Validators.required
      ]]
    }, { validators: passwordMatchValidator });
  }


  onPasswordForgetClick() {
    this.pageIndex = 1;
    this.loginForm.get('password')?.clearValidators();
    this.loginForm.get('password')?.updateValueAndValidity();
    this.loginForm.markAsUntouched();
  }

  goBack() {
    if (this.pageIndex === 1) {
      this.pageIndex = 0;
      this.loginForm.get('password')?.setValidators([Validators.required, Validators.pattern(/^(?=.*\d).{8,}$/)]);
      this.loginForm.get('password')?.updateValueAndValidity();
    } else if (this.pageIndex === 2) {
      this.pageIndex = 0;
      this.resetForm.reset();
      this.loginForm.get('password')?.setValidators([Validators.required, Validators.pattern(/^(?=.*\d).{8,}$/)]);
      this.loginForm.get('password')?.updateValueAndValidity();
    }
  }


  onSubmit() {
    if (this.pageIndex === 0) this.login();
    else if (this.pageIndex === 1) this.requestReset();
    else this.reset();
  }

  private login() {
    if (this.loginForm.valid && !this.loading) {
      this.loading = true;

      this.authService.signIn(
        this.loginForm.value.phoneNumber!,
        this.loginForm.value.password!
      ).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigateByUrl(
            this.route.snapshot.queryParams['returnUrl'] || '/admin'
          ).then();
        },
        error: () => {
          alert('Credenziali non valide o errore di rete');
          this.loading = false;
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  private requestReset() {
    if (this.loginForm.valid && !this.loading) {
      this.loading = true;
      this.passwordService.requestReset(this.loginForm.value.phoneNumber!).subscribe({
        next: () => {
          this.loading = false;
          this.pageIndex = 2;
          this.loginForm.reset();
        },
        error: (error) => {
          this.loading = false;
          console.error(error);
          alert('Impossibile inviare la richiesta. Riprova.');
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  private reset() {
    if (this.resetForm.valid && !this.loading) {
      this.loading = true;
      this.passwordService.reset(this.resetForm.value.token!, this.resetForm.value.newPassword!).subscribe({
        next: () => {
          this.loading = false;
          alert('Password aggiornata con successo. Effettua il login.');
          this.goBack(); // Torna al form di login
        },
        error: (error) => {
          this.loading = false;
          console.error(error);
          alert('Token non valido o scaduto.');
        }
      });
    } else {
      this.resetForm.markAllAsTouched();
    }
  }

  getFormControl(form: FormGroup, name: string) {
    return form.get(name);
  }
}
