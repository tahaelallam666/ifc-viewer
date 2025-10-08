import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface SensorReading {
  sensor_id: string;
  element_id: string;
  element_name: string;
  location: string;
  sensor_type: string;
  temperature: number;
  humidity: number;
  co2: number;
  timestamp: string;
}

export interface SensorResponse {
  success: boolean;
  count?: number;
  data: SensorReading[] | SensorReading;
  timestamp?: string;
}

export interface HistoricalReading {
  temperature: number;
  humidity: number;
  co2: number;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class SensorService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  /**
   * Get all sensors with their latest readings
   * Used by: Sensor Table Component
   */
  getAllSensors(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.apiUrl}/sensors/latest`);
  }

  /**
   * Get historical readings for a sensor
   * Used by: Historical Chart Component
   */
  getSensorHistory(sensorId: string, limit: number = 100): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sensors/${sensorId}/history?limit=${limit}`);
  }

  /**
   * Poll sensor data at regular intervals (for real-time updates)
   */
  pollSensorData(intervalMs: number = 30000): Observable<SensorResponse> {
    return interval(intervalMs).pipe(
      startWith(0),
      switchMap(() => this.getAllSensors())
    );
  }

  /**
   * Check API health
   */
  checkHealth(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/health`);
  }
}
