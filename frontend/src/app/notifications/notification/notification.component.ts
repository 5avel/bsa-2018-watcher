import { Component, OnInit } from '@angular/core';
import {NotificationsHubService} from '../../core/hubs/notifications.hub';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.sass']
})
export class NotificationComponent implements OnInit {

  constructor(private notificationsService: NotificationsHubService) { }

  ngOnInit() {
  }

  send(): void {
    this.notificationsService.send('someUserId', 'Message');
  }
  sendMessage(): void {
    this.notificationsService.sendMessage('Qew');
  }
}
