# ConsultationSession API — Sample Request Bodies

Generated from the payload shapes in `consultation-screen.component.ts`. Use these to test each
endpoint independently (Postman/Thunder Client/curl) without walking through the whole wizard UI.

> ⚠️ Note: at the time of writing, `submitStep1()` / `submitStep2()` / `submitJudgment()` have
> `const id = 2;` hardcoded instead of `this.appointmentId()`. Replace `{appointmentId}` below with
> a real session id from your test DB — don't assume `2` is valid in your environment.

---

## Step 1 — Complaint Registration
**PUT** `/ConsultationSession/{appointmentId}/step/1`

```json
{
  "complaintInAthleteWords": "Sharp pain in the right knee when pivoting during training.",
  "impactOnTraining": 2,
  "impactOnCompetition": 1,
  "impactOnDailyLife": 0,
  "additionalImpactComment": "Pain worsens after 20 minutes of running.",
  "complaintStartDate": "2026-07-01",
  "whatAggravatesPain": "Pivoting, stairs, deep squats"
}
```

**Enum reference (`PerformanceImpactLevel`):** `0` No impact · `1` Partial impact · `2` Completely prevents me

---

## Step 2 — Assessment (Examination)
**PUT** `/ConsultationSession/{appointmentId}/step/2`

```json
{
  "procedures": [
    { "id": null, "procedureName": "Lachman Test", "result": "Negative", "order": 1 },
    { "id": null, "procedureName": "McMurray Test", "result": "Positive - medial click", "order": 2 }
  ],
  "vASPain": 6,
  "effusion": 2,
  "asymmetryPercent": 12
}
```

- `procedures[].id`: `null` for a brand-new row, or the real `serverId` (int) when updating an existing row.
- `order` is the array index + 1, **not** the row's local/display id.
- `asymmetryPercent`: send `null` if the field is empty (matches `this.asymmetry ? Number(...) : null`).

**Enum reference (`EffusionLevel`):** `0` None · `1` Trace · `2` Mild · `3` Moderate · `4` Severe

---

## Step 3 — Impression, Findings, Behavioral Signals & Judgment (Diagnosis)
**PUT** `/ConsultationSession/{appointmentId}/step/3`

This single endpoint covers two HTML screens (Impression & Findings + Judgment). The shape is the
same either way — only `judgmentType` and whether the "Write Report" fields are populated changes.

### Variant A — `judgmentType = 0` (Write Report)
```json
{
  "dysfunctionsAndRiskFactors": "Reduced quad activation, mild valgus collapse on single-leg squat.",
  "strengthsObserved": "Good core stability, full ankle mobility.",
  "weaknessesObserved": "Quad LSI at 68%, delayed glute med firing.",
  "notesAndGeneralImpression": "Consistent with early-stage patellofemoral pain syndrome.",
  "yellowFlags": 5,

  "emotionalTrigger": "Missed the regional qualifier last season due to injury.",
  "experienceWithOtherProviders": "Saw a physio for 2 weeks with no improvement.",
  "expectationsAndFears": "Afraid this will end his season again.",
  "complianceIndex": 0,
  "personaClassification": 1,
  "purchaseInfluencer": 2,
  "additionalBehavioralNotes": "Coach is very involved in decision-making.",

  "judgmentType": 0,

  "generalOpinion": "Manageable with structured rehab, no red flags for surgical referral.",
  "diagnosisText": "Grade I MCL sprain with secondary quad inhibition.",
  "injuryGrade": 0,
  "injuryPhase": 0,
  "clinicalNotes": "Reassess ROM in 2 weeks.",
  "therapeuticGoal": "Return to full training within 6 weeks.",
  "expectedDuration": "6 weeks",
  "therapeuticGoalType": 0
}
```

### Variant B — `judgmentType = 1` (Extra Assessment — skips Athlete Report, goes to Confirmation)
```json
{
  "dysfunctionsAndRiskFactors": "Reduced quad activation, mild valgus collapse on single-leg squat.",
  "strengthsObserved": "Good core stability, full ankle mobility.",
  "weaknessesObserved": "Quad LSI at 68%, delayed glute med firing.",
  "notesAndGeneralImpression": "Findings inconclusive, structural involvement not ruled out.",
  "yellowFlags": 0,

  "emotionalTrigger": "",
  "experienceWithOtherProviders": "",
  "expectationsAndFears": "",
  "complianceIndex": 0,
  "personaClassification": 0,
  "purchaseInfluencer": 0,
  "additionalBehavioralNotes": "",

  "judgmentType": 1,

  "generalOpinion": null,
  "diagnosisText": null,
  "injuryGrade": 0,
  "injuryPhase": 0,
  "clinicalNotes": "Recommend MRI before finalizing diagnosis.",
  "therapeuticGoal": null,
  "expectedDuration": "",
  "therapeuticGoalType": 0
}
```

**`yellowFlags` is a bitmask** over 5 flags (bit order = `yfItems` array order, values 1,2,4,8,16):
`1` Kinesiophobia · `2` Low recovery expectation · `4` High stress · `8` Negative prior experience · `16` Catastrophizing.
Example: flags 0 and 2 checked → `1 + 4 = 5`.

**Enum reference:**
- `ComplianceIndex`: `0` High · `1` Medium · `2` Low
- `PersonaClassification`: `0` Not specified · `1` Champion · `2` Skeptic · `3` Anxious · `4` Passive · `5` VIP
- `PurchaseInfluencer`: `0` Athlete · `1` Parent/Guardian · `2` Coach · `3` Club/Team
- `InjuryGrade`: `0` I · `1` II · `2` III
- `InjuryPhase`: `0` Acute · `1` Sub-Acute · `2` Chronic
- `TherapeuticGoalType`: `0` Return to Play · `1` Prevention · `2` Peak Performance · `3` Recharger

---

## Step 4 — Athlete Report / Rehab Plan
**PUT** `/ConsultationSession/{appointmentId}/step/4`
(Only reached when Step 3's `judgmentType = 0`.)

```json
{
  "recommendedServiceId": 4,
  "priorityLevel": 1,
  "programDuration": "8 Weeks",
  "planPhases": [
    {
      "id": null,
      "phaseName": "Phase 1: Mobility & Control",
      "goal": "Restore full range of motion",
      "transitionCriteria": "ROM flexion > 120°",
      "sessions": 8,
      "order": 1
    },
    {
      "id": null,
      "phaseName": "Phase 2: Strength & Load",
      "goal": "Equalize limb strength",
      "transitionCriteria": "LSI > 80%",
      "sessions": 12,
      "order": 2
    }
  ],
  "sportsRecommendations": "Resume light jogging after Phase 2, avoid contact sports until graduation.",
  "teamNotes": "Monitor psychological status (Yellow Flag alert). Focus on quad control."
}
```

- If `programDuration` was "Custom" in the UI, the value sent is a free-text string like
  `"Custom Program - 4 sessions/week"` (not a number of weeks).
- `planPhases[].id`: `null` for new rows, or the real phase id when updating.

**Enum reference (`ConsultationPriorityLevel`):** `0` Low · `1` Medium · `2` High

---

## Step 5 — Decision / Completion
**POST** `/ConsultationSession/{appointmentId}/complete`

Three variants depending on `selectedPath` (1/2/3) → `decisionType` (0/2/1 respectively — note the
non-sequential mapping in code: `{ 1: 0, 2: 2, 3: 1 }`).

### Variant A — `decisionType = 0` (Direct Blueprint / Path 1)
```json
{
  "decisionType": 0,
  "notes": "Proceeding directly with the rehab blueprint, no further referral needed."
}
```

### Variant B — `decisionType = 1` (External Referral / Path 3)
```json
{
  "decisionType": 1,
  "notes": "Referring for imaging before finalizing rehab plan.",
  "referralSpecialty": "Orthopedic Surgeon",
  "referralDescription": "MRI — Right Knee",
  "referralNeedFollowUp": true
}
```
> `referralDescription` is built client-side as `` `${referralTest} — ${referralRegion}`.trim() `` —
> here `referralTest = "MRI"`, `referralRegion = "Right Knee"`.

### Variant C — `decisionType = 2` (Internal Measurements / Path 2)
```json
{
  "decisionType": 2,
  "notes": "Baseline strength testing before confirming return-to-play timeline. (Measurement: Force Plate on 2026-08-10)"
}
```
> Note: `measurementType` / `measurementDate` have **no dedicated fields** in this payload — they're
> folded into the `notes` string as `" (Measurement: {type} on {date})"`.

---

## Quick copy-paste checklist for a full test cycle

| Order | Method | Path | Notes |
|---|---|---|---|
| 1 | PUT | `/ConsultationSession/{id}/step/1` | Complaint Registration |
| 2 | PUT | `/ConsultationSession/{id}/step/2` | Assessment |
| 3 | PUT | `/ConsultationSession/{id}/step/3` | Findings + Judgment (pick Variant A or B) |
| 4 | PUT | `/ConsultationSession/{id}/step/4` | Athlete Report — **only if** step 3 used `judgmentType: 0` |
| 5 | POST | `/ConsultationSession/{id}/complete` | Decision (pick Variant A, B, or C) |
| — | GET | `/ConsultationSession/{id}` | Verify state / resume step after each PUT |
