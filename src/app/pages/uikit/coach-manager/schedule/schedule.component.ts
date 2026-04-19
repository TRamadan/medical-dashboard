import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  }
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss'
})
export class ScheduleComponent {
  coaches: Coach[] = [
    { id: 'c1', name: 'م. عمرو', clinic: 'APEX CLINIC' },
    { id: 'c2', name: 'م. سارة', clinic: 'ESILIENCE HUB' },
    { id: 'c3', name: 'م. كريم', clinic: 'ECHAC EE UNII' }
  ];

  timeSlots: TimeSlot[] = [
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
  ];

  getCardClasses(status: string): string {
    switch(status) {
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
    switch(status) {
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
    switch(status) {
      case 'ongoing': return 'text-[#00ac9f]';
      case 'urgent': return 'text-[#ee3d53]';
      default: return 'hidden';
    }
  }
}
