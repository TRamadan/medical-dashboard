export interface LoginRequest {
    value: string;
    password?: string;
}

export interface LoginResponse {
    token: string;
    refreshToken: string; // Added refresh token
    expiration: string;
    roles: string[];
    user: User;
    message: string;
    isAuthenticated: boolean;
    username: string;
    email: string;
}

export interface User {
    sideRouts: any[];
}
