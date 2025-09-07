import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
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

    @Output() tabChange = new EventEmitter<number>();

    // call this from the tab click or programmatic change
    selectTab(index: number) {
        if (this.activeIndex === index) {
            return;
        }
        this.activeIndex = index;
        this.tabChange.emit(index);
    }
}
