import { PatientForm } from '../services/patient-form.service';

export interface MockPatientPreset {
    id: string;
    label: string;
    description: string;
    data: PatientForm;
}

// ─────────────────────────────────────────────────────────────
// Scenario 1: New Patient — Simple Case
// Booking for self, no prior history, minimal medical background
// ─────────────────────────────────────────────────────────────
const scenario_new_simple: PatientForm = {
    personalData: {
        fullName: 'أحمد محمد السيد',
        dateOfBirth: '1995-03-20',
        address: 'القاهرة، مدينة نصر',
        phoneNumber: '01012345678',
        emergencyPhone: '01198765432',
        emergencyRelation: 'أخ',
        bookingForSelf: true,
        fillerRelation: '',
        fillerName: '',
        fillerMobile: ''
    },
    sportsData: {
        sport: 'كرة القدم',
        playCenter: 'وسط الملعب',
        yearsOfPractice: 8,
        clubName: 'نادي الأهلي',
        highestAchievement: 'بطولة الهواة 2023'
    },
    injuryData: {
        bodyMapData: '',
        painLevel: 4,
        functionalLevel: 6,
        dailyActivityLevel: 5,
        injuryDescription: 'ألم في الركبة اليمنى عند الجري وتغيير الاتجاه السريع',
        injuryName: 'التواء الركبة اليمنى',
        injurySide: 0,
        injuryDate: '2026-06-15',
        inactivityDurationValue: 3,
        inactivityDurationUnit: 1,
        isSportRelated: true,
        seenSpecialist: false,
        specialistsConsulted: [],
        prescribedTreatments: 8,
        otherPrescribedTreatment: '',
        hadDiagnosticTests: false,
        diagnosticTests: 0,
        otherDiagnosticTest: ''
    },
    injuryHistory: {
        previousInjuries: [],
        previousSurgeries: []
    },
    medicalHistory: {
        currentConditions: 0,
        otherConditions: '',
        medications: [],
        knownAllergies: 'لا يوجد',
        hadCovid: false,
        covidTimesCount: 0,
        covidVaccinated: true,
        vaccineType: 'فايزر',
        vaccineDoses: 2,
        fatherConditions: 0,
        fatherOtherConditions: '',
        motherConditions: 0,
        motherOtherConditions: ''
    },
    socialProfile: {
        occupation: 'مهندس',
        workNature: 0,
        dailySittingHours: 8,
        maritalStatus: 0,
        habits: 0,
        isWorkStressful: false,
        hasChildren: false
    },
    ui: {
        prescribedTreatmentsSelected: ['rest'],
        diagnosticTestsSelected: [],
        chronicConditionsSelected: [],
        fatherConditionsSelected: [],
        motherConditionsSelected: [],
        habitsSelected: [],
        inactivityDurationUnitLabel: 'weeks',
        injurySideLabel: 'right',
        workNatureLabel: 'مكتبي'
    },
    selectedMuscles: ['muscle 5', 'muscle 6']
};

// ─────────────────────────────────────────────────────────────
// Scenario 2: New Patient — Complex Case
// Booking by proxy (parent), extensive medical history, multiple specialists
// ─────────────────────────────────────────────────────────────
const scenario_new_complex: PatientForm = {
    personalData: {
        fullName: 'كريم عبد الرحمن النجار',
        dateOfBirth: '2004-07-10',
        address: 'الجيزة، الدقي',
        phoneNumber: '01011122233',
        emergencyPhone: '01555544466',
        emergencyRelation: 'والد',
        bookingForSelf: false,
        fillerRelation: 'ابن',
        fillerName: 'عبد الرحمن النجار',
        fillerMobile: '01555544466'
    },
    sportsData: {
        sport: 'كرة السلة',
        playCenter: 'سنتر',
        yearsOfPractice: 10,
        clubName: 'الزمالك',
        highestAchievement: 'بطولة أفريقيا للشباب 2024'
    },
    injuryData: {
        bodyMapData: '',
        painLevel: 7,
        functionalLevel: 4,
        dailyActivityLevel: 3,
        injuryDescription: 'تمزق في رباط الصليبي الأمامي للركبة اليمنى أثناء مباراة. ألم حاد وانتفاخ شديد.',
        injuryName: 'تمزق الرباط الصليبي الأمامي',
        injurySide: 0,
        injuryDate: '2026-05-01',
        inactivityDurationValue: 2,
        inactivityDurationUnit: 2,
        isSportRelated: true,
        seenSpecialist: true,
        specialistsConsulted: [
            { id: 0, doctorName: 'د. سامر عبد الله', specialty: 'جراحة العظام', diagnosis: 'تمزق جزئي في الرباط الصليبي', communicationMethod: 'زيارة عيادة' },
            { id: 1, doctorName: 'د. نورا حسن', specialty: 'الطب الرياضي', diagnosis: 'إجهاد عضلي', communicationMethod: 'استشارة عن بعد' }
        ],
        prescribedTreatments: 22,
        otherPrescribedTreatment: '',
        hadDiagnosticTests: true,
        diagnosticTests: 3,   // xray(1) + mri(2)
        otherDiagnosticTest: ''
    },
    injuryHistory: {
        previousInjuries: [
            { id: 0, description: 'التواء بسيط — تعافى بالكامل', bodyPart: 'الكاحل الأيسر', injuryDate: '2023-03-15', treatmentReceived: 'علاج طبيعي' }
        ],
        previousSurgeries: []
    },
    medicalHistory: {
        currentConditions: 0,
        otherConditions: '',
        medications: [
            { id: 0, name: 'إيبوبروفين', dose: '400mg', frequency: 'مرتين يومياً' }
        ],
        knownAllergies: 'بنسلين',
        hadCovid: true,
        covidTimesCount: 1,
        covidVaccinated: true,
        vaccineType: 'أسترازينيكا',
        vaccineDoses: 2,
        fatherConditions: 2,
        fatherOtherConditions: '',
        motherConditions: 0,
        motherOtherConditions: ''
    },
    socialProfile: {
        occupation: 'طالب',
        workNature: 1,
        dailySittingHours: 4,
        maritalStatus: 0,
        habits: 0,
        isWorkStressful: false,
        hasChildren: false
    },
    ui: {
        prescribedTreatmentsSelected: ['physio', 'rehab', 'medication'],
        diagnosticTestsSelected: ['mri', 'xray'],
        chronicConditionsSelected: [],
        fatherConditionsSelected: ['أمراض القلب'],
        motherConditionsSelected: [],
        habitsSelected: [],
        inactivityDurationUnitLabel: 'months',
        injurySideLabel: 'right',
        workNatureLabel: 'ميداني'
    },
    selectedMuscles: ['muscle 3', 'muscle 4', 'muscle 12']
};

// ─────────────────────────────────────────────────────────────
// Scenario 3: Returning Patient — Shoulder (New Complaint)
// Had prior knee treatment, coming back with shoulder pain
// ─────────────────────────────────────────────────────────────
const scenario_return_shoulder: PatientForm = {
    personalData: {
        fullName: 'عمر طارق إبراهيم',
        dateOfBirth: '1992-11-05',
        address: 'الجيزة، الدقي',
        phoneNumber: '01234567890',
        emergencyPhone: '01512345678',
        emergencyRelation: 'زوجة',
        bookingForSelf: true,
        fillerRelation: '',
        fillerName: '',
        fillerMobile: ''
    },
    sportsData: {
        sport: 'التنس',
        playCenter: 'لاعب مفرد',
        yearsOfPractice: 15,
        clubName: 'نادي الجزيرة',
        highestAchievement: 'بطل هواة وطني 2022'
    },
    injuryData: {
        bodyMapData: '',
        painLevel: 3,
        functionalLevel: 6,
        dailyActivityLevel: 6,
        injuryDescription: 'ألم في الكتف الأيمن عند الضربة الساحقة، خاصةً أثناء حركات فوق الرأس',
        injuryName: 'التهاب أوتار الكفة المدورة',
        injurySide: 0,
        injuryDate: '2026-06-10',
        inactivityDurationValue: 2,
        inactivityDurationUnit: 1,
        isSportRelated: true,
        seenSpecialist: true,
        specialistsConsulted: [
            { id: 0, doctorName: 'د. منى الشافعي', specialty: 'طب رياضي', diagnosis: 'التهاب وتر الكاحل', communicationMethod: 'زيارة عيادة' }
        ],
        prescribedTreatments: 18,
        otherPrescribedTreatment: 'تدليك',
        hadDiagnosticTests: true,
        diagnosticTests: 32,  // ultrasound(32)
        otherDiagnosticTest: ''
    },
    injuryHistory: {
        previousInjuries: [],
        previousSurgeries: [
            { id: 0, description: 'تعافى بنجاح — 24 أسبوع', surgeryType: 'إعادة بناء الرباط الصليبي', surgeryDate: '2025-02-01' }
        ]
    },
    medicalHistory: {
        currentConditions: 0,
        otherConditions: '',
        medications: [],
        knownAllergies: 'لا يوجد',
        hadCovid: true,
        covidTimesCount: 2,
        covidVaccinated: true,
        vaccineType: 'فايزر',
        vaccineDoses: 3,
        fatherConditions: 1,
        fatherOtherConditions: '',
        motherConditions: 4,
        motherOtherConditions: ''
    },
    socialProfile: {
        occupation: 'مهندس',
        workNature: 1,
        dailySittingHours: 4,
        maritalStatus: 1,
        habits: 0,
        isWorkStressful: true,
        hasChildren: true
    },
    ui: {
        prescribedTreatmentsSelected: ['physio', 'other'],
        diagnosticTestsSelected: ['ultrasound'],
        chronicConditionsSelected: [],
        fatherConditionsSelected: ['ارتفاع ضغط الدم'],
        motherConditionsSelected: ['اضطرابات السكر'],
        habitsSelected: [],
        inactivityDurationUnitLabel: 'weeks',
        injurySideLabel: 'right',
        workNatureLabel: 'ميداني'
    },
    selectedMuscles: ['muscle 1', 'muscle 2', 'muscle 3']
};

// ─────────────────────────────────────────────────────────────
// Scenario 4: Patient with Chronic Medical Conditions
// Diabetes + hypertension, on multiple medications, family history
// ─────────────────────────────────────────────────────────────
const scenario_chronic_conditions: PatientForm = {
    personalData: {
        fullName: 'محمود سامي فاروق',
        dateOfBirth: '1975-08-22',
        address: 'الإسكندرية، سموحة',
        phoneNumber: '01099988877',
        emergencyPhone: '01066655544',
        emergencyRelation: 'ابن',
        bookingForSelf: true,
        fillerRelation: '',
        fillerName: '',
        fillerMobile: ''
    },
    sportsData: {
        sport: 'السباحة',
        playCenter: 'سباحة حرة',
        yearsOfPractice: 20,
        clubName: 'نادي سبورتنج',
        highestAchievement: 'بطولة إقليمية ماسترز 2021'
    },
    injuryData: {
        bodyMapData: '',
        painLevel: 5,
        functionalLevel: 5,
        dailyActivityLevel: 4,
        injuryDescription: 'ألم مزمن في أسفل الظهر يشتد عند السباحة لمسافات طويلة. يستمر لأيام بعد التمرين.',
        injuryName: 'آلام أسفل الظهر المزمنة',
        injurySide: 2,
        injuryDate: '2025-01-01',
        inactivityDurationValue: 6,
        inactivityDurationUnit: 2,
        isSportRelated: false,
        seenSpecialist: true,
        specialistsConsulted: [
            { id: 0, doctorName: 'د. حسام عمر', specialty: 'جراحة العمود الفقري', diagnosis: 'انزلاق غضروفي بسيط', communicationMethod: 'زيارة عيادة' },
            { id: 1, doctorName: 'د. رانيا خالد', specialty: 'روماتولوجيا', diagnosis: 'التهاب مفاصل روماتويدي محتمل', communicationMethod: 'استشارة هاتفية' }
        ],
        prescribedTreatments: 3,
        otherPrescribedTreatment: '',
        hadDiagnosticTests: true,
        diagnosticTests: 67, // xray(1) + mri(2) + bone_scan(64)
        otherDiagnosticTest: ''
    },
    injuryHistory: {
        previousInjuries: [
            { id: 0, description: 'التهاب وتر أكيليس — تعافى', bodyPart: 'الكاحل', injuryDate: '2019-05-10', treatmentReceived: 'علاج طبيعي + راحة' },
            { id: 1, description: 'كسر بسيط', bodyPart: 'المعصم الأيمن', injuryDate: '2015-12-01', treatmentReceived: 'جبيرة' }
        ],
        previousSurgeries: [
            { id: 0, description: 'إزالة القرص المنفتق L4-L5', surgeryType: 'ديسكتومي', surgeryDate: '2022-09-15' }
        ]
    },
    medicalHistory: {
        currentConditions: 5,
        otherConditions: 'قصور في الغدة الدرقية',
        medications: [
            { id: 0, name: 'ميتفورمين', dose: '500mg', frequency: 'مرتين يومياً' },
            { id: 1, name: 'أملوديبين', dose: '5mg', frequency: 'مرة يومياً' },
            { id: 2, name: 'ليفوثيروكسين', dose: '50mcg', frequency: 'مرة صباحاً على معدة فارغة' }
        ],
        knownAllergies: 'أسبرين — يسبب طفح جلدي',
        hadCovid: true,
        covidTimesCount: 2,
        covidVaccinated: true,
        vaccineType: 'سينوفارم',
        vaccineDoses: 3,
        fatherConditions: 3,
        fatherOtherConditions: '',
        motherConditions: 5,
        motherOtherConditions: 'سرطان الثدي في سن 60'
    },
    socialProfile: {
        occupation: 'محاسب',
        workNature: 0,
        dailySittingHours: 10,
        maritalStatus: 1,
        habits: 1,
        isWorkStressful: true,
        hasChildren: true
    },
    ui: {
        prescribedTreatmentsSelected: ['medication', 'physio'],
        diagnosticTestsSelected: ['mri', 'xray', 'bone_scan'],
        chronicConditionsSelected: ['ارتفاع ضغط الدم', 'اضطرابات السكر'],
        fatherConditionsSelected: ['ارتفاع ضغط الدم', 'أمراض القلب'],
        motherConditionsSelected: ['ارتفاع ضغط الدم', 'اضطرابات السكر'],
        habitsSelected: ['smoking'],
        inactivityDurationUnitLabel: 'months',
        injurySideLabel: 'both',
        workNatureLabel: 'مكتبي'
    },
    selectedMuscles: ['muscle 7', 'muscle 8', 'muscle 9', 'muscle 10']
};

// ─────────────────────────────────────────────────────────────
// Scenario 5: Female Athlete — Bilateral Injury
// Booking for self, left side injury, multiple habits, married with children
// ─────────────────────────────────────────────────────────────
const scenario_female_athlete: PatientForm = {
    personalData: {
        fullName: 'سارة أحمد منصور',
        dateOfBirth: '1999-04-15',
        address: 'القاهرة، المعادي',
        phoneNumber: '01055566677',
        emergencyPhone: '01155566688',
        emergencyRelation: 'زوج',
        bookingForSelf: true,
        fillerRelation: '',
        fillerName: '',
        fillerMobile: ''
    },
    sportsData: {
        sport: 'كرة الطائرة',
        playCenter: 'ضارب',
        yearsOfPractice: 12,
        clubName: 'نادي الجزيرة',
        highestAchievement: 'بطولة مصر للسيدات 2023'
    },
    injuryData: {
        bodyMapData: '',
        painLevel: 6,
        functionalLevel: 5,
        dailyActivityLevel: 4,
        injuryDescription: 'ألم في كلا الكتفين، مع ألم حاد في الكتف الأيسر عند الضرب. بدأ تدريجياً وزاد مع الحمل التدريبي.',
        injuryName: 'التهاب كيس الكتف (Bursitis)',
        injurySide: 1,
        injuryDate: '2026-04-20',
        inactivityDurationValue: 4,
        inactivityDurationUnit: 1,
        isSportRelated: true,
        seenSpecialist: true,
        specialistsConsulted: [
            { id: 0, doctorName: 'د. مها عبد العزيز', specialty: 'طب رياضي للسيدات', diagnosis: 'شد عضلي في الفخذ', communicationMethod: 'زيارة عيادة' }
        ],
        prescribedTreatments: 6,
        otherPrescribedTreatment: '',
        hadDiagnosticTests: true,
        diagnosticTests: 34, // ultrasound(32) + mri(2)
        otherDiagnosticTest: ''
    },
    injuryHistory: {
        previousInjuries: [
            { id: 0, description: 'شفيت بالكامل', bodyPart: 'الأصبع (إبهام اليد اليمنى)', injuryDate: '2021-08-05', treatmentReceived: 'جبيرة + راحة' }
        ],
        previousSurgeries: []
    },
    medicalHistory: {
        currentConditions: 0,
        otherConditions: '',
        medications: [],
        knownAllergies: 'لا يوجد',
        hadCovid: true,
        covidTimesCount: 1,
        covidVaccinated: true,
        vaccineType: 'فايزر',
        vaccineDoses: 2,
        fatherConditions: 64,
        fatherOtherConditions: '',
        motherConditions: 1,
        motherOtherConditions: ''
    },
    socialProfile: {
        occupation: 'مدرسة رياضة',
        workNature: 1,
        dailySittingHours: 2,
        maritalStatus: 1,
        habits: 0,
        isWorkStressful: false,
        hasChildren: true
    },
    ui: {
        prescribedTreatmentsSelected: ['physio', 'rest'],
        diagnosticTestsSelected: ['ultrasound', 'mri'],
        chronicConditionsSelected: [],
        fatherConditionsSelected: ['اضطرابات الغدة الدرقية'],
        motherConditionsSelected: ['ارتفاع ضغط الدم'],
        habitsSelected: [],
        inactivityDurationUnitLabel: 'weeks',
        injurySideLabel: 'left',
        workNatureLabel: 'ميداني'
    },
    selectedMuscles: ['muscle 1', 'muscle 2']
};

// ─────────────────────────────────────────────────────────────
// Scenario 6: Post-Surgery Reassessment
// Returned after ACL surgery, now has new shoulder pain during program
// ─────────────────────────────────────────────────────────────
const scenario_post_surgery_reassess: PatientForm = {
    personalData: {
        fullName: 'خالد مصطفى العزاوي',
        dateOfBirth: '1998-02-28',
        address: 'الجيزة، أكتوبر',
        phoneNumber: '01022233344',
        emergencyPhone: '01144455566',
        emergencyRelation: 'والد',
        bookingForSelf: true,
        fillerRelation: '',
        fillerName: '',
        fillerMobile: ''
    },
    sportsData: {
        sport: 'كرة القدم',
        playCenter: 'مدافع',
        yearsOfPractice: 14,
        clubName: 'النادي الأهلي',
        highestAchievement: 'الدوري الممتاز 2025'
    },
    injuryData: {
        bodyMapData: '',
        painLevel: 5,
        functionalLevel: 6,
        dailyActivityLevel: 6,
        injuryDescription: 'ألم في الكتف الأيمن ظهر أثناء تمرينات المرحلة الثالثة من برنامج تأهيل الرباط الصليبي. ألم عند رفع الذراع أعلى الرأس.',
        injuryName: 'شد عضلي في الكفة المدورة',
        injurySide: 0,
        injuryDate: '2026-07-10',
        inactivityDurationValue: 1,
        inactivityDurationUnit: 1,
        isSportRelated: true,
        seenSpecialist: true,
        specialistsConsulted: [
            { id: 0, doctorName: 'د. سامي إبراهيم', specialty: 'طب رياضي', diagnosis: 'التواء بسيط في الكاحل', communicationMethod: 'استشارة عن بعد' }
        ],
        prescribedTreatments: 4,
        otherPrescribedTreatment: '',
        hadDiagnosticTests: false,
        diagnosticTests: 0,
        otherDiagnosticTest: ''
    },
    injuryHistory: {
        previousInjuries: [
            { id: 0, description: 'تعافى بالكامل — 8 أسابيع', bodyPart: 'الكاحل الأيسر', injuryDate: '2022-10-01', treatmentReceived: 'علاج طبيعي' }
        ],
        previousSurgeries: [
            { id: 0, description: 'برنامج تأهيل نشط — المرحلة 3', surgeryType: 'إعادة بناء الرباط الصليبي الأمامي', surgeryDate: '2026-01-15' }
        ]
    },
    medicalHistory: {
        currentConditions: 0,
        otherConditions: '',
        medications: [],
        knownAllergies: 'لا يوجد',
        hadCovid: false,
        covidTimesCount: 0,
        covidVaccinated: true,
        vaccineType: 'مودرنا',
        vaccineDoses: 2,
        fatherConditions: 0,
        fatherOtherConditions: '',
        motherConditions: 0,
        motherOtherConditions: ''
    },
    socialProfile: {
        occupation: 'لاعب محترف',
        workNature: 1,
        dailySittingHours: 2,
        maritalStatus: 0,
        habits: 0,
        isWorkStressful: true,
        hasChildren: false
    },
    ui: {
        prescribedTreatmentsSelected: ['rehab'],
        diagnosticTestsSelected: [],
        chronicConditionsSelected: [],
        fatherConditionsSelected: [],
        motherConditionsSelected: [],
        habitsSelected: [],
        inactivityDurationUnitLabel: 'weeks',
        injurySideLabel: 'right',
        workNatureLabel: 'ميداني'
    },
    selectedMuscles: ['muscle 1', 'muscle 3', 'muscle 4']
};

// ─────────────────────────────────────────────────────────────
// Scenario 7: Minor / Youth Athlete (Booked by Parent)
// Form filled by parent on behalf of child
// ─────────────────────────────────────────────────────────────
const scenario_youth_proxy: PatientForm = {
    personalData: {
        fullName: 'يوسف حسام الدين عوض',
        dateOfBirth: '2012-09-12',
        address: 'القاهرة، المقطم',
        phoneNumber: '01078901234',
        emergencyPhone: '01198901234',
        emergencyRelation: 'والد',
        bookingForSelf: false,
        fillerRelation: 'ابن',
        fillerName: 'حسام الدين عوض',
        fillerMobile: '01198901234'
    },
    sportsData: {
        sport: 'السباحة',
        playCenter: 'سباحة صدر',
        yearsOfPractice: 5,
        clubName: 'نادي هيليوبوليس',
        highestAchievement: 'بطولة ناشئين مصر 2025 — المركز الثاني'
    },
    injuryData: {
        bodyMapData: '',
        painLevel: 3,
        functionalLevel: 7,
        dailyActivityLevel: 7,
        injuryDescription: 'التهاب في مفصل الكتف الأيمن، يشتد عند السباحة لفترة طويلة. لا يؤثر على الحياة اليومية.',
        injuryName: 'التهاب كيسة الكتف',
        injurySide: 0,
        injuryDate: '2026-07-01',
        inactivityDurationValue: 10,
        inactivityDurationUnit: 0,
        isSportRelated: true,
        seenSpecialist: false,
        specialistsConsulted: [],
        prescribedTreatments: 8,
        otherPrescribedTreatment: '',
        hadDiagnosticTests: false,
        diagnosticTests: 0,
        otherDiagnosticTest: ''
    },
    injuryHistory: {
        previousInjuries: [],
        previousSurgeries: []
    },
    medicalHistory: {
        currentConditions: 0,
        otherConditions: '',
        medications: [],
        knownAllergies: 'لا يوجد',
        hadCovid: false,
        covidTimesCount: 0,
        covidVaccinated: true,
        vaccineType: 'فايزر',
        vaccineDoses: 1,
        fatherConditions: 0,
        fatherOtherConditions: '',
        motherConditions: 0,
        motherOtherConditions: ''
    },
    socialProfile: {
        occupation: 'طالب',
        workNature: 1,
        dailySittingHours: 6,
        maritalStatus: 0,
        habits: 0,
        isWorkStressful: false,
        hasChildren: false
    },
    ui: {
        prescribedTreatmentsSelected: ['rest'],
        diagnosticTestsSelected: [],
        chronicConditionsSelected: [],
        fatherConditionsSelected: [],
        motherConditionsSelected: [],
        habitsSelected: [],
        inactivityDurationUnitLabel: 'days',
        injurySideLabel: 'right',
        workNatureLabel: 'ميداني'
    },
    selectedMuscles: ['muscle 1']
};

// ─────────────────────────────────────────────────────────────
// Exported list of all presets
// ─────────────────────────────────────────────────────────────
export const PATIENT_FORM_MOCKS: MockPatientPreset[] = [
    {
        id: 'new_simple',
        label: '١. مريض جديد — بسيط',
        description: 'لاعب كرة قدم، التواء ركبة، بدون تاريخ طبي',
        data: scenario_new_simple
    },
    {
        id: 'new_complex',
        label: '٢. مريض جديد — معقد (بالوكالة)',
        description: 'والد يسجل لابنه، تمزق صليبي، دواء + أطباء متعددون',
        data: scenario_new_complex
    },
    {
        id: 'return_shoulder',
        label: '٣. مريض عائد — شكوى جديدة',
        description: 'لاعب تنس سبق تأهله من الركبة، ألم كتف جديد',
        data: scenario_return_shoulder
    },
    {
        id: 'chronic_conditions',
        label: '٤. مريض مزمن — تاريخ طبي كامل',
        description: 'ضغط + سكر + أدوية + عمليات + تاريخ عائلي',
        data: scenario_chronic_conditions
    },
    {
        id: 'female_athlete',
        label: '٥. رياضية — إصابة ثنائية الجانب',
        description: 'لاعبة كرة طائرة، إصابة الكتفين، متزوجة ولديها أطفال',
        data: scenario_female_athlete
    },
    {
        id: 'post_surgery_reassess',
        label: '٦. إعادة تقييم — ما بعد جراحة',
        description: 'لاعب كرة قدم محترف، في منتصف برنامج تأهيل الصليبي',
        data: scenario_post_surgery_reassess
    },
    {
        id: 'youth_proxy',
        label: '٧. ناشئ — الحجز بالوكالة عن قاصر',
        description: 'والد يسجل لطفله الـ14، سباحة، إصابة خفيفة',
        data: scenario_youth_proxy
    }
];