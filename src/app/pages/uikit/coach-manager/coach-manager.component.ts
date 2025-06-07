import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarModule } from 'primeng/toolbar';
import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'app-coach-manager',
    standalone: true,
    imports: [TagModule, ToastModule, FormsModule, DialogModule, ButtonModule, LucideAngularModule, CardModule, CommonModule, ToolbarModule, TabsModule],

    templateUrl: './coach-manager.component.html',
    styleUrls: ['./coach-manager.component.css']
})
export class CoachManagerComponent implements OnInit {
    constructor() {}

    ngOnInit() {}
}
