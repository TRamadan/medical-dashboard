export interface BranchEmployeeAssignment {
    branchId: string | number;
    userId: string;
}

export interface Employee {
    id: string;
    fullNameEn?: string;
    fullNameAr?: string;
    email?: string;
    phoneNumber?: string;
    employeeTypeId?: number;
    employeeTypeName?: string;
}

export interface Branch {
    id: string | number;
    nameAr?: string;
    nameEn?: string;
    addressAr?: string;
    addressEn?: string;
}

export interface EmployeeType {
    id: number;
    nameAr?: string;
    nameEn?: string;
}
