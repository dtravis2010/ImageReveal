# Image Guess Duel - Christmas Party Edition 🎄

A real-time head-to-head image guessing game perfect for parties! Two players compete to guess the image first, with live scoreboard tracking and instant winner detection.

## Features

- 🔐 **Quick Authentication** - Anonymous sign-in for instant party access
- 👥 **Smart Matchmaking** - Random player selection with fair rotation
- 🎯 **Real-time Gameplay** - First correct guess wins instantly
- 📊 **Live Scoreboard** - Track wins, plays, and fastest times
- 👑 **Host Controls** - Upload images, set answers, override results
- 🎨 **Party-Friendly UI** - Large text and buttons, perfect for TV display
- ⚡ **Instant Updates** - Firestore real-time synchronization

## Prerequisites

- Node.js (v16 or higher)
- A Firebase project with the following services enabled:
  - Firebase Authentication (Anonymous auth)
  - Cloud Firestore
  - Cloud Storage
  - Firebase Hosting

## Firebase Setup (Required Before Running)

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" and follow the wizard
3. Once created, click on the web icon (</>) to add a web app
4. Copy the Firebase configuration object

### 2. Enable Firebase Services

#### Enable Authentication:
1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Anonymous** authentication
3. Click **Save**

#### Enable Firestore:
1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** (we'll deploy rules later)
4. Select a region closest to your users
5. Click **Enable**

#### Enable Storage:
1. Go to **Storage**
2. Click **Get started**
3. Accept the default security rules
4. Click **Done**

#### Enable Hosting:
1. Go to **Hosting**
2. Click **Get started**
3. Follow the setup wizard (we'll configure this later)

### 3. Configure the App

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Firebase configuration values:
   ```
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. Get these values from Firebase Console:
   - Go to **Project Settings** (gear icon) > **General**
   - Scroll down to "Your apps"
   - Find your web app and copy the config values

## Local Development

### Install Dependencies

```bash
npm install
```

### Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Login to Firebase

```bash
firebase login
```

### Initialize Firebase in Project

```bash
firebase init
```

When prompted, select:
- **Firestore**: Yes
- **Storage**: Yes
- **Hosting**: Yes
- Use existing project: Select your project
- Firestore rules: `firestore.rules`
- Storage rules: `storage.rules`
- Public directory: `dist`
- Configure as single-page app: Yes
- Set up automatic builds and deploys: No
- Overwrite files: No (if asked)

### Deploy Security Rules

```bash
firebase deploy --only firestore:rules,storage:rules
```

### Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

This creates optimized files in the `dist/` directory.

## Deploying to Firebase Hosting

### Build and Deploy

```bash
npm run build
firebase deploy --only hosting
```

Your app will be live at: `https://your-project-id.web.app`

### Deploy Everything (Rules + Hosting)

```bash
npm run build
firebase deploy
```

## How to Use at Your Party

### Setup (Host)

1. **Open the app** on a laptop connected to a TV
2. **Sign in** and check "I'm the Host"
3. **Set your display name** (e.g., "Game Master")
4. Other players sign in on their phones/devices

### For Players

1. Open the app URL (displayed by host or use QR code)
2. Click "Quick Join"
3. Enter your display name
4. Mark yourself as "Available" in the lobby

### Running a Round (Host)

1. Click **"Start Match"** - two players are randomly selected
2. Click **"Upload New Image"** or choose from gallery
3. Enter the **correct answer** (case-insensitive)
4. Click **"Start Round"**

### Playing (Matched Players)

1. When your name appears, the round starts automatically
2. Type your guess in the input box
3. Hit Submit or press Enter
4. **First correct answer wins!**

### Watching

- Non-matched players see the image and live guesses
- Scoreboard updates in real-time when someone wins

### Host Override

- Host can manually award a win to either player
- Host can cancel a round if needed

## Game Rules

- ✅ Two players per round
- ✅ First correct guess (case-insensitive, trimmed) wins
- ✅ Winner gets +1 win, both get +1 play count
- ✅ Fastest time is tracked for each player
- ✅ Players return to "Available" after round ends

## Scoreboard

- View anytime by clicking **"Scoreboard"** in lobby
- Shows total wins, plays, win rate, and fastest time
- Host can export to CSV
- Host can clear scores for a fresh start

## Troubleshooting

### "Firebase initialization error"
- Check that `.env.local` exists and has correct values
- Verify Firebase config in console

### "Permission denied" errors
- Deploy Firestore and Storage rules: `firebase deploy --only firestore:rules,storage:rules`
- Make sure at least one user has `isHost: true` in Firestore

### Images not uploading
- Check Storage rules are deployed
- Verify Storage bucket exists in Firebase Console
- Check browser console for errors

### Real-time updates not working
- Verify Firestore is enabled
- Check network connection
- Look for errors in browser console

## Project Structure

```
/
├── components/
│   ├── LoginView.tsx        # Authentication and name entry
│   ├── LobbyView.tsx         # Player lobby with matchmaking
│   ├── HostPanel.tsx         # Host controls for round setup
│   ├── RoundView.tsx         # Active round gameplay
│   └── ScoreboardView.tsx    # Scoreboard display
├── firebaseService.ts        # Firebase SDK wrapper functions
├── gameTypes.ts              # TypeScript type definitions
├── App.tsx                   # Main app component
├── index.tsx                 # React entry point
├── firestore.rules           # Firestore security rules
├── storage.rules             # Storage security rules
├── firebase.json             # Firebase configuration
└── .env.example              # Environment variables template
```

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage, Hosting)
- **Build Tool**: Vite
- **Icons**: Font Awesome

## Security

- Firestore rules prevent unauthorized writes
- Only matched players can submit guesses
- Only host can create rounds and upload images
- Storage rules protect uploaded images

## Performance

- Real-time updates via Firestore snapshots
- Optimized for large displays (TV/projector)
- Responsive design for mobile and desktop

## License

MIT

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Firebase Console for errors
3. Check browser console for detailed error messages

---

**Enjoy your Christmas party! 🎄🎉**

