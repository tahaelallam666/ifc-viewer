import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorService, SensorReading } from '../../services/sensor.service';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

interface ChartData {
  labels: string[];
  temperature: number[];
  humidity: number[];
  co2: number[];
}

@Component({
  selector: 'app-historical-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historical-chart.component.html',
  styleUrls: ['./historical-chart.component.css']
})
export class HistoricalChartComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() show: boolean = false;
  @Output() closeChart = new EventEmitter<void>();

  @ViewChild('tempCanvas') tempCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('humidityCanvas') humidityCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('co2Canvas') co2Canvas?: ElementRef<HTMLCanvasElement>;

  public selectedTimeRange: 7 | 30 = 7;
  public isLoading: boolean = false;
  public allSensorsData: SensorReading[] = [];
  
  private tempChart?: Chart;
  private humidityChart?: Chart;
  private co2Chart?: Chart;
  private isViewInitialized = false;

  constructor(private sensorService: SensorService) {}

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    // Charts will be created when data is loaded via ngOnChanges
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Detect when show input changes
    if (changes['show'] && changes['show'].currentValue === true && this.isViewInitialized) {
      console.log('Historical chart opened, loading data...');
      this.loadData(7);
    } else if (changes['show'] && changes['show'].currentValue === false) {
      this.destroyCharts();
    }
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  loadData(days: 7 | 30): void {
    this.selectedTimeRange = days;
    this.isLoading = true;

    // Load all sensors
    this.sensorService.getAllSensors().subscribe({
      next: async (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.allSensorsData = response.data as SensorReading[];
          
          // Load historical data for first sensor
          if (this.allSensorsData.length > 0) {
            await this.loadChartData(this.allSensorsData[0].sensor_id, days);
          }
          
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.isLoading = false;
      }
    });
  }

  async loadChartData(sensorId: string, days: number): Promise<void> {
    const limit = days === 7 ? 168 : 720; // hourly data
    
    this.sensorService.getSensorHistory(sensorId, limit).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.createCharts(response.data, days);
        }
      },
      error: (error) => {
        console.error('Error loading chart data:', error);
      }
    });
  }

  createCharts(historicalData: any[], days: number): void {
    const sortedData = [...historicalData].reverse(); // oldest to newest
    
    const chartData: ChartData = {
      labels: sortedData.map((reading: any) => {
        const date = new Date(reading.timestamp);
        return days === 7 
          ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      temperature: sortedData.map((r: any) => r.temperature),
      humidity: sortedData.map((r: any) => r.humidity),
      co2: sortedData.map((r: any) => r.co2)
    };

    // Destroy existing charts
    this.destroyCharts();

    // Create Temperature Chart
    if (this.tempCanvas) {
      this.tempChart = new Chart(this.tempCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: [{
            label: 'Temperature (°C)',
            data: chartData.temperature,
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            title: {
              display: true,
              text: `Temperature Trend (${days} Days)`
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              title: {
                display: true,
                text: 'Temperature (°C)'
              }
            }
          }
        }
      });
    }

    // Create Humidity Chart
    if (this.humidityCanvas) {
      this.humidityChart = new Chart(this.humidityCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: [{
            label: 'Humidity (%)',
            data: chartData.humidity,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            title: {
              display: true,
              text: `Humidity Trend (${days} Days)`
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Humidity (%)'
              }
            }
          }
        }
      });
    }

    // Create CO2 Chart
    if (this.co2Canvas) {
      this.co2Chart = new Chart(this.co2Canvas.nativeElement, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: [{
            label: 'CO₂ (ppm)',
            data: chartData.co2,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            title: {
              display: true,
              text: `CO₂ Levels Trend (${days} Days)`
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'CO₂ (ppm)'
              }
            }
          }
        }
      });
    }
  }

  destroyCharts(): void {
    if (this.tempChart) {
      this.tempChart.destroy();
      this.tempChart = undefined;
    }
    if (this.humidityChart) {
      this.humidityChart.destroy();
      this.humidityChart = undefined;
    }
    if (this.co2Chart) {
      this.co2Chart.destroy();
      this.co2Chart = undefined;
    }
  }

  onClose(): void {
    this.destroyCharts();
    this.closeChart.emit();
  }

  switchTimeRange(days: 7 | 30): void {
    this.loadData(days);
  }
}
