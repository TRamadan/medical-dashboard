import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-day-overall',
  imports: [CardModule],
  templateUrl: './day-overall.component.html',
  styleUrl: './day-overall.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DayOverallComponent {

  stats = signal([
    { label: 'Executed Sessions', count: '3', subtitle: 'Out of 4 scheduled', accentKey: 'completed', icon: 'pi-check-circle' },
    { label: 'Customer Rating', count: '4.6', subtitle: '/ 5 Today', accentKey: 'rating', icon: 'pi-star' },
    { label: 'Swarm', count: '2', subtitle: 'From the team', accentKey: 'swarm', icon: 'pi-users' },
    { label: 'Solo', count: '1', subtitle: 'Independent', accentKey: 'solo', icon: 'pi-user' },
    { label: 'Average sRPE', count: '5.2', subtitle: 'Today\'s sessions', accentKey: 'remaining', icon: 'pi-chart-bar' },
    { label: 'Tomorrow\'s Bookings', count: '0', subtitle: 'Booked on the system', accentKey: 'neutral', icon: 'pi-calendar' }
  ]);

  sessions = signal([
    {
      engineer: 'Eng. Ahmed',
      station: 'Recharger Station',
      type: 'Swarm',
      time: '10:00 AM',
      duration: '30 mins',
      sessionNum: 'Session 5/24',
      status: 'completed',
      dotColor: '#10b981',
      topBorderColor: '#10b981',
      rating: 5,
      ratingLabel: '5',
      stars: [1, 1, 1, 1, 1],
      badge: null
    },
    {
      engineer: 'Eng. Khaled',
      station: 'Recharger Station',
      type: 'Swarm',
      time: '10:30 AM',
      duration: '30 mins',
      sessionNum: 'Session 12/24',
      status: 'completed',
      dotColor: '#10b981',
      topBorderColor: '#10b981',
      rating: 4,
      ratingLabel: '4',
      stars: [1, 1, 1, 1, 0],
      badge: null
    },
    {
      engineer: 'Eng. Salem',
      station: 'Recharger Station',
      type: 'Swarm',
      time: '11:00 AM',
      duration: 'Running Now',
      sessionNum: null,
      status: 'running',
      dotColor: '#f59e0b',
      topBorderColor: '#f59e0b',
      rating: null,
      ratingLabel: null,
      stars: [],
      badge: { label: 'Running', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.4)', bg: 'rgba(245, 158, 11, 0.05)' }
    },
    {
      engineer: 'Eng. Mustafa',
      station: 'Solo',
      type: 'Solo',
      time: '02:00 PM',
      duration: '60 mins booked',
      sessionNum: null,
      status: 'upcoming',
      dotColor: '#64748b',
      topBorderColor: 'transparent',
      rating: null,
      ratingLabel: null,
      stars: [],
      badge: { label: 'Upcoming', color: '#64748b', border: 'rgba(100, 116, 139, 0.4)', bg: 'rgba(100, 116, 139, 0.05)' }
    }
  ]);

}
