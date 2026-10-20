# Patchlane

A client-feedback and bug-reproduction tool built for web agencies.

## Features
- **Zero-Friction Client Links**: Clients submit structured bug reports without account creation.
- **Auto Diagnostics**: Automatically captures browser user-agent, viewport, and screen dimensions.
- **Scope Creep vs Defect Triage**: 1-click classification of reported items as warranty bug or billable scope expansion.
- **Agency Auth**: Firebase authentication for agencies to manage project queues.
- **Real-Time Synchronisation**: Powered by Firebase Firestore and Storage.
- **Desktop Ready**: Can be exported or wrapped with Tauri / Electron for Windows without code redesign.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Enable:
   - **Authentication** (Email/Password provider)
   - **Cloud Firestore Database** (start in Test mode or add security rules)
   - **Cloud Storage** (for screenshots)
3. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
4. Fill in your Firebase config keys in `.env.local`.

### 3. Run Development Server
```bash
npm run dev
```

Visit:
- Landing Page: `http://localhost:3000`
- Agency Dashboard: `http://localhost:3000/dashboard`
- Agency Login/Register: `http://localhost:3000/login`
- Client Feedback Form: `http://localhost:3000/report/project-alpha`

### 4. Firestore Security Rules (Recommended Starter)
```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can submit reports via client link
    match /projects/{projectId}/reports/{reportId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```
