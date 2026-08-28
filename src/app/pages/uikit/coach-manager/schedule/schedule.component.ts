import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduelService } from '../services/scheduel.service';
import { TeamScheduleDto, TeamScheduleSessionDto } from '../models/coach-manager-api.model';

export interface CoachSlot {
  status: 'ended' | 'ongoing' | 'urgent' | 'returnToPlay' | 'resilience' | 'measurements' | 'upcoming' | 'empty';
  title?: string;
  subtitle?: string;
  badge?: string;
  icon?: string;
}

export interface Coach {
  id: string;
  name: string;
  clinic: string;
}

export interface TimeSlot {
  time: string;
  slots: {
    [coachId: string]: CoachSlot;
  };
}

@Component({
  selector: 'app-schedule',
  imports: [CommonModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScheduleComponent implements OnInit {
  private readonly scheduelService = inject(ScheduelService);

  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly scheduleDate = signal<string>('');

  readonly coaches = signal<Coach[]>([]);
  readonly timeSlots = signal<TimeSlot[]>([]);

  ngOnInit(): void {
    this.loadSchedule();
  }

  loadSchedule(): void {
    this.loading.set(true);
    this.error.set(null);

    this.scheduelService.getTeamSchedule().subscribe({
      next: (dto: TeamScheduleDto) => {
        this.scheduleDate.set(dto.date || '');
        if (dto.coaches && dto.coaches.length > 0) {
          this.processScheduleDto(dto);
        } else {
          this.coaches.set([]);
          this.timeSlots.set([]);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load team schedule:', err);
        this.coaches.set([]);
        this.timeSlots.set([]);
        this.loading.set(false);
      }
    });
  }

  private processScheduleDto(dto: TeamScheduleDto): void {
    const coachList: Coach[] = dto.coaches.map(c => ({
      id: String(c.coachId),
      name: c.coachName,
      clinic: c.stationLabel || 'CLINIC'
    }));
    this.coaches.set(coachList);

    // Group sessions by time
    const timeMap = new Map<string, { [coachId: string]: CoachSlot }>();

    for (const coach of dto.coaches) {
      const cId = String(coach.coachId);
      for (const session of coach.sessions) {
        const timeKey = session.time;
        if (!timeMap.has(timeKey)) {
          timeMap.set(timeKey, {});
        }
        const slotsObj = timeMap.get(timeKey)!;
        slotsObj[cId] = this.mapSessionToSlot(session);
      }
    }

    // Convert map to array sorted by time
    const slotsArray: TimeSlot[] = Array.from(timeMap.entries()).map(([time, slots]) => ({
      time,
      slots
    }));

    if (slotsArray.length > 0) {
      this.timeSlots.set(slotsArray);
    } else {
      this.timeSlots.set([]);
    }
  }

  private mapSessionToSlot(session: TeamScheduleSessionDto): CoachSlot {
    const badge = session.statusBadge || session.status;
    const badgeLower = badge.toLowerCase();

    let status: CoachSlot['status'] = 'upcoming';
    let icon: string | undefined = undefined;

    if (badgeLower.includes('urgent') || badgeLower.includes('late') || badgeLower.includes('missed') || badgeLower.includes('إحلال') || session.isUrgent) {
      status = 'urgent';
      icon = 'pi pi-exclamation-triangle';
    } else if (badgeLower.includes('completed') || badgeLower.includes('انتهت')) {
      status = 'ended';
    } else if (badgeLower.includes('inprogress') || badgeLower.includes('جاري')) {
      status = 'ongoing';
      icon = 'pi pi-clock';
    } else if (badgeLower.includes('measurement') || badgeLower.includes('مقاسات')) {
      status = 'measurements';
    } else if (badgeLower.includes('resilience')) {
      status = 'resilience';
    } else if (badgeLower.includes('return') || badgeLower.includes('play')) {
      status = 'returnToPlay';
    } else if (badgeLower.includes('confirmed')) {
      status = 'ongoing';
    }

    return {
      status,
      title: session.patientName,
      subtitle: session.phaseName || session.sessionType,
      badge: session.statusBadge,
      icon
    };
  }

  private loadFallbackMock(): void {
    this.timeSlots.set([
      {
        time: '10:00',
        slots: {
          'c1': { status: 'ended', title: 'ewarm - Apex', subtitle: 'تحليل الأداء الحركي', badge: 'انتهت' },
          'c2': { status: 'ended', title: 'ewarm - Resilience', subtitle: 'مراجعة البيانات الحيوية', badge: 'انتهت' },
          'c3': { status: 'ended', title: 'ewarm - Recharger', subtitle: 'جلسة تقييم شاملة', badge: 'انتهت' }
        }
      },
      {
        time: '11:00',
        slots: {
          'c1': { status: 'empty' },
          'c2': { status: 'ongoing', title: 'م. سارة', subtitle: 'تنسيق الخطة العلاجية', badge: 'جاري', icon: 'pi pi-clock' },
          'c3': { status: 'urgent', title: 'بلا مدرب', subtitle: 'تغيب مفاجئ - مطلوب بديل', badge: 'إحلال عاجل', icon: 'pi pi-exclamation-triangle' }
        }
      },
      {
        time: '2:00',
        slots: {
          'c1': { status: 'returnToPlay', title: 'م. مصطفى', subtitle: 'Solo Training', badge: 'Return to Play' },
          'c2': { status: 'resilience', title: 'م. علي', subtitle: 'Solo Session', badge: 'Resilience' },
          'c3': { status: 'measurements', title: 'ك. محمود', subtitle: 'Knee Basic -', badge: 'مقاسات' }
        }
      },
      {
        time: '3:00',
        slots: {
          'c1': { status: 'empty' },
          'c2': { status: 'empty' },
          'c3': { status: 'upcoming', title: 'م. خالد', subtitle: 'echarger Session', badge: 'قادمة' }
        }
      }
    ]);
  }

  getCardClasses(status: string): string {
    switch (status) {
      case 'ended':
        return 'border-gray-200 bg-white opacity-70 border hover:opacity-100 shadow-sm';
      case 'ongoing':
        return 'border-[#00ac9f] bg-white shadow-[0px_4px_15px_rgba(0,172,159,0.15)] border-t-[3px] border-r-[3px] border-l border-b border-[rgba(0,172,159,0.3)]';
      case 'urgent':
        return 'border-[#ee3d53] bg-white shadow-[0px_4px_15px_rgba(238,61,83,0.15)] border-t-[3px] border-r-[3px] border-l border-b border-[rgba(238,61,83,0.3)]';
      case 'returnToPlay':
        return 'border-[#6165F7] bg-white shadow-[0px_4px_15px_rgba(97,101,247,0.15)] border-t-[3px] border-r-[3px] border-l border-b border-[#6165F7]';
      case 'resilience':
        return 'border-[#A855F7] bg-white shadow-[0px_4px_15px_rgba(168,85,247,0.15)] border-t-[3px] border-r-[3px] border-l border-b border-[#A855F7]';
      case 'measurements':
        return 'border-[#EAB308] bg-white shadow-[0px_4px_15px_rgba(234,179,8,0.15)] border-t-[3px] border-r-[3px] border-l border-b border-[#EAB308]';
      case 'upcoming':
        return 'border-gray-200 bg-white border border-t-[3px] border-t-gray-400 shadow-sm';
      default:
        return 'border-transparent opacity-0';
    }
  }

  getBadgeClasses(status: string): string {
    switch (status) {
      case 'ended': return 'bg-gray-100 text-gray-500';
      case 'ongoing': return 'bg-teal-50 text-[#00ac9f] border border-[#00ac9f]';
      case 'urgent': return 'bg-red-50 text-[#ee3d53] border border-[#ee3d53]';
      case 'returnToPlay': return 'bg-indigo-50 text-[#6165F7] border border-[#6165F7]';
      case 'resilience': return 'bg-purple-50 text-[#A855F7] border border-[#A855F7]';
      case 'measurements': return 'bg-yellow-50 text-[#EAB308] border border-[#EAB308]';
      case 'upcoming': return 'bg-gray-100 text-gray-600 border border-gray-200';
      default: return 'hidden';
    }
  }

  getIconClasses(status: string): string {
    switch (status) {
      case 'ongoing': return 'text-[#00ac9f]';
      case 'urgent': return 'text-[#ee3d53]';
      default: return 'hidden';
    }
  }
}
