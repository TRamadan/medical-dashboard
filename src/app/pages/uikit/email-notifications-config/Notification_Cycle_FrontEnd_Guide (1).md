# Notifications — Front-End Integration Guide

**Auth:** `Authorization: Bearer <token>` on every REST call below.
**Base URL:** same API host as everything else (e.g. `https://portalapi.thesportsdoctorlab.com`).

## How it fits together

There are **two sources** that create notifications, but they land in the same place:

1. **System (event-driven)** — created automatically by backend logic: a booking, a cancellation, a low rating, a coach reassignment, etc. Nothing to configure; happens as a side effect of normal actions.
2. **Recurring Triggers (admin-configured)** — an admin/coach-manager sets up a scheduled campaign (e.g. "Weekly digest every Monday at 8am to Doctors"). A background job evaluates these on a schedule and fires them.

Both write to the same `Notification` row and are delivered to the recipient the same two ways:
- **REST** — pull the list/unread count whenever the app loads or the bell icon is opened.
- **SignalR** — real-time push so the bell badge updates live without polling.

You don't need to treat the two sources differently in the feed UI — just render by `type`. The only type-level difference is that anything **created by a recurring trigger** has `type: 21` (`RecurringTrigger`) and `relatedEntityType: "NotificationTrigger"`.

---

## 1. Logging in

```
POST /api/UserAuth/Login?type=2
Content-Type: application/json

{ "value": "user@example.com", "password": "..." }
```

- **`type=2` for email/username login.** (`type=1` appears reserved for phone-number login — untested, don't use it for email.)
- Response: `{ "user": {...}, "token": "<jwt>", "isSuccess": true }`
- Token lifetime is short (~15 min per current config) — expect to re-authenticate reasonably often; there's no refresh-token endpoint currently.
- The JWT payload has a `userId` claim — you'll need it to join your SignalR group (see below). Decode it client-side, don't hardcode it.

---

## 2. REST API — reading notifications (the bell / feed)

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/Notifications/unread` | All unread notifications, newest first |
| `GET` | `/api/Notifications?page=1&pageSize=20` | Paginated full history (read + unread) |
| `GET` | `/api/Notifications/unread/count` | Just the badge count (`int`) |
| `PATCH` | `/api/Notifications/{id}/mark-read` | Mark one as read → `204` |
| `PATCH` | `/api/Notifications/mark-all-read` | Mark everything read → `204` |

**`NotificationGetDTO`** (what each item looks like):

```json
{
  "id": 42,
  "titleEn": "New Appointment Booked",
  "titleAr": "موعد جديد",
  "messageEn": "A new appointment has been booked (#123).",
  "messageAr": "تم حجز موعد جديد (#123).",
  "type": 1,
  "isRead": false,
  "relatedEntityType": "Appointment",
  "relatedEntityId": 123,
  "createdAt": "2026-09-13T08:00:00Z"
}
```

- `type` is an **integer**, not a string — see the reference table below to map it to an icon/label.
- `relatedEntityType`/`relatedEntityId` let you deep-link ("View Appointment", "View Trigger", etc.) — both nullable, don't assume they're set.
- Pick `titleEn`/`titleAr` and `messageEn`/`messageAr` based on the active locale — the backend always fills both.

### `NotificationType` reference

| Value | Name | Value | Name |
|---|---|---|---|
| 1 | AppointmentBooked | 12 | ProtocolModificationPending |
| 2 | ProfileDataCompleted | 13 | LowNPSAlert |
| 3 | AppointmentPaid | 14 | NegativeSessionFeedback |
| 4 | AppointmentCancelled | 15 | LowBlueprintRating |
| 5 | AppointmentRescheduled | 16 | NoticeableImprovement |
| 6 | ReviseAppointmentReady | 17 | PatientAbsence |
| 7 | PlanAppointmentReady | 18 | SessionStarted |
| 8 | ReferralReminder2Days | 19 | CoachReplaced |
| 9 | ReferralReminder5Days | 20 | CoachAssigned |
| 10 | ReferralEscalated | **21** | **RecurringTrigger** ← from admin triggers |
| 11 | ReferralCancelled | | |

---

## 3. Real-time delivery — SignalR

**Hub URL:** `/hubs/notifications` (e.g. `https://portalapi.thesportsdoctorlab.com/hubs/notifications`)

Auth for the hub is via **query string**, not a header — the SignalR client does this for you if you pass `accessTokenFactory`.

```js
const connection = new signalR.HubConnectionBuilder()
  .withUrl(hubUrl, { accessTokenFactory: () => rawJwtToken }) // no "Bearer " prefix
  .withAutomaticReconnect()
  .build();

connection.on('ReceiveNotification', (payload) => {
  // payload is a NotificationGetDTO — same shape as the REST list above
  showToast(payload.titleEn, payload.messageEn);
  incrementBadge();
});

await connection.start();

// REQUIRED — joining is manual, the server does not auto-join you on connect.
await connection.invoke('JoinUserGroup', myUserId.toString());
```

**Gotchas:**
- **You must call `JoinUserGroup` yourself after connecting** (and again after every reconnect — see `onreconnected`). The server groups clients by `user_{userId}`; nothing is joined automatically just by authenticating.
- `myUserId` must be the same `userId` from your JWT claim — decode it client-side rather than trusting any locally-cached value that might be stale after re-login.
- The event name is exactly `ReceiveNotification` (case-sensitive).
- A working reference implementation already exists at `wwwroot/notification-test.html` on the API host — open it, paste a token, and watch the feed live if you want to sanity-check your integration against a known-good client.

---

## 4. Recurring Notification Triggers (admin/manager screens only)

This is the config surface for the "recurring notifications" admin screen (schedule campaigns like weekly digests, trial-ending reminders, etc.). Regular app users never see this API — only whoever manages notification campaigns does.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/NotificationTriggers/types` | Category dropdown options |
| `GET` | `/api/NotificationTriggers/audience-options` | Staff-role + "Patients" options for the audience picker |
| `GET` | `/api/NotificationTriggers/users?employeeTypeId=&patients=&search=` | Specific-user picker, filtered by role or patients, optional name search |
| `GET` | `/api/NotificationTriggers` | List view |
| `GET` | `/api/NotificationTriggers/{id}` | Full detail, for the edit form |
| `POST` | `/api/NotificationTriggers` | Create |
| `PUT` | `/api/NotificationTriggers/{id}` | Update |
| `PATCH` | `/api/NotificationTriggers/{id}/toggle` | Flip active/inactive |
| `DELETE` | `/api/NotificationTriggers/{id}` | Delete |

### List view response

```json
{
  "activeCount": 2,
  "totalCount": 3,
  "triggers": [
    {
      "id": 1,
      "isActive": true,
      "title": "Weekly digest",
      "typeLabel": "Weekly Digest",
      "scheduleLabel": "Every week on Mon at 08:00",
      "audienceLabel": "Doctor, Coach, 2 user(s)"
    }
  ]
}
```

`scheduleLabel` and `audienceLabel` are pre-formatted, human-readable strings — render them as-is in the table, no client-side formatting needed.

### Create / update payload

```json
{
  "title": "Weekly digest",
  "message": "Here's what happened this week...",
  "type": 1,
  "frequency": 2,
  "interval": 1,
  "daysOfWeek": [1],
  "dayOfMonth": null,
  "timeOfDay": "08:00:00",
  "startDate": "2026-09-15",
  "endType": 1,
  "endDate": null,
  "maxOccurrences": null,
  "audienceEmployeeTypeIds": [1, 3],
  "includePatients": false,
  "recipientUserIds": [17, 42],
  "isActive": true
}
```

`GET /{id}` returns the same shape plus `recipients` (resolved `{id, name}` pairs for the specific extra users), `occurrenceCount`, and `lastRunAt`.

### Field reference

| Field | Type | Notes |
|---|---|---|
| `title` | string | required, ≤200 chars |
| `message` | string | required, ≤1000 chars |
| `type` | int | see `GET /types` — 9 placeholder categories today (names may change; always fetch this list, don't hardcode) |
| `frequency` | int | `1` Daily · `2` Weekly · `3` Monthly |
| `interval` | int | "every N ___" — every 2 weeks, every 3 days, etc. Min `1`. |
| `daysOfWeek` | int[] | **Weekly only, required non-empty.** ⚠️ Uses .NET's `DayOfWeek` numbering: **Sunday = 0** ... Saturday = 6 (not ISO 8601's Monday=1). Ignored for Daily/Monthly. |
| `dayOfMonth` | int? | **Monthly only, required 1–31.** Clamped server-side to the last day of short months (e.g. 31 → 28/29 in Feb). |
| `timeOfDay` | string | `"HH:mm:ss"`, 24-hour, local clinic time (not UTC) |
| `startDate` | string | `"yyyy-MM-dd"`, local date — the schedule never fires before this |
| `endType` | int | `1` Never · `2` OnDate · `3` AfterOccurrences |
| `endDate` | string? | **Required when `endType=2`**, else must be `null` |
| `maxOccurrences` | int? | **Required (≥1) when `endType=3`**, else must be `null` |
| `audienceEmployeeTypeIds` | int[] | Staff role IDs from `audience-options` (Doctor=1, Coach Manager=2, Coach=3, Nurse=4, Receptionist=5, Admin=6) |
| `includePatients` | bool | Adds all patients to the audience |
| `recipientUserIds` | int[] | Specific extra individual recipients, on top of the role/patient targeting |
| `isActive` | bool | Inactive triggers are saved but never evaluated |

**Validation rules the server enforces** (errors come back as `400 { "errors": ["..."] }`):
- At least one of `audienceEmployeeTypeIds`, `includePatients`, or `recipientUserIds` must be set — a trigger with nobody to notify is rejected.
- `daysOfWeek` required for Weekly; `dayOfMonth` (1–31) required for Monthly.
- `endDate` must be on/after `startDate` when `endType=2`.

**Behavior to know about:**
- A background job checks every ~1 minute whether an active trigger is due, and fires it — there's no way to force an immediate send from the API.
- Once a trigger fires, it won't fire again the same day even if you edit it and it re-qualifies — this is by design (once per day, max).
- If `endType=3` (AfterOccurrences) and the trigger just hit its limit, the server **automatically sets `isActive: false`**. Refresh the list after a trigger's due time passes if you're testing — don't assume `isActive` stays whatever you last set it to.
- Every recipient of a fired trigger gets a normal `Notification` row (`type: 21`) delivered through the exact same REST + SignalR path described above — no separate feed to build for this.
