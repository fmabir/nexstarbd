# nextstarBD — Setup Guide

## Prerequisites
- Node.js 18+
- npm
- Firebase account (free tier works)

---

## Step 1: Firebase Project Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it `nextstarbd`
3. Enable **Authentication**:
   - Authentication → Sign-in method → Email/Password → Enable
   - Authentication → Users → Add user → enter your admin email + password
4. Enable **Firestore Database**:
   - Firestore → Create database → **Production mode** → choose region (e.g., `asia-south1` for Bangladesh)
5. Enable **Storage**:
   - Storage → Get started → Production mode
6. Enable **Hosting** (optional for deployment):
   - Hosting → Get started
7. Get Admin SDK credentials:
   - Project Settings (gear icon) → Service accounts → **Generate new private key**
   - Download the JSON file — you'll need values from it
8. Get client config:
   - Project Settings → General → Your apps → Add web app
   - Copy the `firebaseConfig` values

---

## Step 2: Configure Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# From Firebase Console → Project Settings → Your web app
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nextstarbd.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nextstarbd
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nextstarbd.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc123

# Your community links (update when ready)
NEXT_PUBLIC_DISCORD_URL=https://discord.gg/yourserver
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/groups/yourgroup
NEXT_PUBLIC_WHATSAPP_URL=https://chat.whatsapp.com/yourlink

# From the downloaded service account JSON file
FIREBASE_PROJECT_ID=nextstarbd
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@nextstarbd.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBg...\n-----END PRIVATE KEY-----\n"
```

> **Important**: The `FIREBASE_PRIVATE_KEY` must be wrapped in double quotes and have `\n` for newlines.

---

## Step 3: Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Step 4: Admin Login

Visit [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

Use the email and password you created in Firebase Authentication → Users.

---

## Step 5: Create Your First Tournament

1. Log in to the admin panel
2. Go to **Tournaments** → fill in the form
3. Set mode, prize pool, start date, registration deadline
4. Click **Create Tournament** — it appears on the home page immediately

---

## Step 6: Deploy to Firebase Hosting

Install Firebase CLI (if not already):

```bash
npm install -g firebase-tools
firebase login
```

Deploy:

```bash
firebase deploy
```

This will:
- Build the Next.js app
- Deploy to Firebase Hosting (with Next.js server support)
- Deploy Firestore rules and indexes
- Deploy Storage rules

Your site will be live at `https://nextstarbd.web.app`

---

## Project Structure

```
src/
├── app/                    # All pages and API routes
│   ├── page.tsx            # Home page
│   ├── tournaments/[id]/   # Tournament dashboard
│   ├── register/[id]/      # Squad registration
│   ├── rules/              # Rules page
│   ├── hall-of-fame/       # Previous winners
│   ├── admin/              # Admin panel (protected)
│   └── api/                # API routes
├── components/             # All UI components
├── lib/
│   ├── firebase/           # Firebase client + admin SDK
│   ├── hooks/              # Real-time data hooks
│   ├── types/              # TypeScript types
│   └── utils/              # Helpers
├── context/                # Auth + Toast providers
├── i18n/                   # Language config
└── proxy.ts                # Admin route protection
messages/
├── en.json                 # English translations
└── bn.json                 # Bangla translations
```

---

## Language Toggle

Click the flag button in the navbar to switch between **English** and **Bangla**. The preference is saved in a cookie.

---

## Firestore Collections

| Collection | Purpose |
|---|---|
| `tournaments` | Tournament details, slot counts, UIDs |
| `registrations` | Squad registrations + waitlist |
| `announcements` | Real-time admin announcements |
| `winners` | Hall of Fame entries |
| `mvpPlayers` | MVP showcase entries |
| `sponsors` | Sponsor logos and links |
