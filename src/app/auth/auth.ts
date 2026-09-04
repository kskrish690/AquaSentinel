import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Router,
  RouterLink,
  ActivatedRoute
} from '@angular/router';

import { AuthService } from '../services/auth.service';
import { UserRoleService, AquaUser } from '../services/user-role';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class Auth {

  mode: 'login' | 'signup' = 'login';

  showLoginPassword = false;
  showSignupPassword = false;
  showConfirmPassword = false;

  loginData = {
    email: '',
    password: '',
    remember: false
  };

  signupData = {
    fullName: '',
    mobile: '',
    email: '',
    designation: '',
    department: '',
    state: 'Uttarakhand',
    district: 'Rudraprayag',
    tehsil: '',
    password: '',
    confirmPassword: '',
    terms: false
  };

  loading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private userRoleService: UserRoleService
  ) {

    this.route.queryParams.subscribe(params => {

      if (params['mode'] === 'signup') {
        this.mode = 'signup';
      } else {
        this.mode = 'login';
      }

    });

  }


  // =========================
  // LOGIN
  // =========================

  login(): void {

    if (!this.loginData.email || !this.loginData.password) {

      alert('Please enter your official email and password.');

      return;
    }

    this.loading = true;

    this.authService.login(
      this.loginData.email.trim(),
      this.loginData.password
    ).subscribe({

      next: (response) => {

        this.loading = false;

        if (response.success && response.user) {

          const user: AquaUser = response.user;

          // Store ONLY user profile information
          this.userRoleService.setUser(user);

          // Create login session
          this.userRoleService.createSession();

          alert(`Welcome back, ${user.fullName}!`);

          this.router.navigate(['/dashboard']);

        } else {

          alert(
            response.message ||
            'Login failed. Please try again.'
          );

        }

      },

      error: (error) => {

        this.loading = false;

        console.error('Login error:', error);

        if (error.status === 401) {

          alert(
            error.error?.message ||
            'Invalid official email or password.'
          );

        } else if (error.status === 0) {

          alert(
            'Unable to connect to the authentication server. ' +
            'Please make sure the AquaSentinal backend is running.'
          );

        } else {

          alert(
            error.error?.message ||
            'Something went wrong during login.'
          );

        }

      }

    });

  }


  // =========================
  // SIGNUP
  // =========================

  signup(): void {

    if (
      !this.signupData.fullName ||
      !this.signupData.mobile ||
      !this.signupData.email ||
      !this.signupData.designation ||
      !this.signupData.department ||
      !this.signupData.state ||
      !this.signupData.district ||
      !this.signupData.password
    ) {

      alert('Please fill in all required fields.');

      return;
    }


    if (
      this.signupData.password !==
      this.signupData.confirmPassword
    ) {

      alert('Passwords do not match.');

      return;
    }


    if (!this.signupData.terms) {

      alert(
        'Please accept the terms and conditions to continue.'
      );

      return;
    }


    if (this.signupData.password.length < 6) {

      alert(
        'Password must be at least 6 characters long.'
      );

      return;
    }


    const user = {

      fullName: this.signupData.fullName.trim(),

      mobile: this.signupData.mobile.trim(),

      email: this.signupData.email.trim(),

      designation: this.signupData.designation.trim(),

      department: this.signupData.department.trim(),

      state: this.signupData.state.trim(),

      district: this.signupData.district.trim(),

      tehsil: this.signupData.tehsil.trim(),

      password: this.signupData.password

    };


    this.loading = true;


    this.authService.register(user).subscribe({

      next: (response) => {

        this.loading = false;

        if (response.success) {

          alert(
            'Account created successfully. Please login to continue.'
          );

          // Clear signup password fields
          this.signupData.password = '';
          this.signupData.confirmPassword = '';

          // Switch to login
          this.mode = 'login';

          // Also update URL
          this.router.navigate(
            ['/auth'],
            {
              queryParams: {
                mode: 'login'
              }
            }
          );

        } else {

          alert(
            response.message ||
            'Unable to create account.'
          );

        }

      },

      error: (error) => {

        this.loading = false;

        console.error('Signup error:', error);

        if (error.status === 409) {

          alert(
            error.error?.message ||
            'An account with this email or mobile number already exists.'
          );

        } else if (error.status === 0) {

          alert(
            'Unable to connect to the authentication server. ' +
            'Please make sure the AquaSentinal backend is running.'
          );

        } else {

          alert(
            error.error?.message ||
            'Something went wrong while creating your account.'
          );

        }

      }

    });

  }


  // =========================
  // FORGOT PASSWORD
  // =========================

  forgotPassword(): void {

    alert(
      'Password recovery will be connected to the authentication backend.'
    );

  }
}
