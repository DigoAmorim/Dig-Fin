export interface RegisterInput {
    email: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthUser {
    id: string;
    email: string;
    accountId: string;
    accountName: string;
    role: string;
}