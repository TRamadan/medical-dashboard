import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-team-performance',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './team-performance.component.html',
  styleUrl: './team-performance.component.scss'
})
export class TeamPerformanceComponent implements OnInit {

  sRpeChartData: unknown;
  sRpeChartOptions: unknown;

  coaches = [
    {
      initials: 'KM',
      name: 'Eng. Karim',
      role: 'Senior • Recharger • 3 years experience',
      score: 78,
      scoreColor: '#f59e0b',
      scoreTrend: '- Stable',
      trendBg: '#f3f4f6',
      trendText: '#6b7280',
      avatarBg: '#f5f3ff',
      avatarText: '#7c3aed',
      cardBorderLeft: '#f59e0b',
      note: 'Weak point: Attendance & Punctuality - late for the third time this month, requires formal discussion.',
      noteBorderColor: '#f59e0b',
      noteBg: '#fffbeb',
      metrics: [
        { label: 'Execution Quality',     value: 8.5, pct: 85, color: '#10b981' },
        { label: 'Protocol Adherence',    value: 7.0, pct: 70, color: '#f59e0b' },
        { label: 'Attendance & Punctuality', value: 6.0, pct: 60, color: '#ef4444' },
        { label: 'Client Ratings',        value: 9.0, pct: 90, color: '#10b981' },
        { label: 'Professional Dev.',     value: 7.5, pct: 75, color: '#8b5cf6' }
      ]
    },
    {
      initials: 'SM',
      name: 'Eng. Sarah',
      role: 'Senior • Resilience • 4 years experience',
      score: 92,
      scoreColor: '#10b981',
      scoreTrend: '↑ Improved',
      trendBg: '#f0fdf4',
      trendText: '#16a34a',
      avatarBg: '#f0fdf4',
      avatarText: '#16a34a',
      cardBorderLeft: '#10b981',
      note: 'Smart graduation - tracking the athletic part excellently every 3 months.',
      noteBorderColor: '#10b981',
      noteBg: '#f0fdf4',
      metrics: [
        { label: 'Execution Quality',     value: 9.5, pct: 95, color: '#10b981' },
        { label: 'Protocol Adherence',    value: 9.2, pct: 92, color: '#10b981' },
        { label: 'Attendance & Punctuality', value: 10,  pct: 100, color: '#10b981' },
        { label: 'Client Ratings',        value: 9.8, pct: 98, color: '#10b981' },
        { label: 'Professional Dev.',     value: 8.8, pct: 88, color: '#8b5cf6' }
      ]
    },
    {
      initials: 'AA',
      name: 'Eng. Amr',
      role: 'Junior • Apex • 8 months experience',
      score: 72,
      scoreColor: '#f59e0b',
      scoreTrend: '↑ Improving',
      trendBg: '#f0fdf4',
      trendText: '#16a34a',
      avatarBg: '#fffbeb',
      avatarText: '#d97706',
      cardBorderLeft: '#f59e0b',
      note: 'Sometimes appears excessive in every session - normal progress for a beginner, review protocol weekly.',
      noteBorderColor: '#8b5cf6',
      noteBg: '#faf5ff',
      metrics: [
        { label: 'Execution Quality',     value: 7.6, pct: 76, color: '#f59e0b' },
        { label: 'Protocol Adherence',    value: 8.0, pct: 80, color: '#10b981' },
        { label: 'Attendance & Punctuality', value: 9.0, pct: 90, color: '#10b981' },
        { label: 'Client Ratings',        value: 7.6, pct: 76, color: '#f59e0b' },
        { label: 'Professional Dev.',     value: 6.5, pct: 65, color: '#8b5cf6' }
      ]
    }
  ];

  clarityScores = [
    { name: 'Eng. Karim', value: 8.5, pct: 80, color: '#10b981' },
    { name: 'Eng. Sarah', value: 9.2, pct: 95, color: '#10b981' },
    { name: 'Eng. Amr',   value: 6.8, pct: 65, color: '#f59e0b' }
  ];

  ngOnInit(): void {
    this.sRpeChartData = {
      labels: ['Amr', 'Sarah', 'Karim'],
      datasets: [
        {
          data: [15, 30, 55],
          backgroundColor: ['#d1d5db', '#10b981', '#f59e0b'],
          hoverBackgroundColor: ['#9ca3af', '#059669', '#d97706'],
          borderWidth: 0,
          borderRadius: 4
        }
      ]
    };

    this.sRpeChartOptions = {
      cutout: '62%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (ctx: { label: string; parsed: number }) =>
              ` ${ctx.label}: ${ctx.parsed}%`
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
  }
}
