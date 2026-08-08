import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  computed,
  input,
  output,
  ElementRef,
  ViewChild,
  effect
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { BodyPart } from '../../muscle-skeleton-builder/models/muscleSkeletonBuilder.model';

@Component({
  selector: 'app-muscle-skeleton-viewer',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    TagModule,
    MessageModule,
    TooltipModule,
    BadgeModule
  ],
  templateUrl: './muscle-skeleton-viewer.component.html',
  styleUrl: './muscle-skeleton-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:resize)': 'onWindowResize()'
  }
})
export class MuscleSkeletonViewerComponent implements OnInit {
  @ViewChild('anatomyImage') anatomyImage!: ElementRef<HTMLImageElement>;

  // Inputs & Outputs
  readOnly = input<boolean>(false);
  initialSelectedMuscles = input<string[] | undefined>(undefined, { alias: 'selectedMuscles' });
  selectionChange = output<string[]>();
  muscleClick = output<string>();

  // Signals
  bodyParts = signal<BodyPart[]>([]);
  selectedMuscles = signal<string[]>([]);
  hoveredPart = signal<string>('None');
  mouseX = signal<number>(0);
  mouseY = signal<number>(0);
  naturalWidth = signal<number>(0);
  naturalHeight = signal<number>(0);

  // Computed
  selectedCount = computed(() => this.selectedMuscles().length);
  hasSelection = computed(() => this.selectedCount() > 0);

  private readonly http = inject(HttpClient);

  constructor() {
    effect(() => {
      const initial = this.initialSelectedMuscles();
      if (initial !== undefined) {
        this.selectedMuscles.set([...initial]);
      }
    });
  }

  ngOnInit(): void {
    this.http.get<BodyPart[]>('assets/muscle-polygons.json').subscribe({
      next: (parts: BodyPart[]) => {
        this.bodyParts.set(parts);
      },
      error: (err: unknown) => {
        console.error('Error loading muscle polygons asset:', err);
      }
    });
  }

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    this.naturalWidth.set(img.naturalWidth);
    this.naturalHeight.set(img.naturalHeight);
  }

  onWindowResize(): void {
    // Re-trigger layout calculations if needed
  }

  toggleMuscleSelection(name: string): void {
    if (this.readOnly()) {
      return;
    }
    const current = this.selectedMuscles();
    const index = current.indexOf(name);
    let updated: string[];

    if (index > -1) {
      updated = current.filter((m: string) => m !== name);
    } else {
      updated = [...current, name];
    }

    this.selectedMuscles.set(updated);
    this.selectionChange.emit(updated);
    this.muscleClick.emit(name);
  }

  isMuscleSelected(name: string): boolean {
    return this.selectedMuscles().includes(name);
  }

  clearSelectedMuscles(): void {
    if (this.readOnly()) {
      return;
    }
    this.selectedMuscles.set([]);
    this.selectionChange.emit([]);
  }

  onPolygonMouseEnter(name: string): void {
    this.hoveredPart.set(name);
  }

  onPolygonMouseLeave(name: string): void {
    if (this.hoveredPart() === name) {
      this.hoveredPart.set('None');
    }
  }

  onPolygonClick(name: string, event: MouseEvent): void {
    event.stopPropagation();
    this.toggleMuscleSelection(name);
  }

  onImageClick(event: MouseEvent): void {
    if (this.readOnly()) {
      return;
    }
    const hovered = this.hoveredPart();
    if (hovered !== 'None') {
      this.toggleMuscleSelection(hovered);
    }
  }

  onMouseMove(event: MouseEvent): void {
    const container = event.currentTarget as HTMLElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const displayX = event.clientX - rect.left;
    const displayY = event.clientY - rect.top;

    const nWidth = this.naturalWidth();
    const nHeight = this.naturalHeight();

    if (nWidth > 0 && nHeight > 0 && rect.width > 0 && rect.height > 0) {
      const scaleX = nWidth / rect.width;
      const scaleY = nHeight / rect.height;
      this.mouseX.set(Math.round(displayX * scaleX));
      this.mouseY.set(Math.round(displayY * scaleY));
    } else {
      this.mouseX.set(Math.round(displayX));
      this.mouseY.set(Math.round(displayY));
    }

    this.checkHoveredPolygon();
  }

  onMouseLeave(): void {
    this.hoveredPart.set('None');
  }

  private checkHoveredPolygon(): void {
    const parts = this.bodyParts();
    const point = { x: this.mouseX(), y: this.mouseY() };
    const found = parts.find(
      (part: BodyPart) => part.polygon && this.isPointInPolygon(point, part.polygon)
    );
    this.hoveredPart.set(found ? found.name : 'None');
  }

  private isPointInPolygon(
    point: { x: number; y: number },
    polygon: { x: number; y: number }[]
  ): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x,
        yi = polygon[i].y;
      const xj = polygon[j].x,
        yj = polygon[j].y;
      const intersect =
        yi > point.y !== yj > point.y &&
        point.x < ((xj - xi) * (point.y - yi)) / (yj - yi + 0.00001) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  /**
   * Unselected polygons are invisible (transparent) by default so they do not clutter the image.
   * Only hovered or selected polygons are highlighted.
   */
  getPolygonFill(name: string): string {
    const isSelected = this.isMuscleSelected(name);
    const isHovered = this.hoveredPart() === name;

    if (isSelected && isHovered) {
      return 'rgba(22, 163, 74, 0.75)'; // Dark green on hover over selected
    }
    if (isSelected) {
      return 'rgba(34, 197, 94, 0.55)'; // Marked green for selected muscle
    }
    if (isHovered) {
      return 'rgba(239, 68, 68, 0.45)'; // Vibrant red hover highlight
    }
    return 'rgba(0, 0, 0, 0.001)'; // Completely transparent for unselected
  }

  getPolygonStroke(name: string): string {
    const isSelected = this.isMuscleSelected(name);
    const isHovered = this.hoveredPart() === name;

    if (isSelected) {
      return '#15803d'; // Green stroke for selected
    }
    if (isHovered) {
      return '#ef4444'; // Red stroke on hover
    }
    return 'transparent'; // Completely invisible stroke for unselected
  }

  getPolygonPointsString(polygon: { x: number; y: number }[]): string {
    return polygon.map((pt) => `${pt.x},${pt.y}`).join(' ');
  }
}
