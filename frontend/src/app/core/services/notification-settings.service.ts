import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationSetting } from '../../shared/models/notification-setting.model';
import {ApiService} from './api.service';

@Injectable()
export class NotificationSettingsService {
  private readonly ctrlUrl = 'NotificationSettings';

  constructor(private apiService: ApiService) { }

  public update(id: number, entity: NotificationSetting): Observable<Object> {
    return this.apiService.put(`/${this.ctrlUrl}/${id}`, entity);
  }

  public updateAll(entities: NotificationSetting[]): Observable<Object> {
    return this.apiService.put(`/${this.ctrlUrl}`, entities);
  }

  public getByUserId(userId: string): Observable<NotificationSetting[]> {
    return this.apiService.get(`/${this.ctrlUrl}/${userId}`) as Observable<NotificationSetting[]>;
  }
}
