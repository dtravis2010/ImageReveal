# 🎄 Quick Start Guide for Your Christmas Party

## Before the Party (30 minutes setup)

### 1. Firebase Project Setup
- Go to https://console.firebase.google.com
- Create a new project (name it whatever you like)
- Enable these services:
  - ✅ Authentication → Sign-in method → Anonymous → Enable
  - ✅ Firestore Database → Create database → Production mode
  - ✅ Storage → Get started → Default rules
  - ✅ Hosting → Get started

### 2. Get Your Firebase Config
- Click the gear icon (Project Settings)
- Scroll to "Your apps" section
- Click the web icon (</>)
- Copy the config values shown

### 3. Configure the App
```bash
# Copy the environment template
cp .env.example .env.local

# Edit .env.local and paste your Firebase values
```

### 4. Deploy
```bash
# Install dependencies
npm install

# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (accept all defaults)
firebase init

# Deploy security rules
firebase deploy --only firestore:rules,storage:rules

# Build and deploy app
npm run build
firebase deploy --only hosting
```

Your app is now live at: `https://YOUR-PROJECT-ID.web.app`

## At the Party

### Setup (5 minutes)

1. **Host Setup**
   - Open the app on a laptop connected to TV
   - Click "Quick Join"
   - Enter your name, check "I'm the Host"
   - Click "Join the Party"

2. **Upload Images**
   - You'll see the lobby
   - Click "Start Match" (just to get to host panel)
   - Upload 10-20 images with simple answers:
     - Famous landmarks: "Eiffel Tower", "Statue of Liberty"
     - Movies: "Star Wars", "Harry Potter"  
     - Animals: "Elephant", "Giraffe"
     - Food: "Pizza", "Hamburger"
     - Christmas: "Santa Claus", "Reindeer"
   - Click "Cancel" when done uploading
   - Back in lobby, ready to play!

3. **Player Joining**
   - Display the app URL on TV (or show QR code)
   - Players open on their phones
   - Everyone clicks "Quick Join"
   - Enter their names
   - They'll automatically be "Available"

### Playing Rounds (2-3 minutes each)

1. **Host starts a match:**
   - Click "Start Match" → 2 players randomly selected
   - Pick an uploaded image (or upload new one)
   - Enter the answer (e.g., "Eiffel Tower")
   - Click "Start Round"

2. **Players compete:**
   - The 2 selected players see a text input
   - Everyone else watches on the TV
   - Players type guesses on their phones
   - **First correct answer wins!**
   - Confetti! 🎉

3. **Next round:**
   - Winner is announced
   - Everyone sees updated scoreboard
   - Players automatically return to "Available"
   - Host clicks "Start Match" again

### Between Games

- Click "Scoreboard" to see full rankings
- View wins, plays, win rate, fastest time
- Export results to CSV if you want to save them

## Pro Tips

### For Best Results
- **Keep answers simple** - One or two words work best
- **Use recognizable images** - Famous things everyone knows
- **Pre-upload images** - Upload 15-20 before party starts
- **Test first** - Do a practice round before real party

### Game Varieties
- **Speed rounds** - Give only 30 seconds
- **Categories** - All animals, all movies, etc.
- **Difficulty levels** - Easy/hard images
- **Team play** - Players can work in pairs

### Managing the Game
- **Override winner** - If two people shout at same time, host can manually award win
- **Cancel round** - If image doesn't load or wrong answer set
- **Clear scores** - Start fresh for new game
- **Reset players** - If someone leaves, they stay in lobby but inactive

## Troubleshooting at Party

### "Can't connect to Firebase"
- Check WiFi is working
- Verify .env.local has correct values
- Check Firebase services are enabled

### "Permission denied" on guesses
- Make sure security rules are deployed
- Check player is actually one of the 2 matched

### Players can't see their input
- Only the 2 matched players can type guesses
- Others are "watching" - this is correct

### Scoreboard not updating
- Refresh the page
- Check Firestore is enabled
- Look at browser console for errors

## Quick Commands Reference

```bash
# Local testing
npm run dev

# Deploy updates
npm run build
firebase deploy --only hosting

# View logs
firebase hosting:logs

# Roll back if issues
firebase hosting:rollback
```

## Party Flow Example

```
7:00 PM - Host sets up, uploads images
7:10 PM - Guests arrive, join on phones
7:15 PM - First round starts
7:18 PM - Winner! Scoreboard updates
7:20 PM - Round 2, 3, 4...
8:00 PM - View final scoreboard, export results
```

## Need Help?

Check these files:
- `README.md` - Full setup guide
- `DEPLOYMENT.md` - Deployment checklist  
- `IMPLEMENTATION_SUMMARY.md` - Technical details

Browser console (F12) shows detailed error messages.

---

**Have fun and Merry Christmas! 🎄🎉**
