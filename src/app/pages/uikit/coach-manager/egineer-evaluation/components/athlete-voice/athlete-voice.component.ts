import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';

interface Feedback {
  text: string;
  station: string;
  date: string;
  stationColor: string;
}

@Component({
  selector: 'app-athlete-voice',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './athlete-voice.component.html',
  styleUrl: './athlete-voice.component.scss'
})
export class AthleteVoiceComponent implements OnInit {

  npsChartData: any;
  npsChartOptions: any;

  rankings = [
    { score: 9.2, label: 'Resilience Coach', name: '(Eng. Sarah Mohamed)',  color: '#10b981', pct: 92 },
    { score: 8.4, label: 'Apex Coach',       name: '(Eng. Ali Ahmed)',   color: '#f59e0b', pct: 84 },
    { score: 7.1, label: 'Recharger Coach',  name: '(Eng. Karim Mostafa)', color: '#f97316', pct: 71 }
  ];

  positiveFeedback: Feedback[] = [
    {
      text: '"Eng. Sarah knows exactly how to ensure I understand the exercise before I do it."',
      station: 'Resilience',
      date: 'Mar 22',
      stationColor: '#10b981'
    },
    {
      text: '"I felt the coach in Apex genuinely cared about my improvement, not just completing the session."',
      station: 'Apex',
      date: 'Mar 18',
      stationColor: '#f59e0b'
    },
    {
      text: '"Karim communicates well when he focuses — the issue is he\'s sometimes late."',
      station: 'Recharger',
      date: 'Mar 15',
      stationColor: '#f97316'
    }
  ];

  attentionFeedback: Feedback[] = [
    {
      text: '"Found him on his phone. I always make sure I understand before doing the exercise. Didn\'t feel he was present with me."',
      station: 'Recharger Station',
      date: 'Mar 20',
      stationColor: '#f97316'
    },
    {
      text: '"Session started 10 minutes late because of the coach. Affected my time."',
      station: 'Recharger Station',
      date: 'Mar 16',
      stationColor: '#f97316'
    },
    {
      text: '"Apex coach is good but sometimes pushes for another exercise before making sure I finished correctly."',
      station: 'Apex Station',
      date: 'Mar 11',
      stationColor: '#f59e0b'
    }
  ];

  ngOnInit(): void {
    this.npsChartData = {
      labels: ['Resilience Coach', 'Apex Coach', 'Recharger Coach'],
      datasets: [
        {
          axis: 'y',
          data: [9.2, 8.4, 7.1],
          backgroundColor: ['#10b981', '#f59e0b', '#f97316'],
          borderRadius: 4,
          borderSkipped: false
        }
      ]
    };

    this.npsChartOptions = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: { parsed: { x: number } }) => ` NPS: ${ctx.parsed.x}`
          }
        }
      },
      scales: {
        x: {
          min: 0,
          max: 10,
          grid: { color: 'rgba(0,0,0,0.06)' },
          ticks: { color: '#6b7280', font: { size: 11 } }
        },
        y: {
          grid: { display: false },
          ticks: { color: '#374151', font: { size: 11 } }
        }
      }
    };
  }
}
