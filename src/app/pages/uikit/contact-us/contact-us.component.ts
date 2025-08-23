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
    public mouseX = 0;
    public mouseY = 0;
    public hoveredPart: string = 'None';
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

    websiteComponents: WebsiteComponent[] = [];
    selectedComponent: WebsiteComponent | null = null;
    draggedComponent: WebsiteComponent | null = null;
    isDragging = false;
    dragOffset = { x: 0, y: 0 };

    // Component templates
    private componentTemplates: { [key: string]: any } = {
        header: {
            title: 'Your Website Title',
            subtitle: 'Your tagline here'
        },
        text: {
            content: 'Add your text content here...'
        },
        image: {
            src: 'assets/placeholder-image.jpg',
            alt: 'Image'
        },
        button: {
            text: 'Click Me',
            link: '#'
        },
        form: {
            title: 'Contact Us',
            fields: ['name', 'email', 'message']
        },
        gallery: {
            items: [1, 2, 3, 4]
        },
        navbar: {
            links: ['Home', 'About', 'Services', 'Contact']
        },
        footer: {
            text: '© 2024 Your Company. All rights reserved.'
        }
    };

    ngOnInit(): void {
        this.http.get<BodyPart[]>('assets/muscle-polygons.json').subscribe((parts) => {
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
        this.mouseX = event.offsetX;
        this.mouseY = event.offsetY;
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
        const img = event.target as HTMLImageElement;
        const rect = img.getBoundingClientRect();
        const x = Math.round(event.clientX - rect.left);
        const y = Math.round(event.clientY - rect.top);
        if (this.polygonSelectionActive) {
            this.currentPolygon.push({ x, y });
            alert(`Point added: x: ${x}, y: ${y}`);
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

    onDrop(event: DragEvent): void {
        event.preventDefault();
        const componentType = event.dataTransfer!.getData('text/plain');
        this.addComponent(componentType);
    }

    addComponent(type: string): void {
        const newComponent: WebsiteComponent = {
            id: this.generateId(),
            type: type,
            data: { ...this.componentTemplates[type] },
            styles: {}
        };
        this.websiteComponents.push(newComponent);
        this.selectComponent(newComponent);
    }

    selectComponent(component: WebsiteComponent, event?: Event): void {
        if (event) {
            event.stopPropagation();
        }
        this.selectedComponent = component;
    }

    deselectAll(): void {
        this.selectedComponent = null;
    }

    editComponent(component: WebsiteComponent, event: Event): void {
        event.stopPropagation();
        this.selectComponent(component);
    }

    duplicateComponent(component: WebsiteComponent, event: Event): void {
        event.stopPropagation();
        const duplicated: WebsiteComponent = {
            ...component,
            id: this.generateId()
        };
        this.websiteComponents.push(duplicated);
        this.selectComponent(duplicated);
    }

    deleteComponent(component: WebsiteComponent, event: Event): void {
        event.stopPropagation();
        const index = this.websiteComponents.findIndex((c) => c.id === component.id);
        if (index > -1) {
            this.websiteComponents.splice(index, 1);
            if (this.selectedComponent?.id === component.id) {
                this.selectedComponent = null;
            }
        }
    }

    startDrag(event: MouseEvent, component: WebsiteComponent): void {
        this.isDragging = true;
        this.draggedComponent = component;
        this.dragOffset = {
            x: event.clientX - (component.position?.x || 0),
            y: event.clientY - (component.position?.y || 0)
        };
    }

    getComponentProperties(component: WebsiteComponent): ComponentProperty[] {
        const propertyMap: { [key: string]: ComponentProperty[] } = {
            header: [
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'subtitle', label: 'Subtitle', type: 'text' }
            ],
            text: [{ key: 'content', label: 'Content', type: 'textarea' }],
            image: [
                { key: 'src', label: 'Image URL', type: 'text' },
                { key: 'alt', label: 'Alt Text', type: 'text' }
            ],
            button: [
                { key: 'text', label: 'Button Text', type: 'text' },
                { key: 'link', label: 'Link URL', type: 'text' }
            ],
            form: [{ key: 'title', label: 'Form Title', type: 'text' }],
            navbar: [{ key: 'links', label: 'Navigation Links', type: 'text' }],
            footer: [{ key: 'text', label: 'Footer Text', type: 'text' }]
        };

        return propertyMap[component.type] || [];
    }

    updateComponentProperty(key: string, event: Event): void {
        if (this.selectedComponent) {
            const target = event.target as HTMLInputElement | HTMLTextAreaElement;
            this.selectedComponent.data[key] = target.value;
        }
    }

    updateComponentStyle(property: string, event: Event): void {
        if (this.selectedComponent) {
            const target = event.target as HTMLInputElement;
            if (!this.selectedComponent.styles) {
                this.selectedComponent.styles = {};
            }
            this.selectedComponent.styles[property] = target.value;
        }
    }

    previewWebsite(): void {
        const previewWindow = window.open('', '_blank');
        if (previewWindow) {
            const html = this.generateWebsiteHTML();
            previewWindow.document.write(html);
            previewWindow.document.close();
        }
    }

    exportWebsite(): void {
        const html = this.generateWebsiteHTML();
        const css = this.generateWebsiteCSS();
        const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Website</title>
    <style>${css}</style>
</head>
<body>
${html}
</body>
</html>`;

        const blob = new Blob([fullHTML], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated-website.html';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    clearCanvas(): void {
        this.websiteComponents = [];
        this.selectedComponent = null;
    }

    private generateId(): string {
        return 'comp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    private generateWebsiteHTML(): string {
        let html = '';
        this.websiteComponents.forEach((component) => {
            html += this.generateComponentHTML(component);
        });
        return html;
    }

    private generateComponentHTML(component: WebsiteComponent): string {
        const styles = this.generateComponentStyles(component);

        switch (component.type) {
            case 'header':
                return `
        <header style="${styles}">
          <h1>${component.data.title || 'Your Website Title'}</h1>
          <p>${component.data.subtitle || 'Your tagline here'}</p>
        </header>`;

            case 'text':
                return `<div style="${styles}"><p>${component.data.content || 'Add your text content here...'}</p></div>`;

            case 'image':
                return `<div style="${styles}"><img src="${component.data.src || 'assets/placeholder-image.jpg'}" alt="${component.data.alt || 'Image'}" /></div>`;

            case 'button':
                return `<div style="${styles}"><button onclick="window.location.href='${component.data.link || '#'}'">${component.data.text || 'Click Me'}</button></div>`;

            case 'form':
                return `
        <div style="${styles}">
          <form class="contact-form">
            <input type="text" placeholder="Name" required />
            <input type="email" placeholder="Email" required />
            <textarea placeholder="Message" required></textarea>
            <button type="submit">Send Message</button>
          </form>
        </div>`;

            case 'gallery':
                return `
        <div style="${styles}">
          <div class="gallery-grid">
            ${Array(4)
                .fill(0)
                .map(() => '<div class="gallery-item"><img src="assets/placeholder-image.jpg" alt="Gallery Image" /></div>')
                .join('')}
          </div>
        </div>`;

            case 'navbar':
                return `
        <nav style="${styles}">
          <a href="#" class="nav-link">Home</a>
          <a href="#" class="nav-link">About</a>
          <a href="#" class="nav-link">Services</a>
          <a href="#" class="nav-link">Contact</a>
        </nav>`;

            case 'footer':
                return `<footer style="${styles}"><p>${component.data.text || '© 2024 Your Company. All rights reserved.'}</p></footer>`;

            default:
                return `<div style="${styles}"><p>${component.type} Component</p></div>`;
        }
    }

    private generateComponentStyles(component: WebsiteComponent): string {
        if (!component.styles) return '';

        return Object.entries(component.styles)
            .map(([key, value]) => `${this.camelToKebab(key)}: ${value}`)
            .join('; ');
    }

    private generateWebsiteCSS(): string {
        return `
      body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
      .contact-form { display: flex; flex-direction: column; gap: 10px; }
      .contact-form input, .contact-form textarea { padding: 10px; border: 1px solid #ccc; }
      .contact-form button { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; }
      .gallery-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
      .gallery-item img { width: 100%; height: auto; }
      .nav-link { margin-right: 20px; text-decoration: none; color: #333; }
      .nav-link:hover { color: #007bff; }
    `;
    }

    private camelToKebab(str: string): string {
        return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    }
}
