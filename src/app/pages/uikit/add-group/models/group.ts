export interface Role {
    id: string;
    name: string;
}

export interface Group {
    id: string;
    name: string;
    roles: Role[];
} 