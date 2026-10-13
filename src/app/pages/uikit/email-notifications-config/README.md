# Recurring Notification Triggers Module

This module provides the complete frontend implementation for managing **Recurring Notification Triggers** within the Medical Dashboard application. It enables administrators and clinical leaders to schedule, configure, and automate notification campaigns for staff roles, patients, and specific individual users.

---

## 📁 Directory Structure

```text
email-notifications-config/
├── components/
│   ├── audience-selector/        # Target staff roles, patients toggle & specific user selector
│   ├── recurrence-picker/        # Frequency, interval, day picker, time & end-condition controls
│   ├── trigger-form/             # Create/Edit trigger form container & payload validation
│   └── trigger-list/             # Table display, status toggle, empty state & action handlers
├── models/
│   ├── notification-trigger.model.ts  # DTO definitions, enums & interfaces
│   └── recurrence.util.ts             # Recurrence description generators & execution calculators
├── services/
│   └── notification-trigger.service.ts # HTTP API integration & Signal-based state management
├── notification-triggers-page.component.ts   # Main page orchestrator
├── notification-triggers-page.component.html # Page layout & view switching
├── notification-triggers-page.component.scss # Page styles
├── Notification_Cycle_FrontEnd_Guide.md      # API & Frontend Integration Specification
├── README_TEST_CASES.md                     # Comprehensive Test Cases for All 21 Notification Types
└── README.md                                  # Module Documentation & User Guide

```

---

## 🛠️ Architecture & Technical Stack

- **Framework**: Angular v20+ (Standalone components, Signal-based state management, Native Control Flow `@if`/`@for`).
- **UI Components**: PrimeNG (`p-table`, `p-card`, `p-multiSelect`, `p-dropdown`, `p-datepicker`, `p-inputSwitch`, `p-tag`, `p-button`).
- **HTTP & State**: `HttpClient` with RxJS & Angular `signal`, `computed`, `toSignal`.
- **Change Detection**: `ChangeDetectionStrategy.OnPush` across all components for optimal performance.

---

## 🔌 API Endpoints & DTO Specifications

The service connects directly to the REST API (`/api/NotificationTriggers`):

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/NotificationTriggers` | `GET` | Fetch list of triggers (`NotificationTriggerListItem[]`) |
| `/api/NotificationTriggers/{id}` | `GET` | Fetch trigger detailed payload (`NotificationTriggerDetail`) |
| `/api/NotificationTriggers` | `POST` | Create new trigger (`NotificationTriggerPayload`) |
| `/api/NotificationTriggers/{id}` | `PUT` | Update existing trigger (`NotificationTriggerPayload`) |
| `/api/NotificationTriggers/{id}/toggle` | `PATCH` | Optimistic toggle active status |
| `/api/NotificationTriggers/{id}` | `DELETE` | Optimistic delete trigger |
| `/api/NotificationTriggers/types` | `GET` | Fetch notification category types dropdown options |
| `/api/NotificationTriggers/audience-options` | `GET` | Fetch target staff roles options |
| `/api/NotificationTriggers/users` | `GET` | Fetch searchable recipient users |

---

## 📖 Step-by-Step User Guide: How to Add New Data

### Step 1: Open the Creation Form
1. Navigate to the **Recurring Notifications** page.
2. Click the **`+ New trigger`** button in the header.
3. The page switches from the list view to the form creation layout.

---

### Step 2: Message & Category Configuration
Fill in the basic campaign information:

- **Title** *(Required)*: A clear internal title for the campaign (up to 200 characters).
- **Message** *(Required)*: The text that recipients will receive in their notification feed (up to 1,000 characters).
- **Notification Category Type** *(Required)*: Select the operational category from the dropdown menu (e.g., *Session Booking*, *Measurement Results*, *Report Released*, etc.).

---

### Step 3: Schedule Rule Configuration
Set up when and how often the notification will be dispatched:

1. **Repeats (Frequency)**: Select **Daily**, **Weekly**, or **Monthly**.
2. **Every (Interval)**: Enter the repeat interval (e.g., `1` for every week, `2` for every two weeks).
3. **On Days / On Day**:
   - **Weekly**: Select the target days of the week (e.g., *Mon*, *Wed*, *Fri*).
   - **Monthly**: Select the day of the month (1–31, e.g., `1` for the 1st of every month).
4. **At (Time of Day)**: Choose execution time in 24-hour format (e.g., `08:00`).
5. **Starting**: Select the campaign start date.
6. **Ends Condition**: Select **Never**, **On date**, or **After X sends**.

---

### Step 4: Target Audience Selection
Select who will receive the notification. You must select **at least one** target criteria:

- **Target Staff Roles**: Select staff roles (e.g., *Doctor*, *Coach Manager*).
- **Include All Patients**: Toggle **ON** if the message should be broadcast to all active patient accounts.
- **Specific Individual Recipients**: Search and select specific individual users.
- **Audience Summary**: Review the live audience summary badge at the bottom of the section.

---

### Step 5: Save & Activate
1. Ensure the **Trigger is active** switch is turned ON.
2. Click **`Save Trigger`**. The application validates fields and submits to the backend API.

---

## 💡 Practical Real-World Examples

### 🟢 Example 1: Weekly Staff Performance Digest
> **Scenario**: Send a weekly reminder to all **Coaches** every **Monday at 08:00 AM**.

| Field | Value |
| :--- | :--- |
| **Title** | `Weekly Coach Progress Digest` |
| **Message** | `Good morning! Please review your weekly athlete performance logs and updated rehabilitation plans.` |
| **Category Type** | `Stage Transition` (or General Digest) |
| **Repeats** | `Weekly` |
| **Every** | `1` week |
| **On days** | `Mon` |
| **At** | `08:00` |
| **Start Date** | Today's date |
| **Ends** | `Never` |
| **Target Staff Roles** | `Coach` |
| **Include All Patients**| `OFF` |
| **Status** | `Active` |

---

### 🟢 Example 2: Monthly Patient Health Check-in
> **Scenario**: Send a monthly reminder to **All Patients** on the **1st day of every month at 09:00 AM**.

| Field | Value |
| :--- | :--- |
| **Title** | `Monthly Patient Self-Assessment Check-in` |
| **Message** | `Reminder: Please submit your monthly self-assessment measurements in your patient portal.` |
| **Category Type** | `Measurement Results` |
| **Repeats** | `Monthly` |
| **Every** | `1` month |
| **On day** | `1` |
| **At** | `09:00` |
| **Start Date** | 1st of next month |
| **Ends** | `Never` |
| **Include All Patients**| `ON` |
| **Status** | `Active` |

---

### 🟢 Example 3: Daily Doctor Morning Briefing (30-Day Campaign)
> **Scenario**: Send a daily briefing every morning at **07:30 AM** for 30 days to **Doctors** and a specific Lead Supervisor.

| Field | Value |
| :--- | :--- |
| **Title** | `Daily Consultation Schedule Briefing` |
| **Message** | `Your daily consultation schedule and new medical reports are now available.` |
| **Category Type** | `Report Released` |
| **Repeats** | `Daily` |
| **Every** | `1` day |
| **At** | `07:30` |
| **Start Date** | Tomorrow's date |
| **Ends** | `After 30 sends` |
| **Target Staff Roles** | `Doctor` |
| **Specific Recipients** | `Dr. Sarah Miller` |
| **Include All Patients**| `OFF` |
| **Status** | `Active` |

---

## 📄 License & Maintenance
Maintained as part of the Medical Dashboard UI Kit architecture.
