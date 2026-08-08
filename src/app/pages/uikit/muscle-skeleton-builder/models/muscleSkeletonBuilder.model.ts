export interface BodyPart {
    name: string;
    x_min?: number;
    x_max?: number;
    y_min?: number;
    y_max?: number;
    polygon?: { x: number; y: number }[];
}

