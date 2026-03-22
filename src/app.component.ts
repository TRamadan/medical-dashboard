import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, ConfirmDialogModule],
    template: `
        <router-outlet></router-outlet>
        <p-confirmDialog key="sessionExpired" [style]="{width: '400px'}" [closable]="false" [closeOnEscape]="false">
        </p-confirmDialog>
    `
})
export class AppComponent {}
