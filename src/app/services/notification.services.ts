import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

export interface AppNotification {
  type: NotificationType;
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private notificationSubject =
    new BehaviorSubject<AppNotification | null>(null);

  notification$ =
    this.notificationSubject.asObservable();

  private timer: ReturnType<typeof setTimeout> | null = null;

  show(
    message: string,
    type: NotificationType = 'info',
    title?: string
  ): void {

    const defaultTitles: Record<NotificationType, string> = {
      success: 'Success',
      error: 'Something went wrong',
      warning: 'Attention',
      info: 'AquaSentinal'
    };

    this.notificationSubject.next({
      type,
      title: title || defaultTitles[type],
      message
    });

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.close();
    }, 4500);
  }

  success(message: string, title = 'Success'): void {
    this.show(message, 'success', title);
  }

  error(message: string, title = 'Something went wrong'): void {
    this.show(message, 'error', title);
  }

  warning(message: string, title = 'Attention'): void {
    this.show(message, 'warning', title);
  }

  info(message: string, title = 'AquaSentinal'): void {
    this.show(message, 'info', title);
  }

  close(): void {
    this.notificationSubject.next(null);

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}