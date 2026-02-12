import {Component, inject} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {AuthService} from '../../service/auth-service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private formBuilder = inject(FormBuilder);
  constructor(private authService: AuthService) {
  }

  loginForm = this.formBuilder.group({
    telephone: ['', [
      Validators.required,
      Validators.minLength(9),
      Validators.maxLength(9),
      Validators.pattern('^[0-9]*$')
    ]],
    password: ['', [
      Validators.required,
      Validators.pattern(/^(?=.*\d).{8,}$/)
    ]]
  })

  login() {
    if(this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          // todo salvare i token
        },
        error: (error) => {
          alert('Login failed: ' + error.error.message);
        }
      })

    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
