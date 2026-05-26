export interface Muscle {
    id: string;
    name: string;
    nameAr: string;
    color: string;
    description: string;
    function: string;
    position: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
}

export const MUSCLES: Muscle[] = [
    {
        id: 'trapezius',
        name: 'Trapezius',
        nameAr: 'العضلة شبه المنحرفة',
        color: '#e74c3c',
        description: 'عضلة كبيرة في الظهر والرقبة',
        function: 'تحريك الكتف والرقبة',
        position: { x: 0, y: 1.2, z: -0.3 },
        scale: { x: 1.2, y: 0.4, z: 0.3 },
    },
    {
        id: 'biceps',
        name: 'Biceps Brachii',
        nameAr: 'العضلة ذات الرأسين',
        color: '#e67e22',
        description: 'عضلة في مقدمة الذراع',
        function: 'ثني الكوع ودوران الساعد',
        position: { x: 0.9, y: 0.5, z: 0.1 },
        scale: { x: 0.2, y: 0.5, z: 0.2 },
    },
    {
        id: 'biceps_left',
        name: 'Biceps Brachii (Left)',
        nameAr: 'العضلة ذات الرأسين (يسار)',
        color: '#e67e22',
        description: 'عضلة في مقدمة الذراع',
        function: 'ثني الكوع ودوران الساعد',
        position: { x: -0.9, y: 0.5, z: 0.1 },
        scale: { x: 0.2, y: 0.5, z: 0.2 },
    },
    {
        id: 'pectoralis',
        name: 'Pectoralis Major',
        nameAr: 'العضلة الصدرية الكبرى',
        color: '#c0392b',
        description: 'العضلة الرئيسية في الصدر',
        function: 'تحريك الذراع للأمام وللداخل',
        position: { x: 0, y: 0.9, z: 0.35 },
        scale: { x: 0.8, y: 0.4, z: 0.2 },
    },
    {
        id: 'rectus_abdominis',
        name: 'Rectus Abdominis',
        nameAr: 'العضلة المستقيمة للبطن',
        color: '#8e44ad',
        description: 'عضلة البطن الأمامية (السكس باك)',
        function: 'ثني الجذع وضغط البطن',
        position: { x: 0, y: 0.3, z: 0.38 },
        scale: { x: 0.4, y: 0.6, z: 0.15 },
    },
    {
        id: 'quadriceps',
        name: 'Quadriceps',
        nameAr: 'العضلة رباعية الرؤوس',
        color: '#27ae60',
        description: 'مجموعة عضلات أمام الفخذ',
        function: 'مد الركبة ورفع الساق',
        position: { x: 0.25, y: -0.6, z: 0.2 },
        scale: { x: 0.28, y: 0.7, z: 0.25 },
    },
    {
        id: 'quadriceps_left',
        name: 'Quadriceps (Left)',
        nameAr: 'العضلة رباعية الرؤوس (يسار)',
        color: '#27ae60',
        description: 'مجموعة عضلات أمام الفخذ',
        function: 'مد الركبة ورفع الساق',
        position: { x: -0.25, y: -0.6, z: 0.2 },
        scale: { x: 0.28, y: 0.7, z: 0.25 },
    },
    {
        id: 'gastrocnemius',
        name: 'Gastrocnemius',
        nameAr: 'العضلة الساقية',
        color: '#2980b9',
        description: 'العضلة الرئيسية في الساق',
        function: 'ثني القدم للأسفل والمشي',
        position: { x: 0.25, y: -1.5, z: -0.15 },
        scale: { x: 0.2, y: 0.45, z: 0.2 },
    },
    {
        id: 'gastrocnemius_left',
        name: 'Gastrocnemius (Left)',
        nameAr: 'العضلة الساقية (يسار)',
        color: '#2980b9',
        description: 'العضلة الرئيسية في الساق',
        function: 'ثني القدم للأسفل والمشي',
        position: { x: -0.25, y: -1.5, z: -0.15 },
        scale: { x: 0.2, y: 0.45, z: 0.2 },
    },
    {
        id: 'deltoid',
        name: 'Deltoid',
        nameAr: 'العضلة الدالية',
        color: '#f39c12',
        description: 'عضلة الكتف الخارجية',
        function: 'رفع الذراع للجانب',
        position: { x: 0.75, y: 0.95, z: 0.05 },
        scale: { x: 0.22, y: 0.3, z: 0.22 },
    },
    {
        id: 'deltoid_left',
        name: 'Deltoid (Left)',
        nameAr: 'العضلة الدالية (يسار)',
        color: '#f39c12',
        description: 'عضلة الكتف الخارجية',
        function: 'رفع الذراع للجانب',
        position: { x: -0.75, y: 0.95, z: 0.05 },
        scale: { x: 0.22, y: 0.3, z: 0.22 },
    },
];