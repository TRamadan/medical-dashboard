# Frontend Integration Guide — Sports Doctor Lab API

**Base URL:** `https://portalapi.thesportsdoctorlab.com`  
**Swagger:** `https://portalapi.thesportsdoctorlab.com/swagger`  
**All protected endpoints require:** `Authorization: Bearer <token>`

---

## Table of Contents

1. [Real-Time Notifications (SignalR)](#1-real-time-notifications-signalr)
   - [Install](#install)
   - [Connect](#connect)
   - [Listen for Notifications](#listen-for-notifications)
   - [REST Notification API](#rest-notification-api)
   - [Notification Payload](#notification-payload)
   - [NotificationType Enum](#notificationtype-enum)
2. [Anonymous Booking → Profile Completion Flow](#2-anonymous-booking--profile-completion-flow)
   - [Overview](#overview)
   - [The Profile Completion Page](#the-profile-completion-page)
   - [API — GET Profile Data](#api--get-profile-data)
   - [API — Submit Health Form](#api--submit-health-form)
   - [Mobile Account Linking](#mobile-account-linking)
3. [Test Utilities](#3-test-utilities)

---

## 1. Real-Time Notifications (SignalR)

### Install

```bash
npm install @microsoft/signalr
# or
yarn add @microsoft/signalr
```

CDN (no bundler):
```html
<script src="https://cdn.jsdelivr.net/npm/@microsoft/signalr@8.0.7/dist/browser/signalr.min.js"></script>
```

---

### Connect

The hub is at `/hubs/notifications`. The JWT token **must** be passed via `accessTokenFactory` — SignalR sends it as `?access_token=...` on the WebSocket handshake.

```typescript
import * as signalR from '@microsoft/signalr';

let connection: signalR.HubConnection | null = null;

async function connectNotifications(jwtToken: string, userId: number) {
  connection = new signalR.HubConnectionBuilder()
    .withUrl('https://portalapi.thesportsdoctorlab.com/hubs/notifications', {
      accessTokenFactory: () => jwtToken,
    })
    .withAutomaticReconnect()                      // retries: 0s, 2s, 10s, 30s
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  // ── Subscribe before starting ──────────────────────────────────────────────
  connection.on('ReceiveNotification', handleNotification);

  connection.onreconnected(async () => {
    // Re-join the group after reconnect
    await connection!.invoke('JoinUserGroup', userId.toString());
  });

  // ── Start & join group ─────────────────────────────────────────────────────
  await connection.start();
  await connection.invoke('JoinUserGroup', userId.toString());

  console.log(`SignalR connected — listening as user_${userId}`);
}

async function disconnectNotifications(userId: number) {
  if (!connection) return;
  await connection.invoke('LeaveUserGroup', userId.toString());
  await connection.stop();
  connection = null;
}
```

> **Important:** Call `JoinUserGroup` after **every** successful connect or reconnect.  
> The server sends notifications to the group `user_{userId}` — you won't receive anything until you join.

---

### Listen for Notifications

```typescript
function handleNotification(notification: NotificationDTO) {
  console.log('[SignalR]', notification);

  // Show a toast, update a badge count, append to the list, etc.
  // notification.titleEn / notification.titleAr  — use based on UI language
  // notification.type                             — use to route the action
}
```

#### React example (with cleanup)

```tsx
useEffect(() => {
  if (!token || !userId) return;

  connectNotifications(token, userId);

  return () => {
    disconnectNotifications(userId);
  };
}, [token, userId]);
```

---

### REST Notification API

All endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/Notifications/unread` | All unread notifications for current user |
| `GET` | `/api/Notifications?page=1&pageSize=20` | Paginated history (default page 1, size 20) |
| `GET` | `/api/Notifications/unread/count` | Unread count (integer) — for badge |
| `PATCH` | `/api/Notifications/{id}/mark-read` | Mark single notification as read → 204 |
| `PATCH` | `/api/Notifications/mark-all-read` | Mark all as read → 204 |

**Recommended pattern:**

1. On app load: call `GET /unread/count` → show badge  
2. On notification panel open: call `GET /unread` → render list  
3. On panel close or item tap: call `PATCH /{id}/mark-read` or `mark-all-read`  
4. While panel is open: use the real-time `ReceiveNotification` event to prepend incoming items

---

### Notification Payload

The `ReceiveNotification` event and all REST responses return the same shape:

```typescript
interface NotificationDTO {
  id: number;
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  type: NotificationType;        // integer — see enum below
  isRead: boolean;
  relatedEntityType: string | null;  // e.g. "Appointment", "TreatmentPlan"
  relatedEntityId: number | null;    // ID to navigate to
  createdAt: string;                 // ISO 8601 UTC
}
```

Use `relatedEntityType` + `relatedEntityId` to deep-link the notification tap:

```typescript
function onNotificationTap(n: NotificationDTO) {
  if (n.relatedEntityType === 'Appointment' && n.relatedEntityId) {
    router.push(`/appointments/${n.relatedEntityId}`);
  } else if (n.relatedEntityType === 'TreatmentPlan' && n.relatedEntityId) {
    router.push(`/plans/${n.relatedEntityId}`);
  }
}
```

---

### NotificationType Enum

```typescript
enum NotificationType {
  AppointmentBooked         = 1,
  ProfileDataCompleted      = 2,
  AppointmentPaid           = 3,
  AppointmentCancelled      = 4,
  AppointmentRescheduled    = 5,
  ReviseAppointmentReady    = 6,
  PlanAppointmentReady      = 7,
  ReferralReminder2Days     = 8,
  ReferralReminder5Days     = 9,
  ReferralEscalated         = 10,
  ReferralCancelled         = 11,
  ProtocolModificationPending = 12,
  LowNPSAlert               = 13,
  NegativeSessionFeedback   = 14,
  LowBlueprintRating        = 15,
  NoticeableImprovement     = 16,
}
```

---

## 2. Anonymous Booking → Profile Completion Flow

### Overview

When a patient books an appointment from the website **without an account**, the system:

1. Creates the appointment and a temporary profile (`AppointmentProfile`) from the booking form data
2. Generates a **secure one-time token** (43-character URL-safe string, valid for **7 days**)
3. Sends an email to the patient's address containing:
   - Their appointment confirmation details
   - A **"Complete My Profile" button** linking to the website page
   - **App Store / Google Play** download links

The email link has this format:
```
https://thesportsdoctorlab.com/complete-appointment?token=<TOKEN>
```

Your job on the frontend is to:
- Build the `/complete-appointment` page
- Read the `token` from the URL query string
- Call the API to load and save the profile

---

### The Profile Completion Page

**Route:** `/complete-appointment?token=<TOKEN>`

**Page flow:**

```
Token in URL
    │
    ▼
GET /api/ProfileSetup?token=<TOKEN>
    │
    ├── 404  →  Show "Invalid link" error state
    ├── 400 (expired)  →  Show "Link expired" + contact us message
    └── 200  →  Render appointment summary + health form
                    │
                    ▼ (user submits form)
             PUT /api/ProfileSetup/complete?token=<TOKEN>
                    │
                    └── 200  →  Show success + app download banner
```

---

### API — GET Profile Data

```
GET /api/ProfileSetup?token=<TOKEN>
```

No authentication required. Public endpoint.

**Success response `200`:**

```typescript
interface ProfileSetupData {
  // Appointment info (read-only — display only)
  appointmentId: number;
  appointmentDate: string;        // e.g. "Monday, August 10 2026"
  appointmentTime: string;        // e.g. "09:30 AM"
  serviceName: string;

  // Patient basic info (read-only — collected during booking)
  patientName: string;
  email: string;
  phoneNumber: string;

  // Status flags
  isProfileComplete: boolean;     // true when gender + DOB are filled
  isLinkedToAccount: boolean;     // true when mobile account has been linked

  // Current health profile values — use to pre-fill the form
  genderId: number | null;
  dateOfBirth: string | null;     // "YYYY-MM-DD"
  medicalHistory: string | null;
  favoriteSport: string | null;
  address: string | null;
  emergencyPhoneNumber: string | null;
}
```

**Error responses:**

| Status | Body | Meaning |
|--------|------|---------|
| `400` | `{ "message": "Token is required." }` | Token query param missing |
| `404` | `{ "message": "Invalid link." }` | Token not found in DB |
| `400` | `{ "message": "This link has expired. Please contact us to get a new one." }` | Token older than 7 days |

**Example (fetch):**

```typescript
const res = await fetch(
  `https://portalapi.thesportsdoctorlab.com/api/ProfileSetup?token=${token}`
);

if (res.status === 404) { showError('Invalid link'); return; }
if (res.status === 400) { showError((await res.json()).message); return; }

const data: ProfileSetupData = await res.json();
```

---

### API — Submit Health Form

```
PUT /api/ProfileSetup/complete?token=<TOKEN>
Content-Type: application/json
```

No authentication required. Public endpoint.

**Request body:**

```typescript
interface CompleteProfileRequest {
  genderId: number;                 // required — see Gender lookup
  dateOfBirth: string;              // required — "YYYY-MM-DD"
  emergencyPhoneNumber?: string;
  medicalHistory?: string;
  favoriteSport?: string;
  address?: string;
}
```

**Success response `200`:**
```json
{ "message": "Profile completed successfully. See you at your appointment!" }
```

**Error responses:** same 400/404 as GET.

**Example (fetch):**

```typescript
const res = await fetch(
  `https://portalapi.thesportsdoctorlab.com/api/ProfileSetup/complete?token=${token}`,
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      genderId: selectedGender,
      dateOfBirth: dob,              // "1995-06-15"
      medicalHistory: history || undefined,
      favoriteSport: sport || undefined,
      address: address || undefined,
      emergencyPhoneNumber: emergencyPhone || undefined,
    }),
  }
);

if (res.ok) {
  // Show success screen + app download banner
} else {
  const err = await res.json();
  showError(err.message);
}
```

---

### Recommended Page UI

```
┌─────────────────────────────────────────┐
│  ✅ Appointment Confirmed                │
│                                         │
│  Name:    John Doe                      │
│  Service: Physiotherapy                 │
│  Date:    Monday, August 10 2026        │
│  Time:    09:30 AM                      │
│                                         │
├─────────────────────────────────────────┤
│  📋 Complete Your Health Profile        │
│                                         │
│  Gender         [ ▼ Male        ]       │
│  Date of Birth  [ 1995-06-15   ]        │
│  Medical History [ ____________ ]       │
│  Favorite Sport  [ ____________ ]       │
│  Address         [ ____________ ]       │
│  Emergency Phone [ ____________ ]       │
│                                         │
│  [    Save Profile    ]                 │
├─────────────────────────────────────────┤
│  📱 Download our app & register with    │
│  this email to track your appointment   │
│                                         │
│  [🍎 App Store]  [🤖 Google Play]       │
└─────────────────────────────────────────┘
```

**Notes:**
- If `isProfileComplete === true` on the GET response, pre-fill all fields and show a "Update Profile" heading instead of "Complete Profile"
- If `isLinkedToAccount === true`, show a banner: _"Your appointment is linked to your mobile account"_
- The token is single-use for editing but can be re-read (GET) as many times as needed within 7 days

---

### Mobile Account Linking

When a user **registers on the mobile app** using the **same email address** they used at booking, the system **automatically**:

1. Finds the `AppointmentProfile` by email
2. Sets `Appointment.PatientId` to the new user's ID
3. Sets `Appointment.IsAnonymousPatient = false`
4. Sets `AppointmentProfile.IsLinkedToAccount = true`

The next time the profile page is loaded via the token, `isLinkedToAccount` will be `true` — you can use this to show a success confirmation.

**No extra API call is needed from the frontend** — linking happens automatically on the mobile registration request.

---

## 3. Test Utilities

### SignalR Test Page

A ready-made browser UI for testing the notification system:

```
https://portalapi.thesportsdoctorlab.com/notification-test.html
```

**How to use:**
1. Log in via Swagger → copy the JWT token
2. Paste it in the **JWT Token** field (User ID is auto-parsed)
3. Click **Connect** — the dot turns green when SignalR is live
4. Click **Send to Me** — a test notification fires and appears in the live feed in real-time
5. Use the **Target User ID** field to send to a different user for cross-client testing

### Swagger

Full interactive API documentation:
```
https://portalapi.thesportsdoctorlab.com/swagger
```

Click **Authorize** → paste `Bearer <token>` to test protected endpoints.
