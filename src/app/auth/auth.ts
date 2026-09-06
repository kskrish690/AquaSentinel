import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Router,
  RouterLink,
  ActivatedRoute
} from '@angular/router';

import { AuthService } from '../services/auth.service';
import {
  UserRoleService,
  AquaUser
} from '../services/user-role';

import { NotificationService } from '../services/notification.services';

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
    private userRoleService: UserRoleService,
    private notificationService: NotificationService
  ) {

    this.route.queryParams.subscribe(params => {

      if (params['mode'] === 'signup') {
        this.mode = 'signup';
      } else {
        this.mode = 'login';
      }

    });

  }


  // =====================================================
  // LOGIN
  // =====================================================

  login(): void {

    if (
      !this.loginData.email ||
      !this.loginData.password
    ) {

      this.notificationService.warning(
        'Please enter your official email and password.',
        'Login Details Required'
      );

      return;
    }


    this.loading = true;


    this.authService.login(
      this.loginData.email.trim(),
      this.loginData.password
    ).subscribe({

      next: (response) => {

        this.loading = false;


        if (
          response.success &&
          response.user
        ) {

          const user: AquaUser =
            response.user;


          // Store user profile
          this.userRoleService.setUser(user);


          // Create login session
          this.userRoleService.createSession();


          this.notificationService.success(
            `Welcome back, ${user.fullName}.`,
            'Login Successful'
          );


          this.router.navigate([
            '/dashboard'
          ]);

        } else {

          this.notificationService.error(
            response.message ||
            'Login failed. Please try again.',
            'Login Failed'
          );

        }

      },


      error: (error) => {

        this.loading = false;


        console.error(
          'Login error:',
          error
        );


        if (error.status === 401) {

          this.notificationService.error(
            error.error?.message ||
            'Invalid official email or password.',
            'Invalid Credentials'
          );

        } else if (error.status === 0) {

          this.notificationService.error(
            'Unable to connect to the authentication server. Please try again.',
            'Connection Failed'
          );

        } else {

          this.notificationService.error(
            error.error?.message ||
            'Something went wrong during login.',
            'Login Error'
          );

        }

      }

    });

  }


  // =====================================================
  // SIGNUP
  // =====================================================

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

      this.notificationService.warning(
        'Please complete all required fields.',
        'Required Information'
      );

      return;
    }


    if (
      this.signupData.password !==
      this.signupData.confirmPassword
    ) {

      this.notificationService.error(
        'The passwords you entered do not match.',
        'Password Mismatch'
      );

      return;
    }


    if (!this.signupData.terms) {

      this.notificationService.warning(
        'Please accept the terms and conditions to continue.',
        'Terms Required'
      );

      return;
    }


    if (
      this.signupData.password.length < 6
    ) {

      this.notificationService.warning(
        'Your password must contain at least 6 characters.',
        'Password Too Short'
      );

      return;
    }


    const user = {

      fullName:
        this.signupData.fullName.trim(),

      mobile:
        this.signupData.mobile.trim(),

      email:
        this.signupData.email.trim(),

      designation:
        this.signupData.designation.trim(),

      department:
        this.signupData.department.trim(),

      state:
        this.signupData.state.trim(),

      district:
        this.signupData.district.trim(),

      tehsil:
        this.signupData.tehsil.trim(),

      password:
        this.signupData.password

    };


    this.loading = true;


    this.authService
      .register(user)
      .subscribe({

        next: (response) => {

          this.loading = false;


          if (response.success) {

            this.notificationService.success(
              'Your account has been created. Please sign in to continue.',
              'Account Created'
            );


            // Clear passwords
            this.signupData.password = '';
            this.signupData.confirmPassword = '';


            // Switch to login
            this.mode = 'login';


            // Update URL
            this.router.navigate(
              ['/auth'],
              {
                queryParams: {
                  mode: 'login'
                }
              }
            );

          } else {

            this.notificationService.error(
              response.message ||
              'Unable to create your account.',
              'Registration Failed'
            );

          }

        },


        error: (error) => {

          this.loading = false;


          console.error(
            'Signup error:',
            error
          );


          if (error.status === 409) {

            this.notificationService.warning(
              error.error?.message ||
              'An account with this email or mobile number already exists.',
              'Account Already Exists'
            );

          } else if (error.status === 0) {

            this.notificationService.error(
              'Unable to connect to the authentication server. Please try again.',
              'Connection Failed'
            );

          } else {

            this.notificationService.error(
              error.error?.message ||
              'Something went wrong while creating your account.',
              'Registration Error'
            );

          }

        }

      });

  }


  // =====================================================
  // FORGOT PASSWORD
  // =====================================================

  forgotPassword(): void {

    this.notificationService.info(
      'Password recovery will be connected to the authentication backend.',
      'Password Recovery'
    );

  }

}