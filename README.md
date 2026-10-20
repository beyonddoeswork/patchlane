# Patchlane.

> **Modern, zero-friction client feedback and bug triage platform for web agencies.**  
> Turn vague client messages into structured tickets with auto-captured device diagnostics, automated developer onboarding, and a clear distinction between warranty defects and billable scope creep[cite: 5].

---

## Key Features

- **Zero-Friction Client Portals (`/report/[projectSlug]`)**: Clients submit bugs with zero logins, browser extensions, or account setup[cite: 5].
- **Automated Silent Diagnostics**: Auto-detects device type, OS, display resolution, window viewport dimensions, and user-agent details directly on submission[cite: 5].
- **Scope Creep vs. Warranty Protection**: Toggle items between **Defect (Warranty)** and **Scope Expansion (Billable)** to maintain clear delivery audit trails[cite: 1, 5].
- **One-Click Acceptance Reports**: Export an entire project's QA log as a formatted Markdown audit report to attach to milestone sign-offs[cite: 1, 5].
- **Automated Team Provisioning & SMTP Notifications**:
  - Auto-provisions developer accounts via Firebase Admin SDK with temporary passwords[cite: 4].
  - Dispatches branded email invitations with project credentials via Google SMTP[cite: 4].
  - Sends removal emails with custom manager-specified reasons[cite: 4].
  - Dispatches automated receipt confirmation emails to clients who include their email[cite: 4].
- **Privacy-Compliant Lifecycle Management**: When a developer is removed from a project and has no remaining seats across any other project, their credentials are automatically purged from Firebase Auth[cite: 4].
- **Super Admin Website Operations (`/admin`)**: Restrict platform-wide agency provisioning and workspace audits to designated super-admin email addresses.

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Styling**: Tailwind CSS, Lucide React icons
- **Animations**: Framer Motion
- **Database**: MongoDB Atlas
- **Authentication & User Management**: Firebase Auth (Client) & Firebase Admin SDK (Server)
- **Transactional Email**: Nodemailer via Google SMTP (Gmail App Passwords)

---

## Project Structure

```text
├── public/
│   └── favicon.ico                   # Patchlane. brand favicon
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── page.tsx              # Super Admin Operations (restricted access)
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   └── companies/
│   │   │   │       └── route.ts      # Super Admin agency management & team provisioning
│   │   ├── projects/
│   │   │   │   └── route.ts          # Multi-project CRUD operations
│   │   │   └── reports/
│   │   │       └── route.ts          # Bug report creation, status updates & scope classification
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Agency Console (project switcher, team roster, triage board)
│   │   ├── login/
│   │   │   └── page.tsx              # Firebase client login portal
│   │   ├── privacy/
│   │   │   └── page.tsx              # GDPR/legal privacy policy
│   │   ├── report/
│   │   │   └── [projectSlug]/
│   │   │       └── page.tsx          # Public client feedback intake form
│   │   ├── terms/
│   │   │   └── page.tsx              # Terms of Service
│   │   ├── layout.tsx                # App root layout, Inter font & global metadata
│   │   └── page.tsx                  # Marketing landing page & UI showcase
│   ├── context/
│   │   └── AuthContext.tsx           # Firebase client authentication provider
│   └── lib/
│       ├── firebase.ts               # Frontend Firebase client initialization
│       ├── firebaseAdmin.ts          # Backend Firebase Admin SDK initialization
│       ├── mail.ts                   # Nodemailer transporter & transactional email templates
│       └── mongodb.ts                # MongoDB Atlas native connection pool
├── .env.local                        # Local secrets and configuration
├── package.json
└── README.md
```

---

## Environment Variables Configuration

Create a `.env.local` file in the root directory:

```env
# 1. MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=Patchlane

# 2. Firebase Client SDK (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000000
NEXT_PUBLIC_FIREBASE_APP_ID=1:000000000000:web:xxxxxxxxxxxx

# 3. Firebase Admin SDK (Backend Server Operations)
FIREBASE_PROJECT_ID=your-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# 4. Google SMTP Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcdefghijklmnop     # 16-character Google App Password (no spaces)
SMTP_FROM="Patchlane <your-email@gmail.com>"

# 5. Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 6. Access Control: Super Admin Emails (comma-separated)
NEXT_PUBLIC_SUPER_ADMIN_EMAILS=your-email@gmail.com
```

---

## How It Works

### 1. Workspace & Project Setup
1. An agency manager logs into the **Agency Console** (`/dashboard`)[cite: 1].
2. Click **"New Project"**, choose a display name (e.g. `Nike Store`), and assign a clean slug (`nike-store`)[cite: 1, 5].
3. The platform generates an isolated client intake URL: `/report/nike-store`[cite: 1, 5].

### 2. Client Reporting Flow
1. The agency shares the project URL with the client[cite: 1].
2. The client opens the link without needing any login or account[cite: 5].
3. The form automatically logs the client's screen resolution, viewport dimensions, language, and operating system in the background[cite: 1, 5].
4. If the client enters an email address, **Patchlane** automatically triggers a confirmation email informing them the developers have received the ticket.

### 3. Developer Assignment & Automated Account Provisioning
1. The project owner clicks **"Add Developer"** on the dashboard[cite: 1].
2. Enter the developer's email address and assign a role (`developer` or `agency_admin`)[cite: 1].
3. The system checks Firebase Auth[cite: 4]:
   - **New User**: Generates a secure temporary password (`Pch_xxxx`), provisions the user in Firebase Auth, assigns them to the project in MongoDB, and dispatches an invitation email with login credentials[cite: 1, 4].
   - **Existing User**: Adds them to the project workspace and emails them an alert that they have been added to a new project[cite: 1, 4].

### 4. Triage & Scope Creep Protection
1. Inside `/dashboard`, developers view all incoming tickets sorted by submission time[cite: 1].
2. **Status Toggle**: Update tickets across `Open`, `In Progress`, and `Fixed`[cite: 1].
3. **Classification**: Toggle between **Defect (Warranty)** and **Scope Expansion (Billable)**[cite: 1].
4. At project conclusion, click **"Export Report"** to generate a clean Markdown audit summary of all closed and billable items[cite: 1].

### 5. Developer Removal & Credential Erasure
1. Project managers click **"Manage Team"** and select **"Remove"** next to any assigned developer.
2. The manager provides a specific removal reason (e.g., *"Milestone completed; developer reallocated"*).
3. The developer receives an automated email with the notice and reason.
4. If the developer is not assigned to any other project across the agency, their Firebase Auth credentials are deleted automatically to comply with data privacy policies[cite: 4].

---

## Getting Started Locally

1. **Clone the repository**:
   ```bash
   git clone [https://github.com/your-username/patchlane.git](https://github.com/your-username/patchlane.git)
   cd patchlane
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Set up your `.env.local` file with your database, Firebase Admin, and Google SMTP keys.

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Legal & Compliance

- **Terms of Service**: Available at `/terms`
- **Privacy Policy**: Available at `/privacy`