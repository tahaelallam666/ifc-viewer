import { Component, ElementRef, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer/dist/index';
import { SensorTableComponent } from '../components/sensor-table/sensor-table.component';
import { HistoricalChartComponent } from '../components/historical-chart/historical-chart.component';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-ifc-viewer',
  standalone: true,
  imports: [
    CommonModule, 
    SensorTableComponent, 
    HistoricalChartComponent
  ],
  templateUrl: './ifc-viewer.component.html',
  styleUrls: ['./ifc-viewer.component.css']
})
export class IfcViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('viewerContainer', { static: false }) viewerContainer!: ElementRef;

  // Viewer state
  private viewer: any = null;
  public isModelLoaded = false;
  public isLoading = false;
  private selectedModelID: number | null = null;
  
  // Component visibility flags
  public showSensorTable = false;
  public showHistoricalChart = false;
  
  // User state
  public currentUser: User | null = null;

  constructor(private authService: AuthService) {
    // Get current user
    this.currentUser = this.authService.currentUserValue;
  }

  ngAfterViewInit(): void {
    this.initViewer();
  }

  ngOnDestroy(): void {
    if (this.viewer) {
      this.viewer.dispose();
      this.viewer = null;
    }
  }

  // ============ VIEWER INITIALIZATION ============
  
  private async initViewer(): Promise<void> {
    const container = this.viewerContainer.nativeElement;
    this.viewer = new IfcViewerAPI({ 
      container,
      backgroundColor: new THREE.Color(0xffffff)
    });
    
    // Initialize IFC.js with WASM
    await this.viewer.IFC.setWasmPath('assets/wasm/');
    
    this.viewer.axes.setAxes();
    this.viewer.grid.setGrid();
  }

  // ============ FILE UPLOAD ============
  
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.isLoading = true;

    try {
      if (!this.viewer) {
        throw new Error('Viewer not initialized');
      }

      const url = URL.createObjectURL(file);
      const model = await this.viewer.IFC.loadIfcUrl(url);
      
      if (!model || model.modelID === undefined) {
        throw new Error('Failed to load IFC model - model is null or invalid');
      }
      
      this.selectedModelID = model.modelID;
      this.isModelLoaded = true;
      URL.revokeObjectURL(url);
      
      console.log('IFC model loaded successfully, modelID:', this.selectedModelID);
    } catch (error) {
      console.error('Error loading IFC file:', error);
      alert('Failed to load IFC file. Make sure the WASM files are properly loaded.\nError: ' + (error as Error).message);
    } finally {
      this.isLoading = false;
    }
  }

  clearModel(): void {
    if (this.viewer && this.selectedModelID !== null) {
      this.viewer.IFC.deleteIfcModel(this.selectedModelID);
      this.selectedModelID = null;
      this.isModelLoaded = false;
      this.closeSensorTable();
      this.closeHistoricalChart();
    }
  }

  // ============ COMPONENT CONTROLS ============

  openSensorTable(): void {
    this.showSensorTable = true;
  }

  closeSensorTable(): void {
    this.showSensorTable = false;
  }

  openHistoricalChart(): void {
    this.showHistoricalChart = true;
  }

  closeHistoricalChart(): void {
    this.showHistoricalChart = false;
  }

  // ============ AUTHENTICATION ============

  onLogout(): void {
    this.authService.logout();
  }
}
