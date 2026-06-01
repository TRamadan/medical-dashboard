export interface FormField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'checkbox' | 'dropdown';
    required: boolean;
    placeholder?: string;
    options?: { label: string; value: any }[]; // For dropdowns
    value?: any; // To store the user's input in preview mode
}

export interface FormSection {
    id: string;
    title: string;
    fields: FormField[];
}

export interface DynamicForm {
    id: string;
    name: string;
    sections: FormSection[];
}