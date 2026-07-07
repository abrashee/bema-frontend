// src/app/features/auth/components/register.component.ts
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../auth-service';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, MatIconModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  registerForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email,
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
    confirmPassword: new FormControl('', [
      Validators.required,
    ]),
  }, { validators: this.passwordMatchValidator });

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.errorMessage.set('Please fill in all fields correctly');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { name, email, password } = this.registerForm.value;

    this.authService.register({
      name: name!,
      email: email!,
      password: password!,
    }).subscribe({
      next: (response) => {
        if (response.data) {
          this.notificationService.success('Registration successful');
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage.set(response.message || 'Registration failed');
          this.notificationService.error(response.message || 'Registration failed');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        const errorMsg = error?.error?.message || 'An error occurred during registration';
        this.errorMessage.set(errorMsg);
        this.notificationService.error(errorMsg);
        this.isLoading.set(false);
      },
    });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  get nameError(): string | null {
    const control = this.registerForm.get('name');
    if (!control || !control.touched) return null;
    if (control.hasError('required')) return 'Name is required';
    if (control.hasError('minlength')) return 'Name must be at least 2 characters';
    return null;
  }

  get emailError(): string | null {
    const control = this.registerForm.get('email');
    if (!control || !control.touched) return null;
    if (control.hasError('required')) return 'Email is required';
    if (control.hasError('email')) return 'Please enter a valid email';
    return null;
  }

  get passwordError(): string | null {
    const control = this.registerForm.get('password');
    if (!control || !control.touched) return null;
    if (control.hasError('required')) return 'Password is required';
    if (control.hasError('minlength')) return 'Password must be at least 8 characters';
    return null;
  }

  get confirmPasswordError(): string | null {
    const control = this.registerForm.get('confirmPassword');
    if (!control || !control.touched) return null;
    if (control.hasError('required')) return 'Please confirm your password';
    if (this.registerForm.hasError('passwordMismatch')) return 'Passwords do not match';
    return null;
  }

  get passwordsMatch(): boolean {
    return !this.registerForm.hasError('passwordMismatch') || !!this.registerForm.get('confirmPassword')?.untouched;
  }
}
