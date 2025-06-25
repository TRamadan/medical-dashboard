import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CardModule } from "primeng/card";
import { ToolbarModule } from "primeng/toolbar";
import { DatePickerModule } from 'primeng/datepicker';
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-stats',
  imports: [FormsModule, CommonModule, CardModule, ToolbarModule, DatePickerModule, ChartModule],
  standalone: true,
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatsComponent {
  rangeDates = [this.getToday(), this.getNextDayAfter7Days()];

  // Summary values (dummy for now)
  approvedTotal = 12;
  approvedChange = -104;

  chartData = {
    labels: this.getNext7Days(),
    datasets: [
      {
        label: 'Approved',
        backgroundColor: '#4caf50',
        data: [12, 4, 0, 0, 2, 0, 0],
        borderRadius: 4,
        barPercentage: 0.6
      }
    ]
  };

  chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
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

  // New configuration for Percentage of Load chart
  totalPercent = 3.8;
  percentageOfLoadChartData = {
    labels: this.getNext7Days(),
    datasets: [
      {
        label: 'Percentage of Load',
        data: [5, 4.2, 3.8, 3.5, 3.2, 3.9, 3.8], // Example percentages
        borderColor: '#b388ff',
        backgroundColor: 'rgba(179,136,255,0.1)',
        pointBackgroundColor: '#b388ff',
        pointBorderColor: '#b388ff',
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: false,
        tension: 0.3,
        borderWidth: 2,
        showLine: true
      }
    ]
  };

  percentageOfLoadChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context: any) {
            return `${context.parsed.y}%`;
          }
        }
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
        ticks: {
          color: '#374151',
          callback: function (value: number) {
            return value + '%';
          }
        }
      }
    }
  };

  // New configuration for Percentage of Load chart
  totalRevenu = 0;
  revenuChartData = {
    labels: this.getNext7Days(),
    datasets: [
      {
        label: 'Percentage of Load',
        data: [900, 150, 0, 0, 0, 0, 0], // Example percentages
        borderColor: '#b388ff',
        backgroundColor: 'rgba(179,136,255,0.1)',
        pointBackgroundColor: '#b388ff',
        pointBorderColor: '#b388ff',
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: false,
        tension: 0.3,
        borderWidth: 2,
        showLine: true
      }
    ]
  };

  revenuChartConfiguration = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context: any) {
            return `${context.parsed.y}%`;
          }
        }
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
        ticks: {
          color: '#374151',
          callback: function (value: number) {
            return value + '%';
          }
        }
      }
    }
  };

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
}
