# Portal Frontend — Backend Changes Guide

This covers the consultation-cycle rework (Step 3-5 of the doctor's wizard), the two new pending-ticket types, the treatment-plan linking fields, and the doctor-profile bio fields. All of this lives in the portal API (not the mobile API).

---

## 1. Consultation Session — Step 3-5 is now two genuinely different paths

**The old assumption — that Step 5 (`/complete`) always follows Step 3/4 — is gone.** `judgmentType` (set in Step 3) now determines which endpoint the doctor's UI calls next. Don't let the UI call `/complete` for a `WriteReport` session, or `/submit-report` for an `ExtraAssessment` session — both are now rejected server-side with a 400.

```
Step 3: PUT /api/ConsultationSession/{appointmentId}/step/3
Body includes: judgmentType: 0 (WriteReport) | 1 (ExtraAssessment)
```

### Path A — `judgmentType = WriteReport` (0)
1. Doctor fills Step 4 as before: `PUT /api/ConsultationSession/{appointmentId}/step/4`
2. Doctor submits the report — **new endpoint, no request body required** (empty `{}` or `{ "notes": "..." }` both work):
   ```
   POST /api/ConsultationSession/{appointmentId}/submit-report
   ```
   This sends a `MedicalReport` to the patient's mobile app. The session's status becomes `AwaitingPatientReport`. **The doctor's wizard should now show a "waiting for patient" state** — there's nothing more for the doctor to do on this appointment until the patient responds.
3. When the patient accepts/declines on their end:
   - **Accept** → session status becomes `Completed`. A "Build Treatment Plan" ticket appears on the doctor's `PendingTickets` (see §2) — this is where the doctor actually builds the plan, as a separate step, not automatically.
   - **Decline** → session reopens (`status: InProgress`, `currentStep: 3`) — the doctor's dashboard should show this appointment as needing attention again, same as any in-progress consultation.

### Path B — `judgmentType = ExtraAssessment` (1)
Step 4 is skipped entirely — going straight from Step 3 to the decision screen with the existing three options is still correct:
```
POST /api/ConsultationSession/{appointmentId}/complete
Body: { "decisionType": 0 | 1 | 2, ... }  // DirectBlueprint | ExternalReferral | InternalMeasurement
```
This endpoint's request/response contract is **unchanged** from what you already built. What changed is what happens *after*:

- **DirectBlueprint (0):** no report, no patient round-trip — same as before, the doctor should be taken straight into building the treatment plan. A ticket also now appears on `PendingTickets` (§2) if the doctor navigates away before finishing, so it's not lost.
- **ExternalReferral (1):** unchanged creation flow. **New:** there's now a way to close the loop when the patient comes back with results:
  ```
  POST /api/ConsultationSession/{appointmentId}/referral/complete
  ```
  No body. Call this from wherever your UI lets a doctor/receptionist mark a referral as resolved (e.g. a button on the referral's detail view). It flips the referral to `Completed` and reopens the consultation session (`status: InProgress`, `currentStep: 3`) so the doctor can make the real final call.
- **InternalMeasurement (2):** unchanged creation flow (still auto-books the measurement appointment when a date is given). **New:** once that measurement appointment's status is set to `Completed` via the existing endpoint you already use —
  ```
  PUT /api/Appointments/ChangeAppointmentStatus?appointmentId={measurementApptId}&newStatus=2
  ```
  — the *original* consultation session automatically reopens (`status: InProgress`, `currentStep: 3`). No new call needed here; just make sure whatever screen shows measurement appointments refreshes/re-checks the parent consultation's status after a measurement is marked complete, so the doctor sees it come back into their queue.

### Session status replaces the old boolean
`GET /api/ConsultationSession/{appointmentId}` used to return `isCompleted: boolean`. That field is gone — it's now:
```typescript
status: "InProgress" | "AwaitingPatientReport" | "AwaitingSubDecision" | "Completed"
```
Update anywhere the UI checked `isCompleted` to lock the wizard:
- `InProgress` → wizard is editable, resume at `currentStep`.
- `AwaitingPatientReport` / `AwaitingSubDecision` → wizard is locked/read-only; show a "waiting on X" banner instead of form fields.
- `Completed` → wizard is locked; this consultation is done.

---

## 2. Pending Tickets — two new ticket types

`GET /api/PendingTickets?tab=decision|urgent|all` — the default (`decision`) tab now includes two new ticket types alongside the existing `BlueprintConsultation`:

```typescript
enum TicketType {
  BlueprintConsultation = 0,
  ProtocolModification = 1,
  ComplianceAlert = 2,
  GraduationReady = 3,
  PhaseTimeoutAlert = 4,
  StaleDataWarning = 5,
  DirectBlueprintAwaitingPlan = 6,   // NEW
  ReportAcceptedAwaitingPlan = 7     // NEW
}
```

Both render with the same `PendingTicketDTO` shape you already handle, plus two new optional fields to pass along when the doctor clicks through:

```typescript
interface PendingTicketDTO {
  // ...existing fields unchanged...
  consultationDecisionId?: number;  // NEW — present on DirectBlueprintAwaitingPlan tickets
  medicalReportId?: number;         // NEW — present on ReportAcceptedAwaitingPlan tickets
}
```

Both ticket types carry the action `"build-treatment-plan"` — wire that action to open the treatment-plan builder, and pass whichever ID is present (`consultationDecisionId` or `medicalReportId`) into the create call (§3). **These tickets don't disappear until a treatment plan is actually created and linked** — don't build any client-side "dismiss" affordance for them; the only way they clear is by finishing the plan.

---

## 3. Treatment Plan creation — new linking fields

`POST /api/treatment-plans` and `PUT /api/treatment-plans/{id}` (`TreatmentPlanPostDTO`/`PutDTO`) gained two new optional fields:

```typescript
interface TreatmentPlanPostDTO {
  // ...all existing fields unchanged...
  consultationDecisionId?: number;  // NEW
  medicalReportId?: number;         // NEW
}
```

**When to set which:**
- Building a plan from a `DirectBlueprintAwaitingPlan` ticket → set `consultationDecisionId` to that ticket's `consultationDecisionId`.
- Building a plan from a `ReportAcceptedAwaitingPlan` ticket → set `medicalReportId` to that ticket's `medicalReportId`.
- Building any other plan (template, or a plan not tied to a ticket) → leave both `null`, exactly as before.

**Behavior:** these only take effect when the plan is saved as **Published** (`saveAsDraft: false`) — saving as a draft with one of these IDs set won't activate anything yet (that only happens on the publish that follows). Once published with one of these set:
- The corresponding ticket disappears from `PendingTickets`.
- The plan is automatically activated for the patient (they'll see it on their mobile app immediately) — **no additional "assign to patient" step needed**, and for the `medicalReportId` case, no second patient-acceptance step either (they already consented via the report).
- Setting `medicalReportId` on a report that hasn't been `Approved` by the patient yet is rejected with a 400 — the UI shouldn't offer this action until the ticket exists (which only happens post-acceptance anyway).

---

## 4. Doctor profile — new bio fields

Wherever the portal edits an employee/doctor's profile (registration form and update form both use the same nested `employeeProfileDTO` object), three new optional fields are available:

```typescript
interface EmployeeProfileDTO {
  // ...existing fields (address, employeeTypeId, attachments)...
  specialty?: string;          // NEW — e.g. "Sports Medicine Specialist"
  yearsOfExperience?: number;  // NEW
  rating?: number;             // NEW — e.g. 4.9 (decimal, one decimal place precision)
}
```

These only matter for doctors (`employeeTypeId = 1`) — they're what populates the doctor bio card on the patient's mobile Injury Report screen. Add them to the doctor edit form if there isn't already a field for them; they're plain optional inputs, no validation beyond normal string/number bounds.

---

## 5. Heads-up: booking notification fix (informational, no UI change needed)

Not something you need to build anything for, but worth knowing for QA: when a patient books an appointment and already has a registered account (either booked directly, or an anonymous web booking whose email matched an existing account), they now get an **in-app notification** ("Appointment Booked") instead of the anonymous "confirm your profile" invite email they were incorrectly getting before. If you're testing the booking flow end-to-end, expect a notification via the existing SignalR hub instead of an email in that case.

---

## Questions / follow-ups to flag back to backend
- Decline-then-revise on the WriteReport path currently just reopens the session with no special "this was declined" marker visible in the GET response beyond status — if the UI wants to show *why* it reopened (declined vs. never-submitted), that'd need a follow-up field.
- No role/ownership check exists yet on `ConsultationSessionController` (any authenticated user can currently write to any appointment's session) — flagged as a known gap, not yet fixed.
