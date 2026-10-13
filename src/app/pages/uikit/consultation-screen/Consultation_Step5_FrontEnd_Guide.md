# Consultation — Step 5 "Path Selection" — Front-End Integration Guide

**Endpoints**
- Save & complete: `POST /api/ConsultationSession/{appointmentId}/complete`
- Load / review: `GET /api/ConsultationSession/{appointmentId}`

**Auth:** `Authorization: Bearer <token>`
**On success:** `POST` returns `204 No Content`. The session becomes `isCompleted: true`, `currentStep: 6` (read-only).

Step 5 has three paths, chosen by `decisionType`:

| `decisionType` | Path | Extra payload |
|---|---|---|
| `0` | Direct Blueprint | none |
| `1` | External Referral | referral fields (below) |
| `2` | Internal Measurements | `measurementRequest` object (below) |

---

## Path 0 — Direct Blueprint

```json
{
  "decisionType": 0,
  "notes": "Diagnosis is clear, start protocol immediately."
}
```
`notes` optional. Nothing else to send.

---

## Path 1 — External Referral

### Request

```json
{
  "decisionType": 1,
  "notes": "Patient needs imaging before we proceed.",
  "referralSpecialty": "Orthopedic Surgeon",
  "referralTestType": "MRI",
  "referralRegion": "Right Knee",
  "referralPurpose": "Rule out full ACL tear & evaluate joint integrity",
  "referralProfessionalNote": "Clinical observations and specific diagnostic instructions...",
  "referralRecommendedProviderName": "Dr. Ahmed Hassan",
  "referralRecommendedProviderMobile": "+20 100 123 4567",
  "referralNeedFollowUp": true
}
```

### Fields

| JSON key | UI label | Type | Required |
|---|---|---|---|
| `referralSpecialty` | Specialty * | string | **Yes** |
| `referralTestType` | Test (MRI / X-Ray / CT …) | string | No |
| `referralRegion` | Region | string | No |
| `referralPurpose` | Purpose | string | No |
| `referralProfessionalNote` | Professional Note | string | No |
| `referralRecommendedProviderName` | Recommended Doctor / Center Name | string | No |
| `referralRecommendedProviderMobile` | Mobile Number | string | No |
| `referralNeedFollowUp` | Needs follow-up after results | bool | No (default `false`) |
| `referralDescription` | — | string | No — **legacy, don't use.** Prefer Purpose + Professional Note |

### Rules
- **Only `referralSpecialty` is mandatory.** Validate it client-side before enabling submit.
- `referralNeedFollowUp = true` → the system emails the patient reminders on days **2, 5, 10, 30** automatically. The 2/5/10/30 chips on the screen are display-only; nothing to send for them.

---

## Path 2 — Internal Measurements

### Request

```json
{
  "decisionType": 2,
  "notes": "Need force-plate assessment before starting.",
  "measurementRequest": {
    "subCategoryId": 4,
    "measurementIds": [12, 15, 18],
    "side": 2,
    "date": "2026-07-10"
  }
}
```

### `measurementRequest` fields

| JSON key | UI control | Type | Required |
|---|---|---|---|
| `subCategoryId` | Sub-Category dropdown (e.g. "Range Of Motion") | int | **Yes** |
| `measurementIds` | "Select measurements" multi-select | int[] | **Yes — at least one** |
| `side` | Side toggle | int enum (see below) | **Yes** |
| `date` | Date picker | `"YYYY-MM-DD"` | No |

### Rules
- The measurements multi-select **must be filtered to the selected sub-category**. The server rejects the submit if any id doesn't belong to `subCategoryId`.
- `date` is optional:
  - **With `date`** → the server auto-books a measurement appointment (that date, 09:00, 60 min) for the patient. The ticket status comes back as `Scheduled`.
  - **Without `date`** → ticket is created as `Pending`, no appointment.
- Re-submitting Step 5 replaces the ticket and cancels any previously auto-booked measurement appointment.

### Populating the dropdowns
Use the existing measurement master-data endpoints:
- Sub-categories: `GET /api/MeasurementSubCategories` (and/or `GET /api/MeasurementCategories`)
- Measurements under a sub-category: from the same measurement APIs, filter by `subCategoryId`.

---

## Enums

### `decisionType`
| Value | Meaning |
|---|---|
| `0` | Direct Blueprint |
| `1` | External Referral |
| `2` | Internal Measurements |

### `side` (Internal Measurements)
| Value | Label |
|---|---|
| `0` | Left |
| `1` | Right |
| `2` | Bilateral |

### `measurementRequest.status` (read-only, GET response)
| Value | Label |
|---|---|
| `0` | Pending |
| `1` | Scheduled |
| `2` | Completed |
| `3` | Cancelled |

### `externalReferral.status` (read-only, GET response — reminder lifecycle)
| Value | Meaning |
|---|---|
| `0` | Pending |
| `1` | Reminded (2 days) |
| `2` | Reminded (5 days) |
| `3` | Escalated (10 days) |
| `4` | Cancelled (30 days) |
| `5` | Completed |

---

## GET response — the `decision` object

`GET /api/ConsultationSession/{appointmentId}` → `decision` is `null` until Step 5 is submitted. After submit:

```json
"decision": {
  "id": 7,
  "decisionType": 1,
  "notes": "…",
  "externalReferral": {
    "id": 3,
    "specialty": "Orthopedic Surgeon",
    "description": null,
    "testType": "MRI",
    "region": "Right Knee",
    "purpose": "…",
    "professionalNote": "…",
    "recommendedProviderName": "Dr. Ahmed Hassan",
    "recommendedProviderMobile": "+20 100 123 4567",
    "needFollowUp": true,
    "status": 0
  },
  "measurementRequest": null
}
```

For `decisionType = 2`:

```json
"decision": {
  "id": 8,
  "decisionType": 2,
  "notes": "…",
  "externalReferral": null,
  "measurementRequest": {
    "id": 5,
    "subCategoryId": 4,
    "subCategoryName": "Range Of Motion",
    "measurementIds": [12, 15, 18],
    "side": 2,
    "scheduledDate": "2026-07-10",
    "status": 1,
    "measurementAppointmentId": 88
  }
}
```

- `externalReferral` populated only when `decisionType = 1`, else `null`.
- `measurementRequest` populated only when `decisionType = 2`, else `null`.
- Use these to pre-fill the form when re-opening, and to show a read-only summary once `isCompleted = true`.

---

## Error handling

All `400` responses:

```json
{ "errors": [ { "errorEn": "...", "errorAr": "..." } ] }
```

| When | `errorEn` |
|---|---|
| `decisionType = 1` and `referralSpecialty` empty | `Specialty is required for an external referral.` |
| `decisionType = 2` and `measurementRequest` missing / no `subCategoryId` / empty `measurementIds` | `A sub-category and at least one measurement are required for an internal measurement.` |
| `decisionType = 2` and `subCategoryId` unknown | `Measurement sub-category not found.` |
| `decisionType = 2` and a measurement id is not in that sub-category | `One or more selected measurements do not belong to the chosen sub-category.` |
| No consultation session exists for the appointment | `Consultation session not found.` |

Show `errorAr` for Arabic UI.

---

## Quick checklist

- [ ] External Referral: submit disabled until Specialty filled; send all 6 optional fields.
- [ ] Internal Measurements: measurements list filtered by sub-category; send `side`; `date` optional.
- [ ] `side`: Left=0, Right=1, Bilateral=2.
- [ ] Read screen renders `decision.externalReferral` / `decision.measurementRequest`.
- [ ] Handle the 5 `400` messages above.
- [ ] After `204`, lock the wizard (`isCompleted = true`).
