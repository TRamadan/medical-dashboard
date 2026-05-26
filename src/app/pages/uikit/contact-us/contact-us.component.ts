import { Component, computed, signal, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface BodyPart {
    name: string;
    x_min?: number;
    x_max?: number;
    y_min?: number;
    y_max?: number;
    polygon?: { x: number; y: number }[];
}

interface WebsiteComponent {
    id: string;
    type: string;
    data: any;
    styles?: any;
    position?: { x: number; y: number };
}

interface ComponentProperty {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'color' | 'number';
    defaultValue?: any;
}

@Component({
    selector: 'app-contact-us',
    templateUrl: './contact-us.component.html',
    styleUrls: ['./contact-us.component.css'],
    imports: [CommonModule],
    standalone: true
})
export class ContactUsComponent implements OnInit {
    public tooltipX = 0;
    public tooltipY = 0;
    public mouseX = 0;
    public mouseY = 0;
    public hoveredPart: string = 'None';
    public selectedParts: string[] = [];
    bodyParts: BodyPart[] = [];
    public polygonSelectionActive = false;
    public currentPolygon: { x: number; y: number }[] = [];
    public imageWidth = 0;
    public imageHeight = 0;
    private readonly http = inject(HttpClient);

    // Feature Toggle Properties
    activeFeature: 'polygon' | 'website' = 'polygon';

    // Website Generator Properties
    @ViewChild('canvasContent', { static: false }) canvasContent!: ElementRef;

    isDragging = false;
    dragOffset = { x: 0, y: 0 };


    ngOnInit(): void {
        this.http.get<BodyPart[]>('../../../assets/muscle-polygns.json').subscribe((parts) => {
            this.bodyParts = parts;
        });
    }

    startPolygonSelection(): void {
        this.polygonSelectionActive = true;
        this.currentPolygon = [];
        alert('Polygon selection started. Click each vertex of the region. Click "Finish Polygon" when done.');
    }

    finishPolygon(): void {
        if (this.currentPolygon.length < 3) {
            alert('A polygon needs at least 3 points.');
            return;
        }
        const name = prompt('Enter a name for this muscle region:', 'New Muscle') || 'Unnamed Muscle';
        this.bodyParts.push({ name, polygon: [...this.currentPolygon] });
        this.polygonSelectionActive = false;
        this.currentPolygon = [];
    }

    onMouseMove(event: MouseEvent): void {
        const container = event.currentTarget as HTMLElement;
        const rect = container.getBoundingClientRect();
        
        const rawX = event.clientX - rect.left;
        const rawY = event.clientY - rect.top;
        
        if (rect.width && rect.height && this.imageWidth && this.imageHeight) {
            const scaleX = this.imageWidth / rect.width;
            const scaleY = this.imageHeight / rect.height;
            this.mouseX = rawX * scaleX;
            this.mouseY = rawY * scaleY;
        } else {
            this.mouseX = rawX;
            this.mouseY = rawY;
        }
        
        this.tooltipX = rawX;
        this.tooltipY = rawY;
        
        this.checkHoveredPolygon();
    }

    private checkHoveredPolygon(): void {
        // Check if mouse is inside any polygon
        const found = this.bodyParts.find((part) => part.polygon && this.isPointInPolygon({ x: this.mouseX, y: this.mouseY }, part.polygon!));
        this.hoveredPart = found ? found.name : 'None';
    }

    // Ray-casting algorithm for point-in-polygon
    private isPointInPolygon(point: { x: number; y: number }, polygon: { x: number; y: number }[]): boolean {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x,
                yi = polygon[i].y;
            const xj = polygon[j].x,
                yj = polygon[j].y;
            const intersect = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi + 0.00001) + xi;
            if (intersect) inside = !inside;
        }
        return inside;
    }

    onImageClick(event: MouseEvent): void {
        if (this.polygonSelectionActive) {
            const img = event.target as HTMLImageElement;
            const rect = img.getBoundingClientRect();
            const x = Math.round(event.clientX - rect.left);
            const y = Math.round(event.clientY - rect.top);
            this.currentPolygon.push({ x, y });
            alert(`Point added: x: ${x}, y: ${y}`);
        } else {
            if (this.hoveredPart && this.hoveredPart !== 'None') {
                const idx = this.selectedParts.indexOf(this.hoveredPart);
                if (idx > -1) {
                    this.selectedParts.splice(idx, 1);
                } else {
                    this.selectedParts.push(this.hoveredPart);
                }
            }
        }
    }

    onImageLoad(event: Event): void {
        const img = event.target as HTMLImageElement;
        this.imageWidth = img.naturalWidth;
        this.imageHeight = img.naturalHeight;
    }

    get polygonPointsString(): string {
        return this.currentPolygon.map((pt) => `${pt.x},${pt.y}`).join(' ');
    }

    getPolygonPointsString(polygon: { x: number; y: number }[]): string {
        return polygon.map((pt) => `${pt.x},${pt.y}`).join(' ');
    }

    downloadPolygons(): void {
        const polygons = this.bodyParts.filter((part) => part.polygon && part.polygon.length > 2);
        const dataStr = JSON.stringify(polygons, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'muscle-polygons.json';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Feature Toggle Methods
    setActiveFeature(feature: 'polygon' | 'website'): void {
        this.activeFeature = feature;
    }

    // Website Generator Methods
    onDragStart(event: DragEvent, componentType: string): void {
        if (event.dataTransfer) {
            event.dataTransfer.setData('text/plain', componentType);
            event.dataTransfer.effectAllowed = 'copy';
        }
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.dataTransfer!.dropEffect = 'copy';
    }






}
