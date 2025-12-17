import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tab } from 'primeng/tabs';

@Component({
    selector: 'app-tabs-navigation',
    imports: [],
    standalone: true,
    templateUrl: './tabs-navigation.component.html',
    styleUrl: './tabs-navigation.component.scss'
})
export class TabsNavigationComponent {
    @Input() tabs: any[] = [];

    @Input() activeTab: string = 'overview';
    @Output() tabChange = new EventEmitter<any>();

    selectTab(tabId: any): void {
        this.activeTab = tabId;
        this.tabChange.emit(tabId);
    }
}
