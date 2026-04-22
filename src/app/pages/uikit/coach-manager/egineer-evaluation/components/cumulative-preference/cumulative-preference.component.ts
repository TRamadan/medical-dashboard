import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-cumulative-preference',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './cumulative-preference.component.html',
  styleUrl: './cumulative-preference.component.scss'
})
export class CumulativePreferenceComponent implements OnInit {

  selectedCoach = 0;

  coaches = [
    { label: 'Eng. Karim Mostafa', icon: '⚠' },
    { label: 'Eng. Sarah Mohamed',  icon: '★' },
    { label: 'Eng. Ali Ahmed',   icon: null }
  ];

  stats: any[] = [];
  lineChartData: any;
  lineChartOptions: any;
  promotionItems: any[] = [];

  coachesData = [
    {
      stats: [
        { value: '2.8', label: 'Average this month' },
        { value: '42',  label: 'Sessions this month' },
        { value: '7.1', label: 'Linked NPS' },
        { value: '80%', label: 'Compliance Rate' }
      ],
      chartData: [2.9, 2.7, 2.9, 2.8, 2.8, 2.9, 2.6, 2.8, 2.5, 2.6, 2.4, 2.3],
      promotionItems: [
        { done: true,    label: '6 months in current position',                      valueLabel: 'Achieved' },
        { done: true,    label: '+30 completed sessions',                            valueLabel: '39 sessions' },
        { done: false,   label: 'Average weekly rating ≥ 3.5 for 6 consecutive weeks', valueLabel: 'Current: 2.8' },
        { done: false,   label: 'Linked NPS ≥ 8.0',                                  valueLabel: 'Current: 7.1' },
        { done: 'pending', label: 'Positive Calibration Report from Dr.',              valueLabel: 'Next Quarter' }
      ]
    },
    {
      stats: [
        { value: '4.5', label: 'Average this month' },
        { value: '64',  label: 'Sessions this month' },
        { value: '9.2', label: 'Linked NPS' },
        { value: '98%', label: 'Compliance Rate' }
      ],
      chartData: [3.8, 3.9, 4.0, 4.2, 4.1, 4.3, 4.4, 4.5, 4.6, 4.5, 4.6, 4.5],
      promotionItems: [
        { done: true,    label: '6 months in current position',                      valueLabel: 'Achieved' },
        { done: true,    label: '+30 completed sessions',                            valueLabel: '64 sessions' },
        { done: true,    label: 'Average weekly rating ≥ 3.5 for 6 consecutive weeks', valueLabel: 'Current: 4.5' },
        { done: true,    label: 'Linked NPS ≥ 8.0',                                  valueLabel: 'Current: 9.2' },
        { done: true,    label: 'Positive Calibration Report from Dr.',              valueLabel: 'Achieved' }
      ]
    },
    {
      stats: [
        { value: '3.5', label: 'Average this month' },
        { value: '28',  label: 'Sessions this month' },
        { value: '8.4', label: 'Linked NPS' },
        { value: '85%', label: 'Compliance Rate' }
      ],
      chartData: [3.1, 3.0, 3.2, 3.1, 3.3, 3.2, 3.4, 3.3, 3.5, 3.4, 3.6, 3.5],
      promotionItems: [
        { done: false,   label: '6 months in current position',                      valueLabel: '3 months' },
        { done: false,   label: '+30 completed sessions',                            valueLabel: '28 sessions' },
        { done: true,    label: 'Average weekly rating ≥ 3.5 for 6 consecutive weeks', valueLabel: 'Current: 3.5' },
        { done: true,    label: 'Linked NPS ≥ 8.0',                                  valueLabel: 'Current: 8.4' },
        { done: 'pending', label: 'Positive Calibration Report from Dr.',              valueLabel: 'Next Month' }
      ]
    }
  ];

  ngOnInit(): void {
    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: {
          grid: { color: 'rgba(0,0,0,0.06)' },
          ticks: { color: '#6b7280', font: { size: 11 } }
        },
        y: {
          min: 2,
          max: 5,
          grid: { color: 'rgba(0,0,0,0.06)' },
          ticks: { color: '#6b7280', font: { size: 11 }, stepSize: 1 }
        }
      }
    };

    this.selectCoach(0);
  }

  selectCoach(index: number): void {
    this.selectedCoach = index;
    const data = this.coachesData[index];
    this.stats = data.stats;
    this.promotionItems = data.promotionItems;
    
    const labels = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7', 'Wk 8', 'Wk 9', 'Wk 10', 'Wk 11', 'Wk 12'];

    this.lineChartData = {
      labels,
      datasets: [
        {
          label: 'Weekly Rating',
          data: data.chartData,
          fill: false,
          borderColor: '#ef4444',
          backgroundColor: '#ef4444',
          tension: 0.3,
          pointRadius: 5,
          pointBackgroundColor: '#ef4444',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        },
        {
          label: 'Minimum 3.0',
          data: Array(12).fill(3.0),
          borderColor: '#f59e0b',
          borderDash: [6, 4],
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false
        }
      ]
    };
  }
}
