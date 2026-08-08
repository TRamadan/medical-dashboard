import { Component, computed, signal, OnInit, inject, ViewChild, ElementRef, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { BodyPart } from "./models/muscleSkeletonBuilder.model";

interface DrawModeOption {
  label: string;
  value: 'click' | 'freehand';
  icon: string;
}

interface MuscleOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-muscle-skeleton-builder',
  imports: [
    FormsModule,
    CommonModule,
    ButtonModule,
    CardModule,
    SelectButtonModule,
    SelectModule,
    TagModule,
    MessageModule,
    TooltipModule
  ],
  templateUrl: './muscle-skeleton-builder.component.html',
  styleUrl: './muscle-skeleton-builder.component.scss'
})
export class MuscleSkeletonBuilderComponent {
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
  public readonly drawModeOptions: DrawModeOption[] = [
    { label: 'Click Points', value: 'click', icon: 'pi pi-map-marker' },
    { label: 'Free Draw', value: 'freehand', icon: 'pi pi-pencil' }
  ];
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

  /** p-selectButton change handler; guards against the deselect-to-null click PrimeNG allows by default. */
  onDrawModeChange(mode: 'click' | 'freehand' | null): void {
    if (!mode) {
      return;
    }
    this.setDrawMode(mode);
  }

  /** Options for the "Update muscle" p-select, derived from the currently loaded body parts. */
  get muscleOptions(): MuscleOption[] {
    return this.bodyParts.map((part) => ({ label: part.name, value: part.name }));
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
}