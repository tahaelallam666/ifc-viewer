import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorService, SensorReading } from '../../services/sensor.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sensor-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sensor-table.component.html',
  styleUrls: ['./sensor-table.component.css']
})
export class SensorTableComponent implements OnInit, OnDestroy, OnChanges {
  @Input() show: boolean = false;
  @Output() closeTable = new EventEmitter<void>();

  public allSensorsData: SensorReading[] = [];
  public isLoading: boolean = false;
  private pollingSubscription?: Subscription;

  constructor(private sensorService: SensorService) {}

  ngOnInit(): void {
    // Component initialized
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Detect when show input changes
    if (changes['show'] && changes['show'].currentValue === true) {
      console.log('Sensor table opened, loading data...');
      this.loadData();
    } else if (changes['show'] && changes['show'].currentValue === false) {
      // Stop polling when closed
      this.stopPolling();
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  loadData(): void {
    this.isLoading = true;
    this.stopPolling();

    console.log('Starting sensor data polling...');

    // Start polling for real-time data every 10 seconds
    this.pollingSubscription = this.sensorService.pollSensorData(10000).subscribe({
      next: (response) => {
        console.log('Sensor data response:', response);
        if (response.success && Array.isArray(response.data)) {
          this.allSensorsData = response.data as SensorReading[];
          console.log('Loaded sensors:', this.allSensorsData.length);
          this.isLoading = false;
        } else {
          console.warn('Invalid response format:', response);
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading sensor data:', error);
        this.isLoading = false;
      }
    });
  }

  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
    }
  }

  onClose(): void {
    this.stopPolling();
    this.closeTable.emit();
  }

  getSensorStatusClass(value: number, type: 'temperature' | 'humidity' | 'co2'): string {
    if (type === 'temperature') {
      if (value < 18 || value > 26) return 'text-warning';
      return 'text-success';
    } else if (type === 'humidity') {
      if (value < 30 || value > 60) return 'text-warning';
      return 'text-success';
    } else { // co2
      if (value > 1000) return 'text-danger';
      if (value > 800) return 'text-warning';
      return 'text-success';
    }
  }

  getStatusBadge(reading: SensorReading): { class: string; text: string } {
    const tempStatus = this.getSensorStatusClass(reading.temperature, 'temperature');
    const humidityStatus = this.getSensorStatusClass(reading.humidity, 'humidity');
    const co2Status = this.getSensorStatusClass(reading.co2, 'co2');

    if (tempStatus === 'text-danger' || humidityStatus === 'text-danger' || co2Status === 'text-danger') {
      return { class: 'bg-danger', text: 'Critical' };
    }
    if (tempStatus === 'text-warning' || humidityStatus === 'text-warning' || co2Status === 'text-warning') {
      return { class: 'bg-warning text-dark', text: 'Warning' };
    }
    return { class: 'bg-success', text: 'Normal' };
  }

  isCriticalRow(reading: SensorReading): boolean {
    const badge = this.getStatusBadge(reading);
    return badge.class === 'bg-danger';
  }
}
