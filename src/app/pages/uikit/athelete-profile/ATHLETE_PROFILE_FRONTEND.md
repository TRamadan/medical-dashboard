# Athlete Profile — Frontend Implementation Guide

**Base URL:** `https://portalapi.thesportsdoctorlab.com`  
**Swagger:** `https://portalapi.thesportsdoctorlab.com/swagger` (tag: `AthleteProfile`)  
**All endpoints require:** `Authorization: Bearer <token>`

The athlete profile is a doctor/staff page for one patient: a header, 4 KPI cards, 6 tabs and a sidebar.
Each tab has its own endpoint, so load the summary first and load each tab the first time it is opened.

---

## Table of Contents

1. [Page Layout → Endpoint Map](#1-page-layout--endpoint-map)
2. [Response Envelope & Errors](#2-response-envelope--errors)
3. [Summary — Header, KPIs, Sidebar](#3-summary--header-kpis-sidebar)
4. [Tab 1 — Overview](#4-tab-1--overview)
5. [Tab 2 — Injury & History](#5-tab-2--injury--history)
6. [Tab 3 — Program & Plan](#6-tab-3--program--plan)
7. [Tab 4 — Measurements & Data](#7-tab-4--measurements--data)
8. [Tab 5 — Session Log](#8-tab-5--session-log)
9. [Tab 6 — Surveys](#9-tab-6--surveys)
10. [Write Endpoints](#10-write-endpoints)
11. [Shared Types & Enums](#11-shared-types--enums)
12. [Business Rules the UI Should Know](#12-business-rules-the-ui-should-know)
13. [Related Changes (Notifications, Mobile RPE)](#13-related-changes-notifications-mobile-rpe)
14. [Not Covered by the API Yet](#14-not-covered-by-the-api-yet)

---

## 1. Page Layout → Endpoint Map

| UI area | Endpoint | When to call |
|---|---|---|
| Header, 4 KPI cards, sidebar (file status, interaction note, contact) | `GET /api/AthleteProfile/{patientId}` | On page load |
| Tab: نظرة عامة (Overview) | `GET /api/AthleteProfile/{patientId}/overview` | On page load (default tab) |
| Tab: الإصابة والتاريخ (Injury & History) | `GET /api/AthleteProfile/{patientId}/injury-history` | When the tab is first opened |
| Tab: البرنامج والخطة (Program & Plan) | `GET /api/AthleteProfile/{patientId}/plan` | When the tab is first opened |
| Tab: القياسات والبيانات (Measurements & Data) | `GET /api/AthleteProfile/{patientId}/measurements` | When the tab is first opened |
| Tab: سجل الجلسات (Session Log) | `GET /api/AthleteProfile/{patientId}/sessions?take=5` | When the tab is first opened; drop `take` for "عرض كل الجلسات" (show all) |
| Tab: الاستبيانات (Surveys) | `GET /api/AthleteProfile/{patientId}/surveys` | When the tab is first opened |
| Edit interaction note (sidebar) | `PUT /api/AthleteProfile/{patientId}/interaction-note` | On save |
| Record measurements | `POST /api/AthleteProfile/{patientId}/measurements` | From a measurement-entry form |
| Submit NPS / post-blueprint survey | `POST /api/AthleteProfile/{patientId}/surveys` | Usually from the mobile app |

`patientId` is the patient's **user id** (the same id as `patientId` in tickets, appointments and treatment plans).

---

## 2. Response Envelope & Errors

Every response uses the standard `Result<T>` envelope:

```json
{
  "data": { },
  "error": null,
  "isSuccess": true
}
```

| Status | Meaning | Body |
|---|---|---|
| `200` | OK | `data` filled |
| `400` | Validation failed (write endpoints) | `error.errors[]` |
| `401` | Missing/expired token | empty |
| `404` | Patient not found, or `/plan` called for a patient with no plan | `error.errors[]` |

```json
{
  "data": null,
  "error": {
    "isValid": false,
    "errors": [
      { "errorEn": "Athlete not found.", "errorAr": "الرياضي غير موجود.", "hintEn": null, "hintAr": null }
    ]
  },
  "isSuccess": false
}
```

Show `errorAr` or `errorEn` based on the UI language.

**Dates:** all timestamps are **server local time** (no `Z` suffix), e.g. `"2026-08-23T01:00:05.29"`. Don't convert them as UTC.  
**DateOnly fields** (`injuryDate`, `surgeryDate`, wellness `date`) come as `"2026-02-14"`.

---

## 3. Summary — Header, KPIs, Sidebar

`GET /api/AthleteProfile/{patientId}`

```json
{
  "patientId": 239,
  "nameEn": "B. Salem",
  "nameAr": "ب. سالم",
  "imageUrl": null,
  "age": 32,
  "genderId": 1,
  "sport": "Football",
  "branchNameEn": "First Settlement",
  "branchNameAr": "التجمع الأول",
  "memberSince": "2021-03-21T10:00:00",
  "activePlan": {
    "patientTreatmentPlanId": 4,
    "treatmentPlanId": 1034,
    "planName": "Return to Play — ACL Protocol",
    "status": "Active",
    "startDate": "2026-06-15T01:00:05",
    "expectedEndDate": "2026-09-07T01:00:05",
    "currentPhaseOrder": 2,
    "currentPhaseName": "Movement Engineering",
    "completedSessions": 7,
    "totalSessions": 31
  },
  "latestNps": 8.5,
  "npsCategory": "Passive",
  "kpis": {
    "programProgressPercent": 23,
    "completedSessions": 7,
    "totalSessions": 31,
    "latestVas": 2,
    "vasAcceptableMax": 2,
    "phaseCriteria": [
      { "criterionType": "LSI Strength", "operator": ">=", "targetValue": 70, "unit": "LSI %",
        "currentValue": 68, "measuredAt": "2026-03-24T10:00:00", "isMet": false },
      { "criterionType": "VAS Pain", "operator": "<=", "targetValue": 2, "unit": "1-10",
        "currentValue": 2, "measuredAt": "2026-03-26T10:00:00", "isMet": true }
    ]
  },
  "careTeam": {
    "doctor": { "id": 226, "nameEn": "Dr. Hossam Zidan", "nameAr": "د. حسام زيدان" },
    "coaches": [ { "id": 301, "nameEn": "Karim", "nameAr": "كريم" } ]
  },
  "status": {
    "programStatus": "Active",
    "sessionsUntilPhaseTransition": 3,
    "wellnessToday": 4.2,
    "attendedAppointments": 6,
    "scheduledPastAppointments": 7
  },
  "interactionNote": {
    "personality": "Wants to understand the reason behind every exercise...",
    "communicationTip": "Tell him his ROM improved by 10° in two weeks.",
    "updatedBy": { "id": 226, "nameEn": "Dr. Hossam Zidan", "nameAr": "د. حسام زيدان" },
    "updatedAt": "2026-03-20T12:00:00"
  },
  "contact": {
    "phone": "01xxxxxxxxx",
    "email": "h.salem@example.com",
    "address": null,
    "emergencyContacts": [ { "name": "Mother", "phoneNumber": "01xxxxxxxxx" } ]
  }
}
```

### Header mapping

| UI element | Field |
|---|---|
| Avatar | `imageUrl` (fallback: initials from `nameAr`/`nameEn`) |
| Name | `nameAr` / `nameEn` |
| "32 سنة · ذكر" (age · gender) | `age`, `genderId` (1 = male, 2 = female; use the existing gender lookup) |
| Sport | `sport` |
| Branch ("فرع التجمع") | `branchNameAr` / `branchNameEn` (branch of the latest appointment) |
| "مشترك منذ" (member since) | `memberSince` — **may be `null`**; hide the item if so |
| Badge: program name | `activePlan.planName` |
| Badge: "المرحلة 2 - …" (current phase) | `activePlan.currentPhaseOrder` + `currentPhaseName` |
| Badge: "جلسة 7/31" (session x of y) | `activePlan.completedSessions` / `totalSessions` |
| Badge: "NPS: 8.5" | `latestNps` (hide if `null`) |
| Buttons الدكتور / المدرب (contact doctor / coach) | `careTeam.doctor`, `careTeam.coaches` |

`activePlan` is `null` when the athlete has no treatment plan. In that case hide the plan badges and show the KPI cards empty.

### KPI cards

| Card | Value | Bar / subtitle |
|---|---|---|
| تقدم البرنامج (Program progress) | `kpis.programProgressPercent` % | "`completedSessions` من `totalSessions` جلسة" |
| LSI / strength cards | the item in `kpis.phaseCriteria` with that `criterionType` | target text from `operator` + `targetValue` + `unit`; colour from `isMet` |
| آخر VAS (Last VAS) | `kpis.latestVas` / 10 | "مقبول ≤ `vasAcceptableMax`" when not `null` |

`phaseCriteria` holds **the current phase's transition criteria**, so the number of cards depends on the plan.
A good approach: card 1 is always progress, the last card is always VAS, and the cards in between come from `phaseCriteria` (excluding VAS), at most 2.

`isMet` values: `true` = green, `false` = red/amber, `null` = no data yet (grey, show "—").

### Sidebar mapping

| Card | Fields |
|---|---|
| حالة الملف (File status) | `status.programStatus`, `status.sessionsUntilPhaseTransition` ("مرحلة الانتقال: 3 جلسات"), `status.wellnessToday` ("/ 5"), attendance "`attendedAppointments` / `scheduledPastAppointments`", NPS + `npsCategory` |
| ملاحظة التعامل (Interaction note) | `interactionNote.personality`, `interactionNote.communicationTip` (render as a quote). `null` → show an "Add note" button |
| التواصل (Contact) | `contact.phone`, `contact.email`, branch from the header fields |
| صلاحية البيانات (Data validity) | `activePlan.startDate` → `activePlan.expectedEndDate` |

---

## 4. Tab 1 — Overview

`GET /api/AthleteProfile/{patientId}/overview`

```json
{
  "currentStatus": {
    "planName": "Return to Play — ACL Protocol",
    "phaseOrder": 2,
    "phaseName": "Movement Engineering",
    "currentSessionNumber": 8,
    "totalSessions": 36,
    "coaches": [ { "id": 301, "nameEn": "Karim", "nameAr": "كريم" } ],
    "nextSession": {
      "phaseSessionId": 1510,
      "globalSessionNumber": 8,
      "sessionType": "Swarm",
      "startTime": "2026-03-28T11:00:00",
      "coachName": "Karim"
    },
    "transitionCriteria": [ /* CriterionStatus[] — same shape as kpis.phaseCriteria */ ]
  },
  "alerts": [
    { "severity": "Warning", "messageEn": "LSI Strength: 68 — phase target (>= 70) not met", "messageAr": "LSI Strength: 68 — لم يتحقق هدف المرحلة (>= 70)" },
    { "severity": "Warning", "messageEn": "Missed 1 appointment(s).", "messageAr": "تغيب عن 1 موعد." }
  ],
  "latestDoctorNote": { "note": "Good progress in ROM but strength is behind...", "date": "2026-03-26T09:00:00" },
  "recentSessions": [ /* SessionLogItem[] — up to 3, newest first */ ]
}
```

| UI block | Fields |
|---|---|
| الوضع الحالي (Current status) | `currentStatus.*`. Session row: "`currentSessionNumber` من أصل `totalSessions` جلسة". Coaches: join the names. Next session: format `nextSession.startTime` + `sessionType`; `nextSession` is `null` when every session is done or none is booked |
| معيار الانتقال (Transition criteria) | `transitionCriteria`; render as "LSI ≥ 70% + VAS ≤ 2 + ..." |
| تنبيهات سريرية (Clinical alerts) | `alerts[]`. Show the red "يحتاج انتباه" (needs attention) box only when the list is not empty |
| Doctor note | `latestDoctorNote` (can be `null`; hide the block) |
| آخر 3 جلسات (Last 3 sessions) | `recentSessions[]` (see [SessionLogItem](#sessionlogitem)) |

`currentStatus` is `null` when the athlete has no plan.

Alerts are generated by the server from:
- current-phase criteria with `isMet: false`
- appointments marked No-Show
- session ratings ≤ 3/10 in the last 14 days
- today's wellness average ≤ 2/5

---

## 5. Tab 2 — Injury & History

`GET /api/AthleteProfile/{patientId}/injury-history`

```json
{
  "currentInjury": {
    "diagnosis": "Complete ACL tear",
    "injuryGrade": "Grade3",
    "injuryName": "Right knee — ACL",
    "side": "Right",
    "injuryDate": "2026-02-10",
    "mechanism": "Sudden twist while shooting",
    "isSportRelated": true,
    "diagnosticTests": [ "MRI" ],
    "specialists": [ { "doctorName": "Dr. Ahmed Mansour", "specialty": "Orthopedic surgery", "diagnosis": "ACL reconstruction" } ]
  },
  "medicalHistory": {
    "previousInjuries": [ { "description": "Left thigh muscle strain", "bodyPart": "Left thigh", "injuryDate": "2023-05-01", "treatmentReceived": "Full recovery" } ],
    "previousSurgeries": [ { "surgeryType": "ACL Reconstruction (Hamstring Graft)", "bodyPart": "Right knee", "surgeryDate": "2026-03-05", "description": "Duration 70 min, no complications" } ],
    "chronicConditions": [],
    "medications": [ { "name": "Voltaren Gel", "dose": null, "frequency": "Topical only" } ],
    "allergies": null,
    "sport": "Football",
    "yearsOfPractice": 10,
    "clubName": null,
    "goal": "Return to recreational league within 6 months"
  },
  "clinicalWarning": "Athlete was very active before the injury — risk of high expectations.",
  "timeline": [
    { "type": "Consultation", "date": "2026-03-15T10:00:00", "title": "Blueprint", "subtitle": "Dr. Hossam Zidan", "description": "...", "status": "Completed" },
    { "type": "Surgery", "date": "2026-03-05T00:00:00", "title": "ACL Reconstruction", "subtitle": "Right knee", "description": "...", "status": null }
  ]
}
```

| UI block | Fields |
|---|---|
| الإصابة الحالية (Current injury) | `currentInjury`. The surgery row comes from the latest `medicalHistory.previousSurgeries[]`; the surgeon from `currentInjury.specialists[]`; the external report from `diagnosticTests` |
| التاريخ الطبي (Medical history) | previous injuries, chronic conditions ("لا يوجد" (none) if empty), medications, allergies ("لا يوجد" if `null`), sport activity, goal |
| Yellow warning box | `clinicalWarning` (hide if `null`) |
| سجل التحويلات والاستشارات الخارجية (Referrals & external consultations) | `timeline[]`, already sorted newest first |

`timeline[].type` is one of `Consultation`, `ExternalReferral`, `MedicalReport`, `Surgery`; use it to choose the icon.  
`currentInjury` is `null` when the athlete has no consultation, injury data or medical report.  
`injuryGrade` and `side` are enum names; translate them in the UI.

---

## 6. Tab 3 — Program & Plan

`GET /api/AthleteProfile/{patientId}/plan` → returns **404** when the athlete has no plan; show an empty state in that case.

```json
{
  "treatmentPlanId": 1034,
  "planName": "ACL Reconstruction — Return to Play",
  "status": "Active",
  "doctor": { "id": 226, "nameEn": "Dr. Hossam Zidan", "nameAr": "د. حسام زيدان" },
  "phases": [
    { "phaseId": 1070, "phaseOrder": 1, "phaseName": "Pain Engineering", "weeks": 2, "status": "Completed", "progressPercent": 100 },
    { "phaseId": 1071, "phaseOrder": 2, "phaseName": "Movement Engineering", "weeks": 3, "status": "InProgress", "progressPercent": 35 },
    { "phaseId": 1072, "phaseOrder": 3, "phaseName": "Strength Building", "weeks": 4, "status": "Upcoming", "progressPercent": 0 }
  ],
  "currentPhaseOrder": 2,
  "currentPhaseCriteria": [ /* CriterionStatus[] */ ],
  "modifications": [
    {
      "id": 12, "phaseOrder": 2,
      "description": "Added Eccentric Leg Press",
      "requestedBy": { "id": 410, "nameEn": "Khaled", "nameAr": "خالد" },
      "status": "Approved",
      "doctorNote": null,
      "createdAt": "2026-03-25T10:00:00",
      "reviewedAt": "2026-03-25T12:00:00"
    }
  ]
}
```

| UI block | Fields |
|---|---|
| Plan title | `planName` |
| Phase list ("م1 — …  مكتملة / جارية 35% / قادمة") | `phases[]`: `Completed` → مكتملة (completed), `InProgress` → "جارية `progressPercent`%" (in progress), `Upcoming` → قادمة (upcoming) |
| المرحلة الحالية — معايير الانتقال (Current phase — transition criteria) | `currentPhaseCriteria[]`. Per row: ✓ if `isMet`, ⚠ + value if `false`, "—" if `null`. Footer: count of unmet criteria |
| التعديلات على البروتوكول (Protocol modifications) | `modifications[]`, newest first; the last row is the original protocol by `doctor` |

---

## 7. Tab 4 — Measurements & Data

`GET /api/AthleteProfile/{patientId}/measurements`

```json
{
  "measurements": [
    {
      "measurementId": 14,
      "name": "Quad Strength",
      "unit": "N",
      "latestValue": 162,
      "referenceValue": 238,
      "lsiPercent": 68.1,
      "measuredAt": "2026-03-24T10:00:00",
      "target": { "criterionType": "Quad Strength", "operator": ">=", "targetValue": 140, "unit": "N",
                  "currentValue": 162, "measuredAt": "2026-03-24T10:00:00", "isMet": true },
      "status": "Normal",
      "history": [
        { "measuredAt": "2026-03-10T10:00:00", "value": 120, "referenceValue": 236 },
        { "measuredAt": "2026-03-24T10:00:00", "value": 162, "referenceValue": 238 }
      ]
    }
  ],
  "wellness": {
    "sleepQuality": 5.0, "fatigue": 2.0, "mood": 5.0, "muscleSoreness": 2.5, "stress": null,
    "days": [ { "date": "2026-03-26", "sleepQuality": 5, "fatigue": 2, "mood": 5, "muscleSoreness": 3, "stress": null } ]
  },
  "trainingLoad": {
    "sessions": [ /* SessionLogItem[] from the last 7 days, newest first */ ],
    "averageLoadPerSession": 135
  }
}
```

| UI block | Fields |
|---|---|
| القياس الموضوعي — آخر قياسات (Objective measurement — latest values) | one row per `measurements[]`: `name`, `latestValue` + `unit`, "/ `referenceValue` سليم" (healthy side) when set, target from `target` |
| Status chip | `status`: `Normal` = طبيعي (green), `NearTarget` = يقترب من الهدف (amber, within 10% of the target), `BelowTarget` = أقل من الهدف (red), `NoTarget` = no chip |
| Trend chart (optional) | `history[]` (oldest → newest) |
| Wellness (Hooper Index) | `wellness.*` averages over the last 7 days (scale 1–5, 5 = best); `days[]` for a daily view |
| sRPE — Training Load | `trainingLoad.sessions[]`: show "ج`globalSessionNumber` — date" + "TL `trainingLoad` · sRPE `rpe`"; footer "متوسط TL / جلسة: `averageLoadPerSession` AU" (average TL per session) |

`lsiPercent` = `latestValue / referenceValue × 100`. It is only set when `referenceValue` exists.

All three lists can be empty; show an empty state for each.

---

## 8. Tab 5 — Session Log

`GET /api/AthleteProfile/{patientId}/sessions?take=5`  
Omit `take` to return every completed session ("عرض كل الجلسات").

```json
{
  "completedSessions": 7,
  "totalSessions": 36,
  "sessions": [ /* SessionLogItem[], newest first */ ]
}
```

Title: "سجل الجلسات الكامل — `completedSessions` من `totalSessions`" (full session log — x of y).

### SessionLogItem

```json
{
  "phaseSessionId": 1521,
  "globalSessionNumber": 7,
  "sessionNumber": 3,
  "phaseName": "Movement Engineering",
  "sessionType": "Swarm",
  "isMeasurementSession": false,
  "date": "2026-03-26T10:00:00",
  "coachNames": [ "Karim", "Sara" ],
  "completionStatus": "Good",
  "coachNote": "Mild muscle fatigue — reduce Heel Slides",
  "patientComment": "Felt good",
  "rating": 8,
  "rpe": 6,
  "durationMinutes": 30,
  "trainingLoad": 180,
  "painLevel": 2
}
```

| UI element | Field |
|---|---|
| "ج7" (session 7) | `globalSessionNumber` (number across the whole plan; `sessionNumber` is the number within the phase) |
| Title "Swarm — Recharger + Resilience" | `sessionType` (+ `"+ قياسات"` (measurements) when `isMeasurementSession`) |
| Subtitle "26 مارس · م. كريم · م. سارة · تعليق: …" | `date`, `coachNames`, `coachNote` |
| sRPE number | `rpe` (show "—" when `null`) |
| Stars | `rating` is **0–10**; stars = `Math.round(rating / 2)` out of 5 |

Every field after `completionStatus` is nullable.

---

## 9. Tab 6 — Surveys

`GET /api/AthleteProfile/{patientId}/surveys`

```json
{
  "wellnessDaysAnswered": 5,
  "wellnessDaysRequested": 5,
  "wellness": [ /* WellnessDay[] for the last 5 days, newest first */ ],
  "nps": [
    {
      "id": 3, "surveyType": "MonthlyNps", "score": 8.5, "category": "Passive",
      "submittedAt": "2026-03-22T18:00:00",
      "answers": [
        { "question": "ما الذي أعجبك في البرنامج؟", "answer": "الفريق محترف جداً والتقدم واضح في الحركة." },
        { "question": "ما الذي تتمنى تحسينه؟", "answer": "أتمنى معرفة جدول المواعيد أسبوع كامل مسبقاً." }
      ]
    }
  ],
  "postBlueprint": [
    { "id": 2, "surveyType": "PostBlueprint", "score": 4.8, "category": null, "submittedAt": "2026-03-16T12:00:00", "answers": [ ] }
  ]
}
```

| UI block | Fields |
|---|---|
| Wellness اليومي — آخر 5 أيام (Daily wellness — last 5 days) | `wellness[]`; response-rate banner = `wellnessDaysAnswered / wellnessDaysRequested × 100` % |
| NPS الشهري (Monthly NPS) | each `nps[]`: big `score`, `category` chip, `answers[]` as Q/A blocks |
| Post-Blueprint Survey | each `postBlueprint[]`: `answers[]`, "تقييم الجلسة العام: `score` / 5" (overall session rating) |

---

## 10. Write Endpoints

### Save the interaction note (sidebar)

`PUT /api/AthleteProfile/{patientId}/interaction-note`

```json
{ "personality": "Wants to understand the reason behind every exercise...", "communicationTip": "Tell him his ROM improved by 10° in two weeks." }
```

Creates the note or replaces the existing one (one note per athlete). The current user is recorded as `updatedBy`.
**Response:** `200` with `data` = the saved `InteractionNote`; use it to update the sidebar without reloading.

### Record measurement results

`POST /api/AthleteProfile/{patientId}/measurements`

```json
{
  "phaseSessionId": 1510,
  "measuredAt": "2026-03-24T10:00:00",
  "results": [
    { "measurementId": 14, "value": 162, "referenceValue": 238, "notes": null },
    { "measurementId": 9,  "value": 115, "referenceValue": null, "notes": "Flexion" }
  ]
}
```

| Field | Required | Notes |
|---|---|---|
| `phaseSessionId` | no | Must belong to this athlete's plan |
| `measuredAt` | no | Defaults to now |
| `results[].measurementId` | yes | Id from the measurement definitions (`GET /api/Measurements`) |
| `results[].value` | yes | Injured / measured side |
| `results[].referenceValue` | no | Healthy side or norm; enables `lsiPercent` |

**Response:** `200` with `data: true`. Errors (`400`): empty `results`, unknown `measurementId`, or a session from another athlete.  
After saving, re-fetch the summary and the Measurements tab.

### Submit a survey

`POST /api/AthleteProfile/{patientId}/surveys`

```json
{
  "surveyType": "MonthlyNps",
  "score": 8.5,
  "answers": [ { "question": "ما الذي أعجبك في البرنامج؟", "answer": "..." } ]
}
```

| `surveyType` | `score` range |
|---|---|
| `MonthlyNps` | 0 – 10 |
| `PostBlueprint` | 0 – 5 |

**Response:** `200` with `data` = the new survey id.

---

## 11. Shared Types & Enums

### CriterionStatus

| Field | Type | Notes |
|---|---|---|
| `criterionType` | string | e.g. `"LSI Strength"`, `"VAS Pain"`, `"Hop Test"`, `"Knee Flexion ROM"` |
| `operator` | string | `>=`, `<=`, `>`, `<`, `=` → render as ≥ ≤ > < = |
| `targetValue` | number | |
| `unit` | string? | e.g. `"LSI %"`, `"degrees"`, `"1-10"` |
| `currentValue` | number? | `null` = never measured |
| `measuredAt` | datetime? | |
| `isMet` | bool? | `null` when there is no data |

### Enum strings

| Field | Values |
|---|---|
| `activePlan.status`, `status.programStatus`, plan `status` | `Active`, `Completed`, `Paused` |
| `phases[].status` | `Completed`, `InProgress`, `Upcoming` |
| `measurements[].status` | `Normal`, `NearTarget`, `BelowTarget`, `NoTarget` |
| `npsCategory` / `category` | `Promoter` (9–10), `Passive` (7–8.9), `Detractor` (0–6.9) |
| `sessionType` | `Solo`, `Swarm` |
| `completionStatus` | `NotStarted`, `Poor`, `Normal`, `Good`, `Excellent` |
| `alerts[].severity` | `Warning`, `Info` |
| `timeline[].type` | `Consultation`, `ExternalReferral`, `MedicalReport`, `Surgery` |
| `modifications[].status` | `Pending`, `Approved`, `Reverted` |

---

## 12. Business Rules the UI Should Know

- **Which plan is shown:** the athlete's **active** plan; if there is none, their most recent plan.
- **Done session:** the athlete logged it (any status except `NotStarted`) **or** its appointment is `Completed`. Progress %, "x of y" and the session log all use this rule.
- **Current phase:** the phase that contains the first session that isn't done. When every session is done it stays on the last phase, so `sessionsUntilPhaseTransition` becomes `0` and every phase shows `Completed`.
- **Criteria ↔ measurements:** a criterion is matched to a measurement **by name** (`criterionType` == the measurement definition's name, case-insensitive). When the criterion's unit contains `%` and the result has a `referenceValue`, the LSI % is compared; otherwise the raw value is compared. If an admin names a measurement differently from the criterion, the criterion stays `isMet: null`.
- **VAS:** when there is no "VAS" measurement, the latest `painLevel` from the session logs is used.
- **Training load (sRPE):** `rpe × durationMinutes`, in AU. `durationMinutes` comes from the coach's session note, falling back to the appointment length.
- **Wellness scale:** 1–5 for every item, **5 = best** (also for fatigue/soreness/stress).

---

## 13. Related Changes (Notifications, Mobile RPE)

### New notification types (doctor)

The plan's doctor now gets a real-time notification (SignalR `ReceiveNotification`) when the coach manager changes their plan:

| Value | Name | Sent when |
|---|---|---|
| `28` | `PlanCoachAssigned` | Coach assigned/replaced on a session, station coaches changed, or a station created with a coach |
| `29` | `PlanModifiedByCoachManager` | Exercise added, exercises reordered, or a station created without a coach |

Payload: `relatedEntityType: "TreatmentPlan"`, `relatedEntityId: <treatmentPlanId>`. Clicking the notification should open the plan (or this profile through the plan's `patientId`).
Add both values to the frontend's `NotificationType` enum (see `docs/FRONTEND_INTEGRATION.md`).

### Mobile: session rating now accepts RPE

`POST /api/Mobile/sessions/{sessionId}/rating`

```json
{ "patientId": 239, "rating": 8, "notes": "Felt good", "rpe": 6 }
```

`rpe` is optional (0–10, Borg CR-10). Ask for it on the post-session rating screen ("How hard was the session?"); it feeds the profile's sRPE column and the Training Load card.

---

## 14. Not Covered by the API Yet

These parts of the design have no endpoint yet. Keep them disabled or hidden:

- **Quick actions** (إجراء سريع): new session, schedule measurements, edit plan, notify athlete, clinical alert. Link to the existing screens where they exist (booking, plan editor).
- **Gap solutions** (إجراءات الفجوات): re-assessment consultation, cancel program, transfer branch, AMA discharge, link guardian.
- **"قائد الفريق" (team leader) button**: there is no team-leader role on a plan.
- **Data-validity "upgrade available" card**.
