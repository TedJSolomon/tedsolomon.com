# Meeting Cost Calculator — Product Requirements Document

## Product Overview

**Product Name:** Meeting Cost Calculator
**Tagline:** "See what your meetings really cost."
**Tech Stack:** React, Supabase (auth + database), hosted on Vercel
**Primary User:** Managers looking to optimize meeting culture
**Secondary Users:** Executives/Operations (org-wide visibility), ICs (awareness), viral/fun sharing

## Demo Environment

The app ships with a pre-loaded demo company: a **mid-sized B2B SaaS company (~150-200 employees)** with realistic org structure and salary data across these departments:

- Engineering
- Product
- Sales
- Marketing
- Customer Success
- Support
- HR
- Accounting

---

## RBAC Model

| Role | Sees Individual Salaries | Sees Salary Bands | Sees Total Cost | Sees Dept Aggregates |
|------|--------------------------|--------------------|-----------------|-----------------------|
| Admin | ✅ | ✅ | ✅ | ✅ |
| Manager | ❌ | ✅ | ✅ | ✅ (own dept) |
| Employee | ❌ | ❌ | ✅ | ❌ |
| Executive | ❌ | ✅ | ✅ | ✅ (all depts) |

---

## Epic 1: Authentication & Role-Based Access

### US-1.1: User Registration & Login
**As a** user, **I want to** sign up and log in securely **so that** my data is private and role-appropriate.

**Acceptance Criteria:**
- User can register with email/password via Supabase Auth
- User can log in and receive a session token
- User is assigned a default role (Employee) on registration
- Roles are stored in a Supabase `profiles` table linked to `auth.users`
- Unauthorized access to protected routes redirects to login

**Release Notes:**
- Secure authentication powered by Supabase Auth
- Email/password registration and login
- Session persistence across browser refreshes

### US-1.2: Role-Based Access Control
**As an** admin, **I want to** assign roles to users **so that** sensitive salary data is only visible to authorized people.

**Acceptance Criteria:**
- Admin can change any user's role (Admin, Manager, Employee, Executive)
- Manager role users cannot see individual salaries — only salary bands (e.g., "$90k–$110k")
- Employee role users see only total meeting cost — no salary breakdowns
- Executive role users see salary bands and all department-level aggregates
- Admin role users see exact individual salaries
- Role changes take effect immediately without requiring re-login
- UI elements (columns, charts, filters) conditionally render based on role

**Release Notes:**
- Four-tier permission system: Admin, Executive, Manager, Employee
- Salary data visibility adapts to your role automatically
- Simulated payroll integration with role-appropriate data masking

---

## Epic 2: Employee & Payroll Management (Simulated)

### US-2.1: Simulated Payroll Data
**As a** user, **I want** the app to come pre-loaded with realistic company data **so that** I can explore features immediately without setup.

**Acceptance Criteria:**
- Demo company has 150–200 employees across 8 departments
- Each employee has: name, role/title, department, salary, and email
- Salary ranges are realistic for a B2B SaaS company (e.g., Senior Engineer $140k–$180k, SDR $55k–$70k)
- Department heads and managers are identifiable in the data
- Seed script populates Supabase on first deploy or via a CLI command

**Release Notes:**
- Pre-loaded demo company: a mid-sized B2B SaaS org with 8 departments
- Realistic employee data for immediate exploration
- One-click database seeding

### US-2.2: Employee Directory
**As a** manager, **I want to** browse employees by department **so that** I can quickly add them to meeting calculations.

**Acceptance Criteria:**
- Searchable, filterable employee list
- Filter by department
- Search by name or title
- Salary info visibility respects RBAC (exact salary, band, or hidden)
- Employees can be selected individually or in bulk for meeting creation

**Release Notes:**
- Searchable employee directory with department filtering
- Quick-select employees for meeting calculations

---

## Epic 3: Meeting Cost Calculator (Core Feature)

### US-3.1: Create a Meeting Calculation
**As a** manager, **I want to** create a meeting with specific attendees **so that** I can calculate its true cost.

**Acceptance Criteria:**
- User can create a meeting with: title, attendees (selected from directory), scheduled duration, and meeting type
- Meeting types: one-time, recurring (daily, weekly, biweekly, monthly)
- For recurring meetings, system calculates annualized cost automatically
- Attendees can be added/removed after creation
- Meeting is saved to the user's history

**Release Notes:**
- Create meeting cost calculations with real attendee data
- Support for one-time and recurring meetings
- Automatic annualized cost projection for recurring meetings

### US-3.2: Live Meeting Cost Ticker
**As a** user running a live meeting, **I want** a real-time ticking dollar counter **so that** the cost of the meeting is viscerally visible.

**Acceptance Criteria:**
- "Start Meeting" button begins a live cost ticker
- Cost increments smoothly every second based on (total salary per hour / 3600) × elapsed seconds
- Display shows: elapsed time, current cost (ticking), cost per minute, and attendee count
- "Pause" button stops the ticker (for breaks)
- "End Meeting" button stops the ticker and saves the final cost
- If meeting ends before scheduled duration, calculate and display "money saved"
- If meeting runs over scheduled duration, calculate and display "money over budget"
- Ticker is visually prominent — large font, animated counter

**Release Notes:**
- Live meeting cost ticker with per-second updates
- Start, pause, and end meeting controls
- Automatic "money saved" / "over budget" calculations

### US-3.3: Past Meeting Cost Calculator
**As a** manager, **I want to** calculate the cost of a meeting that already happened **so that** I can audit past meeting spend.

**Acceptance Criteria:**
- User can input: attendees, actual duration, and date
- System calculates total cost and cost per minute
- Result is saved to meeting history
- User can edit the duration or attendees after saving

**Release Notes:**
- Retroactively calculate the cost of past meetings
- Editable after saving for corrections

### US-3.4: Future/Hypothetical Meeting Calculator
**As a** manager, **I want to** estimate the cost of a proposed meeting **so that** I can decide if it's worth scheduling.

**Acceptance Criteria:**
- User can input: proposed attendees and proposed duration
- System displays projected cost
- For recurring proposed meetings, shows projected annual cost
- User can toggle attendees in/out to see cost impact in real time
- "Do you really need this meeting?" suggestion appears if cost exceeds a configurable threshold

**Release Notes:**
- Project costs for proposed meetings before scheduling
- Toggle attendees to see real-time cost impact
- Smart threshold warnings for expensive meetings

### US-3.5: Recurring Meeting Optimization Tips
**As a** manager, **I want** smart suggestions for saving money on recurring meetings **so that** I can optimize without canceling them entirely.

**Acceptance Criteria:**
- For any recurring meeting, system calculates savings from:
  - Reducing duration by 5, 10, or 15 minutes
  - Reducing frequency (e.g., weekly → biweekly)
  - Removing specific attendees (shows cost of each attendee)
- Tips are displayed in a card/panel below the meeting detail
- Example format: "Cutting this weekly standup from 30 to 25 minutes saves $4,320/year"
- Tips update dynamically when attendees or duration change

**Release Notes:**
- Automated cost-saving recommendations for every recurring meeting
- See exactly how much you'd save by trimming time, reducing frequency, or slimming the invite list

---

## Epic 4: Tone Toggle (Boardroom vs. Roast Mode)

### US-4.1: Tone Setting
**As a** user, **I want to** toggle between a professional tone and a humorous tone **so that** I can use the tool in formal settings or share it for fun.

**Acceptance Criteria:**
- Toggle in user settings: "Boardroom Mode" (default) and "Roast Mode"
- Setting persists across sessions (stored in Supabase user profile)
- Toggle is accessible from a settings icon in the top nav

**Boardroom Mode examples:**
- "Total meeting cost: $1,247.00"
- "This meeting exceeded the scheduled duration by 12 minutes, adding $312 in unplanned cost."
- Tip: "Reducing this meeting by 5 minutes would save $3,120 annually."

**Roast Mode examples:**
- "Congratulations, you just mass-burned $1,247 in 60 minutes. 🔥"
- "This meeting ran 12 minutes over. That's $312 of pure overtime pain."
- Tip: "Shave 5 min off this meeting and buy the team 156 coffees a year instead. ☕"
- Comparison: "This meeting cost more than a MacBook Air."
- Receipt footer: "No refunds."

**Release Notes:**
- Two tone modes: Boardroom (professional) and Roast Mode (fun comparisons and humor)
- Persistent setting per user account
- All copy, tips, and receipts adapt to selected tone

---

## Epic 5: Dashboard & Analytics

### US-5.1: Personal Meeting Dashboard
**As a** manager, **I want** a dashboard showing my meeting cost history **so that** I can track spending trends.

**Acceptance Criteria:**
- Dashboard shows: total meeting cost this week/month/quarter, number of meetings tracked, average cost per meeting, most expensive meeting
- Line chart of meeting spend over time (weekly or monthly granularity)
- List of recent meetings with cost, duration, and attendee count
- Filter by date range

**Release Notes:**
- Personal meeting cost dashboard with trend charts
- Weekly/monthly/quarterly cost summaries
- Filterable meeting history

### US-5.2: Employee Meeting Cost View
**As a** manager, **I want to** see what percentage of an employee's salary is spent in meetings **so that** I can identify over-meeting'd team members.

**Acceptance Criteria:**
- For each employee the user has access to, show: total meeting hours this month, estimated meeting cost this month, percentage of salary spent in meetings
- Sortable table: sort by % of salary, total hours, or total cost
- Visual indicator (color coding) when an employee exceeds a threshold (e.g., >30% of salary in meetings)
- Respects RBAC: Manager sees own team, Executive sees all, Employee sees only self

**Release Notes:**
- See what % of each employee's compensation goes to meetings
- Color-coded warnings for over-meeting'd employees
- Role-appropriate visibility

### US-5.3: Department & Org-Level Analytics (Executive/Ops View)
**As an** executive or operations lead, **I want** org-wide meeting cost analytics **so that** I can identify systemic meeting culture issues.

**Acceptance Criteria:**
- Aggregate view: total meeting spend by department (bar chart)
- Department comparison: avg meeting cost, avg meetings per employee, % of payroll in meetings
- Top 10 most expensive recurring meetings across the org
- Trend line: org-wide meeting spend over time
- Only visible to Executive and Admin roles
- Filterable by department and date range

**Release Notes:**
- Organization-wide meeting cost analytics for executives and operations
- Department-by-department spend comparison
- Identify the most expensive recurring meetings across the company

---

## Epic 6: Meeting Receipt (Shareable)

### US-6.1: Generate Meeting Receipt
**As a** user, **I want** a shareable "meeting receipt" after a meeting ends **so that** I can share it with my team or post it in Slack.

**Acceptance Criteria:**
- Auto-generated after a live meeting ends or when viewing a past meeting
- Receipt includes: meeting title, date, attendee count, duration (scheduled vs. actual), total cost, cost per minute, cost per attendee, and money saved/over budget
- In Roast Mode, receipt includes a cheeky comparison (e.g., "This meeting cost more than 3 months of Netflix") and a fun footer ("No refunds")
- In Boardroom Mode, receipt is clean and professional
- "Copy to clipboard" button (formatted for Slack/chat paste)
- "Download as image" button (PNG, nicely formatted card)
- Receipt is styled as a visual card — designed to look good in a screenshot

**Release Notes:**
- Shareable meeting receipt with full cost breakdown
- One-click copy for Slack or download as image
- Tone-adaptive: professional or humorous depending on your setting

---

## Epic 7: Responsive Design

### US-7.1: Mobile-Responsive Layout
**As a** user, **I want to** use the app on my phone during a meeting **so that** I can start the live ticker from any device.

**Acceptance Criteria:**
- All views render correctly on mobile (375px+), tablet (768px+), and desktop (1024px+)
- Live ticker view is optimized for mobile: large counter, minimal controls
- Navigation collapses to hamburger menu on mobile
- Tables become scrollable or stack on small screens
- Charts resize appropriately
- Touch-friendly tap targets (min 44px)

**Release Notes:**
- Fully responsive design — use on phone, tablet, or desktop
- Mobile-optimized live ticker for in-meeting use

---

## Data Model (Supabase)

### Tables

**profiles**
- id (FK to auth.users)
- full_name
- role (enum: admin, executive, manager, employee)
- tone_preference (enum: boardroom, roast)
- created_at

**departments**
- id
- name
- created_at

**employees**
- id
- full_name
- email
- title
- department_id (FK)
- annual_salary
- created_at

**meetings**
- id
- title
- created_by (FK to profiles)
- meeting_type (enum: one_time, daily, weekly, biweekly, monthly)
- scheduled_duration_minutes
- actual_duration_minutes (nullable)
- status (enum: planned, live, completed)
- started_at (nullable)
- ended_at (nullable)
- created_at

**meeting_attendees**
- id
- meeting_id (FK)
- employee_id (FK)

---

## Release Plan

### MVP (Release 1)
- Auth + RBAC (Epic 1)
- Simulated payroll + employee directory (Epic 2)
- Core meeting calculator: create, live ticker, past, future (Epic 3: US-3.1–3.4)
- Responsive layout (Epic 7)

### Release 2
- Recurring meeting optimization tips (US-3.5)
- Tone toggle (Epic 4)
- Meeting receipt (Epic 6)

### Release 3
- Personal dashboard (US-5.1)
- Employee meeting cost % view (US-5.2)
- Org-level analytics (US-5.3)
