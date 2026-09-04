import { Injectable } from '@angular/core';

export interface AquaUser {
  fullName: string;
  mobile: string;
  email: string;
  designation: string;
  department: string;
  state: string;
  district: string;
  tehsil: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {

  private readonly USER_KEY = 'AquaSentinalUser';
  private readonly SESSION_KEY = 'AquaSentinalSession';


  // =========================
  // GET USER
  // =========================

  getUser(): AquaUser | null {

    const user = localStorage.getItem(this.USER_KEY);

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as AquaUser;
    } catch {
      return null;
    }
  }


  // =========================
  // SET USER
  // =========================

  setUser(user: AquaUser): void {

    localStorage.setItem(
      this.USER_KEY,
      JSON.stringify(user)
    );

  }


  // =========================
  // USER DETAILS
  // =========================

  getDesignation(): string {

    return this.getUser()?.designation || '';

  }


  getDepartment(): string {

    return this.getUser()?.department || '';

  }


  getState(): string {

    return this.getUser()?.state || '';

  }


  getDistrict(): string {

    return this.getUser()?.district || '';

  }


  getTehsil(): string {

    return this.getUser()?.tehsil || '';

  }


  // =========================
  // CREATE SESSION
  // =========================

  createSession(): void {

    localStorage.setItem(
      this.SESSION_KEY,
      JSON.stringify({
        loggedIn: true,
        loginTime: new Date().toISOString()
      })
    );

  }


  // =========================
  // CHECK LOGIN
  // =========================

  isLoggedIn(): boolean {

    const session =
      localStorage.getItem(this.SESSION_KEY);

    if (!session) {
      return false;
    }

    try {

      const data = JSON.parse(session);

      return data.loggedIn === true;

    } catch {

      return false;

    }
  }


  // =========================
  // ROLE DETECTION
  // =========================

  getRole(): string {

    const designation =
      this.getDesignation().toLowerCase();


    // State level
    if (
      designation.includes('state') ||
      designation.includes('sdma') ||
      designation.includes('state disaster')
    ) {

      return 'state';

    }


    // District level
    if (
      designation.includes('district') ||
      designation.includes('dm') ||
      designation.includes('collector') ||
      designation.includes('administration')
    ) {

      return 'district';

    }


    // Emergency / Control Room
    if (
      designation.includes('emergency') ||
      designation.includes('operations') ||
      designation.includes('control room')
    ) {

      return 'emergency';

    }


    // Field Response
    if (
      designation.includes('field') ||
      designation.includes('response') ||
      designation.includes('rescue')
    ) {

      return 'field';

    }


    // Technical / Analyst
    if (
      designation.includes('technical') ||
      designation.includes('analyst') ||
      designation.includes('data') ||
      designation.includes('engineer')
    ) {

      return 'analyst';

    }


    // Default
    return 'district';

  }


  // =========================
  // ROLE DISPLAY NAME
  // =========================

  getRoleName(): string {

    switch (this.getRole()) {

      case 'state':
        return 'State Operations';

      case 'district':
        return 'District Operations';

      case 'emergency':
        return 'Emergency Control Room';

      case 'field':
        return 'Field Response';

      case 'analyst':
        return 'Technical Intelligence';

      default:
        return 'District Operations';

    }

  }


  // =========================
  // LOGOUT
  // =========================

  logout(): void {

    localStorage.removeItem(
      this.SESSION_KEY
    );

  }


  // =========================
  // CLEAR ACCOUNT
  // =========================

  clearAccount(): void {

    localStorage.removeItem(
      this.USER_KEY
    );

    localStorage.removeItem(
      this.SESSION_KEY
    );

  }

}