import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmergencyApiService {

  private readonly API_BASE_URL =
    'https://https://airy-respect-production-572b.up.railway.app';

  private readonly API_URL =
    `${this.API_BASE_URL}/api/emergency`;

  private socket: Socket;

  constructor(
    private http: HttpClient
  ) {

    this.socket = io(
      this.API_BASE_URL,
      {
        transports: ['websocket', 'polling']
      }
    );

  }


  // =====================================================
  // CREATE EMERGENCY
  // =====================================================

  createEmergency(data: any): Observable<any> {

    return this.http.post(
      `${this.API_URL}/create`,
      data
    );

  }


  // =====================================================
  // GET ACTIVE EMERGENCY
  // =====================================================

  getActiveEmergency(): Observable<any> {

    return this.http.get(
      `${this.API_URL}/active`
    );

  }


  // =====================================================
  // ALERT DEPARTMENT
  // =====================================================

  alertDepartment(data: any): Observable<any> {

    return this.http.post(
      `${this.API_URL}/alert`,
      data
    );

  }


  // =====================================================
  // DEPLOY DEPARTMENT
  // =====================================================

  deployDepartment(data: any): Observable<any> {

    return this.http.post(
      `${this.API_URL}/deploy`,
      data
    );

  }


  // =====================================================
  // UPDATE STATUS
  // =====================================================

  updateStatus(data: any): Observable<any> {

    return this.http.post(
      `${this.API_URL}/status`,
      data
    );

  }


  // =====================================================
  // CLOSE EMERGENCY
  // =====================================================

  closeEmergency(data: any): Observable<any> {

    return this.http.post(
      `${this.API_URL}/close`,
      data
    );

  }


  // =====================================================
  // REGISTER FIREBASE PUSH TOKEN
  // =====================================================

  registerPushToken(token: string): Observable<any> {

    return this.http.post(
      `${this.API_URL}/push/register`,
      {
        token
      }
    );

  }


  // =====================================================
  // TRIGGER SOS PUSH NOTIFICATION
  // =====================================================

  triggerSOS(data: any = {}): Observable<any> {

    return this.http.post(
      `${this.API_URL}/push/sos`,
      data
    );

  }


  // =====================================================
  // REAL-TIME EVENTS
  // =====================================================

  onEmergencyCreated(): Observable<any> {

    return new Observable(
      observer => {

        this.socket.on(
          'emergency-created',
          data => observer.next(data)
        );

      }
    );

  }


  onDepartmentAlerted(): Observable<any> {

    return new Observable(
      observer => {

        this.socket.on(
          'department-alerted',
          data => observer.next(data)
        );

      }
    );

  }


  onDepartmentDeployed(): Observable<any> {

    return new Observable(
      observer => {

        this.socket.on(
          'department-deployed',
          data => observer.next(data)
        );

      }
    );

  }


  onDepartmentStatusUpdated(): Observable<any> {

    return new Observable(
      observer => {

        this.socket.on(
          'department-status-updated',
          data => observer.next(data)
        );

      }
    );

  }


  onEmergencyClosed(): Observable<any> {

    return new Observable(
      observer => {

        this.socket.on(
          'emergency-closed',
          data => observer.next(data)
        );

      }
    );

  }


  disconnect(): void {

    this.socket.disconnect();

  }

}