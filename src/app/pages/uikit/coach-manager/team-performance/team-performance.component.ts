import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { TeamPerformanceService } from './services/team-performance.service';
import { CoachPerformanceCardDto, SRPEItemDto, TeamPerformanceDto } from '../models/coach-manager-api.model';

export interface LegendItem {
  name: string;
  percent: number;
  averageSRPE: number;
  color: string;
}

export interface MetricItem {
  label: string;
  value: number;
  pct: number;
  color: string;
}

export interface EnhancedCoachCard extends CoachPerformanceCardDto {
  initials: string;
  displayStation: string;
  scoreColor: string;
  avatarBg: string;
  avatarText: string;
  cardBorderLeft: string;
  trendText: string;
  trendBg: string;
  trendBadgeLabel: string;
  noteBorderColor: string;
  noteBg: string;
  metrics: MetricItem[];
}

@Component({
  selector: 'app-team-performance',
  imports: [CommonModule, ChartModule, SkeletonModule],
  templateUrl: './team-performance.component.html',
  styleUrl: './team-performance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamPerformanceComponent implements OnInit {
  private readonly performanceService = inject(TeamPerformanceService);

  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly performanceData = signal<TeamPerformanceDto | null>(null);

  readonly chartColors = ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6'];

  readonly sRPEDistribution = computed<SRPEItemDto[]>(() => this.performanceData()?.sRPEDistribution ?? []);
  readonly burnoutWarning = computed<boolean>(() => this.performanceData()?.burnoutWarning ?? false);
  readonly burnoutWarningMessage = computed<string>(() => this.performanceData()?.burnoutWarningMessage ?? '');
  readonly teamQualityScore = computed<number>(() => this.performanceData()?.teamQualityScore ?? 0);
  readonly rawCoachCards = computed<CoachPerformanceCardDto[]>(() => this.performanceData()?.coachCards ?? []);

  readonly legendItems = computed<LegendItem[]>(() => {
    return this.sRPEDistribution().map((item, index) => ({
      name: item.coachName.replace(/^(Eng\.|Dr\.)\s*/i, ''),
      percent: item.percentOfTeam,
      averageSRPE: item.averageSRPE,
      color: this.chartColors[index % this.chartColors.length]
    }));
  });

  readonly sRpeChartData = computed(() => {
    const items = this.legendItems();
    return {
      labels: items.map(i => i.name),
      datasets: [
        {
          data: items.map(i => i.percent),
          backgroundColor: items.map(i => i.color),
          hoverBackgroundColor: items.map(i => i.color),
          borderWidth: 0,
          borderRadius: 4
        }
      ]
    };
  });

  readonly sRpeChartOptions = computed(() => ({
    cutout: '62%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { label: string; parsed: number }) => ` ${ctx.label}: ${ctx.parsed}%`
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false
  }));

  readonly coachCards = computed<EnhancedCoachCard[]>(() => {
    return this.rawCoachCards().map(c => this.enhanceCoachCard(c));
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.performanceService.getTeamPerformance().subscribe({
      next: (data) => {
        this.performanceData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching team performance data:', err);
        this.error.set('Failed to load team performance data. Please try again.');
        this.loading.set(false);
      }
    });
  }

  private enhanceCoachCard(coach: CoachPerformanceCardDto): EnhancedCoachCard {
    const score = coach.compositeScore;
    const isHigh = score >= 4.0;
    const isMedium = score >= 3.0;

    let scoreColor = '#ef4444';
    let avatarBg = '#fef2f2';
    let avatarText = '#dc2626';
    let cardBorderLeft = '#ef4444';
    let noteBorderColor = '#ef4444';
    let noteBg = '#fef2f2';

    if (isHigh) {
      scoreColor = '#10b981';
      avatarBg = '#f0fdf4';
      avatarText = '#16a34a';
      cardBorderLeft = '#10b981';
      noteBorderColor = '#10b981';
      noteBg = '#f0fdf4';
    } else if (isMedium) {
      scoreColor = '#f59e0b';
      avatarBg = '#fffbeb';
      avatarText = '#d97706';
      cardBorderLeft = '#f59e0b';
      noteBorderColor = '#f59e0b';
      noteBg = '#fffbeb';
    }

    let trendText = '#6b7280';
    let trendBg = '#f3f4f6';
    let trendBadgeLabel = '• Stable';

    const trendLower = (coach.trend || '').toLowerCase();
    if (trendLower.includes('improved') || trendLower === 'improved') {
      trendText = '#16a34a';
      trendBg = '#f0fdf4';
      trendBadgeLabel = '↑ Improved';
    } else if (trendLower.includes('improving') || trendLower === 'improving') {
      trendText = '#16a34a';
      trendBg = '#f0fdf4';
      trendBadgeLabel = '↑ Improving';
    } else if (trendLower.includes('declining') || trendLower === 'declining') {
      trendText = '#dc2626';
      trendBg = '#fef2f2';
      trendBadgeLabel = '↓ Declining';
    }

    const metrics: MetricItem[] = [
      {
        label: 'Session Quality',
        value: Number(coach.sessionQuality.toFixed(1)),
        pct: Math.round((coach.sessionQuality / 5) * 100),
        color: this.getMetricColor(coach.sessionQuality)
      },
      {
        label: 'Protocol Coherence',
        value: Number(coach.protocolCoherence.toFixed(1)),
        pct: Math.round((coach.protocolCoherence / 5) * 100),
        color: this.getMetricColor(coach.protocolCoherence)
      },
      {
        label: 'Attendance & Punctuality',
        value: Number(coach.attendancePunctuality.toFixed(1)),
        pct: Math.round((coach.attendancePunctuality / 5) * 100),
        color: this.getMetricColor(coach.attendancePunctuality)
      },
      {
        label: 'Client Ratings',
        value: Number(coach.clientRatings.toFixed(1)),
        pct: Math.round((coach.clientRatings / 5) * 100),
        color: this.getMetricColor(coach.clientRatings)
      },
      {
        label: 'Professional Dev.',
        value: Number(coach.professionalDev.toFixed(1)),
        pct: Math.round((coach.professionalDev / 5) * 100),
        color: this.getMetricColor(coach.professionalDev)
      }
    ];

    return {
      ...coach,
      initials: this.getInitials(coach.coachName),
      displayStation: coach.stationLabel || 'Coach Team Member',
      scoreColor,
      avatarBg,
      avatarText,
      cardBorderLeft,
      trendText,
      trendBg,
      trendBadgeLabel,
      noteBorderColor,
      noteBg,
      metrics
    };
  }

  private getMetricColor(val: number): string {
    if (val >= 4.0) return '#10b981';
    if (val >= 3.0) return '#f59e0b';
    return '#ef4444';
  }

  private getInitials(name: string): string {
    if (!name) return 'C';
    const cleanName = name.replace(/^(Eng\.|Dr\.|Mr\.|Mrs\.|Ms\.)\s*/i, '').trim();
    const parts = cleanName.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleanName.substring(0, 2).toUpperCase();
  }
}
