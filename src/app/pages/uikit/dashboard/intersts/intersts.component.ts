import { Component, OnInit } from '@angular/core';
import { CardModule } from "primeng/card";
import { ToolbarModule } from "primeng/toolbar";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DatePickerModule } from 'primeng/datepicker';
import { TabsModule } from 'primeng/tabs';
import { MultiSelectModule } from 'primeng/multiselect';
import { FloatLabel } from 'primeng/floatlabel';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-intersts',
  imports: [FloatLabel, MultiSelectModule, TabsModule, DatePickerModule, FormsModule, CommonModule, CardModule, ToolbarModule, ChartModule],
  standalone: true,
  templateUrl: './intersts.component.html',
  styleUrl: './intersts.component.scss'
})
export class InterstsComponent implements OnInit {
  rangeDates = [this.getToday(), this.getNextDayAfter7Days()];
  locations: { name: string; id: number }[] = [];
  employees: { name: string; id: number }[] = [];
  selectedLocation: { name: string; id: number }[] = [];
  selectedEmployee: { name: string; id: number }[] = [];
  services: { name: string; id: number }[] = [];
  selectedService: { name: string; id: number }[] = [];

  // Example data for each location
  locationStats = {
    1: { name: 'Evo fitness club (3rd settelment)', views: 2, appointments: 19 },
    2: { name: 'Tawfikia Tennis Club (El Mohandseen)', views: 0, appointments: 14 }
  };

  // Example data for each employee
  employeeStats = {
    1: { name: 'Tarek Ahmed Ramadan', views: 5, appointments: 10 },
    2: { name: 'Ahmed Mohamed Ahmed', views: 3, appointments: 7 },
    3: { name: 'Kareem Mostafa Mohamed', views: 2, appointments: 5 }
  };

  // Example data for each service
  serviceStats = {
    1: { name: 'athelete profile', views: 4, appointments: 8 },
    2: { name: 'consultation', views: 2, appointments: 6 },
    3: { name: 'full-body', views: 3, appointments: 7 },
    4: { name: 'half-body', views: 1, appointments: 3 },
    5: { name: 'rehab session', views: 2, appointments: 5 }
  };

  chartData = {};
  employeeChartData = {};
  serviceChartData = {};

  chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: { color: '#374151' }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#374151' }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#e5e7eb' },
        ticks: { color: '#374151' }
      }
    }
  };

  getChartData() {
    // If nothing selected, show all
    const selected = (this.selectedLocation && this.selectedLocation.length > 0)
      ? this.selectedLocation
      : this.locations;
    const labels = selected.map((loc) => loc.name);
    const views = selected.map((loc) => this.locationStats[loc.id as 1 | 2]?.views ?? 0);
    const appointments = selected.map((loc) => this.locationStats[loc.id as 1 | 2]?.appointments ?? 0);
    return {
      labels,
      datasets: [
        {
          label: 'Views',
          backgroundColor: '#dde6ef',
          data: views,
          barPercentage: 0.6
        },
        {
          label: 'Appointments',
          backgroundColor: '#7ee11c',
          data: appointments,
          barPercentage: 0.6
        }
      ]
    };
  }

  getEmployeeChartData() {
    const selected = (this.selectedEmployee && this.selectedEmployee.length > 0)
      ? this.selectedEmployee
      : this.employees;
    const labels = selected.map((emp) => emp.name);
    const views = selected.map((emp) => this.employeeStats[emp.id as 1 | 2 | 3]?.views ?? 0);
    const appointments = selected.map((emp) => this.employeeStats[emp.id as 1 | 2 | 3]?.appointments ?? 0);
    return {
      labels,
      datasets: [
        {
          label: 'Views',
          backgroundColor: '#dde6ef',
          data: views,
          barPercentage: 0.6
        },
        {
          label: 'Appointments',
          backgroundColor: '#7ee11c',
          data: appointments,
          barPercentage: 0.6
        }
      ]
    };
  }

  getServiceChartData() {
    const selected = (this.selectedService && this.selectedService.length > 0)
      ? this.selectedService
      : this.services;
    const labels = selected.map((srv) => srv.name);
    const views = selected.map((srv) => this.serviceStats[srv.id as 1 | 2 | 3 | 4 | 5]?.views ?? 0);
    const appointments = selected.map((srv) => this.serviceStats[srv.id as 1 | 2 | 3 | 4 | 5]?.appointments ?? 0);
    return {
      labels,
      datasets: [
        {
          label: 'Views',
          backgroundColor: '#dde6ef',
          data: views,
          barPercentage: 0.6
        },
        {
          label: 'Appointments',
          backgroundColor: '#7ee11c',
          data: appointments,
          barPercentage: 0.6
        }
      ]
    };
  }

  getNext7Days(): string[] {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return days;
  }

  getToday(): Date {
    return new Date();
  }

  getNextDayAfter7Days(): Date {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  }

  setChartDataBasedOnSelectedLocation(ev: any): void {
    this.chartData = this.getChartData();
  }

  setEmployeeChartDataBasedOnSelectedEmployee(ev: any): void {
    this.employeeChartData = this.getEmployeeChartData();
  }

  setServiceChartDataBasedOnSelectedService(ev: any): void {
    this.serviceChartData = this.getServiceChartData();
  }

  ngOnInit() {
    this.locations = [
      { name: 'Evo fitness club (3rd settelment)', id: 1 },
      { name: 'Tawfikia Tennis Club (El Mohandseen)', id: 2 }
    ];

    this.employees = [
      { name: 'Tarek Ahmed Ramadan', id: 1 },
      { name: 'Ahmed Mohamed Ahmed', id: 2 },
      { name: 'Kareem Mostafa Mohamed', id: 3 }
    ];

    this.services = [
      { name: 'athelete profile', id: 1 },
      { name: 'consultation', id: 2 },
      { name: 'full-body', id: 3 },
      { name: 'half-body', id: 4 },
      { name: 'rehab session', id: 5 }
    ];
    this.selectedLocation = [];
    this.selectedEmployee = [];
    this.selectedService = [];
    this.chartData = this.getChartData();
    this.employeeChartData = this.getEmployeeChartData();
    this.serviceChartData = this.getServiceChartData();
  }
}
