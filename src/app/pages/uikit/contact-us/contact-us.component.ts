import { Component, computed, signal, OnInit, inject, ViewChild, ElementRef, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    imports: [CommonModule, FormsModule]
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

    // Polygon drawing mode: 'click' places one vertex per click (original behavior),
    // 'freehand' traces a continuous outline while the mouse button is held down.
    public drawMode: 'click' | 'freehand' = 'click';
    public isFreehandDrawing = false;
    /** Minimum pixel distance between two captured freehand points (keeps the raw stroke from being thousands of points). */
    private readonly freehandMinDistance = 4;
    /** Ramer–Douglas–Peucker tolerance (px) used to thin a finished freehand stroke down to clean vertices. */
    private readonly freehandSimplifyTolerance = 2.5;

    // Redraw (update existing muscle polygon) properties
    public isRedrawMode = false;
    public redrawTargetName: string = '';

    // Point-drag edit (move individual polygon vertices) properties
    @ViewChild('anatomyImage', { static: false }) anatomyImage!: ElementRef<HTMLImageElement>;
    public isPointEditMode = false;
    public draggingPoint: { partName: string; index: number } | null = null;
    private pointEditBackup: { x: number; y: number }[] | null = null;

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
        this.http.get<BodyPart[]>('assets/muscle-polygons.json').subscribe({
            next: (parts) => {
                this.bodyParts = parts;
            },
            error: (err) => {
                console.error('Error loading muscle polygons asset:', err);
            }
        });
    }

    startPolygonSelection(): void {
        this.polygonSelectionActive = true;
        this.currentPolygon = [];
        if (this.drawMode === 'freehand') {
            alert('Freehand selection started. Press and hold the mouse button, trace the outline of the muscle, then release. Click "Finish Polygon" when done.');
        } else {
            alert('Polygon selection started. Click each vertex of the region. Click "Finish Polygon" when done.');
        }
    }

    /** Switches between click-per-vertex and click-and-drag freehand drawing. Locked once a drawing is in progress. */
    setDrawMode(mode: 'click' | 'freehand'): void {
        if (this.polygonSelectionActive) {
            return;
        }
        this.drawMode = mode;
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

    // --- Redraw (update) an existing muscle's polygon ---

    /** Called when the user picks a muscle to redraw from the dropdown. */
    selectRedrawTarget(name: string): void {
        this.redrawTargetName = name;
    }

    /** Starts redraw mode for the currently selected target muscle. */
    startRedrawPolygon(): void {
        if (!this.redrawTargetName) {
            alert('Select a muscle to redraw first.');
            return;
        }
        this.isRedrawMode = true;
        this.polygonSelectionActive = true;
        this.currentPolygon = [];
        const instructions = this.drawMode === 'freehand'
            ? `Redrawing "${this.redrawTargetName}". Press and hold, trace the new outline, then release. Click "Finish Redraw" when done.`
            : `Redrawing "${this.redrawTargetName}". Click each new vertex on the image, then click "Finish Redraw".`;
        alert(instructions);
    }

    /** Saves the newly drawn points over the target muscle's existing polygon. */
    finishRedraw(): void {
        if (this.currentPolygon.length < 3) {
            alert('A polygon needs at least 3 points.');
            return;
        }
        const part = this.bodyParts.find((p) => p.name === this.redrawTargetName);
        if (part) {
            part.polygon = [...this.currentPolygon];
        } else {
            alert(`Could not find muscle "${this.redrawTargetName}" to update.`);
        }
        this.isRedrawMode = false;
        this.polygonSelectionActive = false;
        this.currentPolygon = [];
        this.redrawTargetName = '';

        if (part) {
            this.downloadPolygons();
        }
    }

    /** Cancels redraw mode without modifying the existing polygon. */
    cancelRedraw(): void {
        this.isRedrawMode = false;
        this.polygonSelectionActive = false;
        this.currentPolygon = [];
    }

    /** Deletes the currently selected muscle entirely. */
    deleteSelectedMuscle(): void {
        if (!this.redrawTargetName) {
            alert('Select a muscle to delete first.');
            return;
        }
        const confirmed = confirm(`Delete muscle "${this.redrawTargetName}"? This cannot be undone.`);
        if (!confirmed) {
            return;
        }
        const index = this.bodyParts.findIndex((p) => p.name === this.redrawTargetName);
        if (index > -1) {
            this.bodyParts.splice(index, 1);
        }
        if (this.hoveredPart === this.redrawTargetName) {
            this.hoveredPart = 'None';
        }
        // If we were mid-redraw on the deleted muscle, cancel that too.
        if (this.isRedrawMode) {
            this.cancelRedraw();
        }
        this.redrawTargetName = '';

        if (index > -1) {
            this.downloadPolygons();
        }
    }

    // --- Drag-to-move individual polygon points for the selected muscle ---

    /** Enters point-edit mode for the currently selected muscle. */
    startPointEditMode(): void {
        if (!this.redrawTargetName) {
            alert('Select a muscle to edit first.');
            return;
        }
        const part = this.bodyParts.find((p) => p.name === this.redrawTargetName);
        if (!part || !part.polygon || part.polygon.length < 3) {
            alert('That muscle has no polygon to edit.');
            return;
        }
        this.isPointEditMode = true;
        this.pointEditBackup = part.polygon.map((pt) => ({ ...pt }));
    }

    /** Called on mousedown over a vertex handle; begins tracking a drag if editing is active. */
    onPointMouseDown(event: MouseEvent, part: BodyPart, index: number): void {
        if (!this.isPointEditMode || part.name !== this.redrawTargetName) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        this.draggingPoint = { partName: part.name, index };
    }

    @HostListener('document:mousemove', ['$event'])
    onDocumentMouseMove(event: MouseEvent): void {
        if (this.isFreehandDrawing && this.anatomyImage) {
            const rect = this.anatomyImage.nativeElement.getBoundingClientRect();
            const x = Math.round(event.clientX - rect.left);
            const y = Math.round(event.clientY - rect.top);
            // Clamp to the image bounds so a fast drag off the edge doesn't record points outside the artwork.
            const clampedX = Math.max(0, Math.min(x, this.imageWidth));
            const clampedY = Math.max(0, Math.min(y, this.imageHeight));
            this.addFreehandPoint(clampedX, clampedY);
            return;
        }

        if (!this.draggingPoint || !this.anatomyImage) {
            return;
        }
        const rect = this.anatomyImage.nativeElement.getBoundingClientRect();
        const x = Math.round(event.clientX - rect.left);
        const y = Math.round(event.clientY - rect.top);
        const part = this.bodyParts.find((p) => p.name === this.draggingPoint!.partName);
        if (part && part.polygon && part.polygon[this.draggingPoint.index]) {
            part.polygon[this.draggingPoint.index] = { x, y };
        }
    }

    @HostListener('document:mouseup')
    onDocumentMouseUp(): void {
        this.draggingPoint = null;
        if (this.isFreehandDrawing) {
            this.isFreehandDrawing = false;
            // Thin the raw stroke (often hundreds of points) down to a clean polygon before the user reviews/finishes it.
            if (this.currentPolygon.length > 3) {
                this.currentPolygon = this.simplifyPolygon(this.currentPolygon, this.freehandSimplifyTolerance);
            }
        }
    }

    /** Starts a freehand stroke on mousedown over the image, if freehand mode + a selection/redraw is active. */
    onImageMouseDown(event: MouseEvent): void {
        if (!this.polygonSelectionActive || this.drawMode !== 'freehand') {
            return;
        }
        event.preventDefault();
        const img = event.target as HTMLImageElement;
        const rect = img.getBoundingClientRect();
        const x = Math.round(event.clientX - rect.left);
        const y = Math.round(event.clientY - rect.top);
        this.isFreehandDrawing = true;
        this.currentPolygon = [{ x, y }];
    }

    /** Appends a point to the in-progress freehand stroke, skipping points too close to the last one captured. */
    private addFreehandPoint(x: number, y: number): void {
        const last = this.currentPolygon[this.currentPolygon.length - 1];
        if (last) {
            const dx = x - last.x;
            const dy = y - last.y;
            if (dx * dx + dy * dy < this.freehandMinDistance * this.freehandMinDistance) {
                return;
            }
        }
        this.currentPolygon.push({ x, y });
    }

    /**
     * Ramer–Douglas–Peucker simplification. A freehand stroke can easily produce hundreds of points;
     * this keeps only the vertices needed to preserve the traced shape within `tolerance` px.
     */
    private simplifyPolygon(points: { x: number; y: number }[], tolerance: number): { x: number; y: number }[] {
        if (points.length < 3) {
            return points;
        }
        const sqTolerance = tolerance * tolerance;

        const sqSegDist = (p: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }): number => {
            let x = p1.x;
            let y = p1.y;
            let dx = p2.x - x;
            let dy = p2.y - y;
            if (dx !== 0 || dy !== 0) {
                const t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
                if (t > 1) {
                    x = p2.x;
                    y = p2.y;
                } else if (t > 0) {
                    x += dx * t;
                    y += dy * t;
                }
            }
            dx = p.x - x;
            dy = p.y - y;
            return dx * dx + dy * dy;
        };

        const simplifySection = (pts: { x: number; y: number }[], first: number, last: number, out: { x: number; y: number }[]): void => {
            let maxDist = sqTolerance;
            let index = -1;
            for (let i = first + 1; i < last; i++) {
                const dist = sqSegDist(pts[i], pts[first], pts[last]);
                if (dist > maxDist) {
                    index = i;
                    maxDist = dist;
                }
            }
            if (index > -1) {
                if (index - first > 1) simplifySection(pts, first, index, out);
                out.push(pts[index]);
                if (last - index > 1) simplifySection(pts, index, last, out);
            }
        };

        const result: { x: number; y: number }[] = [points[0]];
        simplifySection(points, 0, points.length - 1, result);
        result.push(points[points.length - 1]);
        return result;
    }

    /** Confirms the dragged point positions and downloads the updated JSON. */
    finishPointEdit(): void {
        this.isPointEditMode = false;
        this.draggingPoint = null;
        this.pointEditBackup = null;
        this.downloadPolygons();
    }

    /** Reverts any dragged points back to their positions before edit mode started. */
    cancelPointEdit(): void {
        const part = this.bodyParts.find((p) => p.name === this.redrawTargetName);
        if (part && this.pointEditBackup) {
            part.polygon = this.pointEditBackup.map((pt) => ({ ...pt }));
        }
        this.isPointEditMode = false;
        this.draggingPoint = null;
        this.pointEditBackup = null;
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
        if (this.polygonSelectionActive) {
            if (this.drawMode === 'click') {
                const img = event.target as HTMLImageElement;
                const rect = img.getBoundingClientRect();
                const x = Math.round(event.clientX - rect.left);
                const y = Math.round(event.clientY - rect.top);
                this.currentPolygon.push({ x, y });
                alert(`Point added: x: ${x}, y: ${y}`);
            }
            // In freehand mode, points are captured by onImageMouseDown / onDocumentMouseMove instead.
            return;
        }
        if (this.hoveredPart !== 'None') {
            // Not currently drawing: clicking a highlighted muscle selects it for redraw.
            this.redrawTargetName = this.hoveredPart;
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