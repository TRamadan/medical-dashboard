import { Component, Input, TemplateRef } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { CommonModule } from '@angular/common';

export interface TabItem {
  label: string;
  content?: string;
  template?: TemplateRef<any>;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule, TabsModule],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss'
})
export class TabsComponent {
  @Input() tabs: TabItem[] = [];
  @Input() activeIndex: number = 0;
}
