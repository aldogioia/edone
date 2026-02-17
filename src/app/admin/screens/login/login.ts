import {Component, inject} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {AuthService} from '../../../service/auth-service';
import {PasswordService} from '../../../service/password-service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private formBuilder = inject(FormBuilder);

  // 0 -> Login
  // 1 -> Password Forget
  // 2 -> Insert Token for Password Reset
  pageIndex = 0

  constructor(
    private authService: AuthService,
    private passwordService: PasswordService
  ) {}

  loginForm = this.formBuilder.group({
    telephone: ['', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(10),
      Validators.pattern('^[0-9]*$')
    ]],
    password: ['', [
      Validators.required,
      Validators.pattern(/^(?=.*\d).{8,}$/)
    ]]
  })

  requestResetForm = this.formBuilder.group({
    telephone: ['', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(10),
      Validators.pattern('^[0-9]*$')
    ]]
  })

  resetForm = this.formBuilder.group({
    token: ['', [
      Validators.required,
      Validators.pattern('^[0-9]*$') // todo pattern nel backend
    ]],
    newPassword: ['', [
      Validators.required,
      Validators.pattern(/^(?=.*\d).{8,}$/)
    ]]
  })

  telephoneField = this.pageIndex === 0 ?
    this.loginForm.controls.telephone :
    this.pageIndex == 1 ?
      this.requestResetForm.controls.telephone :
      this.resetForm.controls.token

  passwordField = this.pageIndex === 0 ?
    this.loginForm.controls.password :
    this.resetForm.controls.newPassword

  checkTelephoneFieldError() {
    if(this.pageIndex === 0)
      return (this.loginForm.get('telephone')?.invalid && this.loginForm.get('telephone')?.touched)
    else if(this.pageIndex === 1)
      return (this.requestResetForm.get('telephone')?.invalid && this.requestResetForm.get('telephone')?.touched)
    else
      return (this.resetForm.get('token')?.invalid && this.resetForm.get('token')?.touched)
  }

  checkPasswordFieldError() {
    if(this.pageIndex === 0)
      return (this.loginForm.get('password')?.invalid && this.loginForm.get('password')?.touched)
    else
      return (this.resetForm.get('newPassword')?.invalid && this.resetForm.get('newPassword')?.touched)
  }

  private login() {
    if(this.loginForm.valid) {
      this.authService.signIn(this.loginForm.value.telephone!, this.loginForm.value.password!).subscribe({
        next: (response) => {
          // todo salvare i token
          alert("Login effettuato con successo")
        },
        error: (error) => {
          console.log(error);
          alert('Login failed: ' + error.message);
        }
      })
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  private requestReset() {
    if(this.requestResetForm.valid){
      this.passwordService.requestReset(this.requestResetForm.value.telephone!).subscribe({
        next: () => {
          this.pageIndex = 2;
          this.requestResetForm.reset()
        },
        error: (error) => {
          console.log(error);
          alert('Request failed: ' + error.message);
        }
      })
    } else {
      this.requestResetForm.markAllAsTouched();
    }
  }

  private reset() {
    if(this.resetForm.valid){
      this.passwordService.reset(this.resetForm.value.token!, this.resetForm.value.newPassword!).subscribe({
        next: () => {
          alert('Password reset successful. Please log in with your new password.');
          this.pageIndex = 0;
          this.resetForm.reset();
        },
        error: (error) => {
          console.log(error);
          alert('Password reset failed: ' + error.message);
        }
      })
    } else {
      this.resetForm.markAllAsTouched();
    }
  }

  onSubmit() {
    if(this.pageIndex === 0) this.login()
    else if(this.pageIndex === 1) this.requestReset()
    else this.reset()
  }

  onPasswordForgetClick() {
    this.pageIndex = 1;
    this.loginForm.markAsUntouched();
  }

  onBack() {
    this.pageIndex--;
    this.loginForm.reset()
  }
}
