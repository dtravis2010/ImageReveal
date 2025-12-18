# Quick Deployment Guide

## Pre-Deployment Checklist

- [ ] Firebase project created
- [ ] Authentication enabled (Anonymous)
- [ ] Firestore database created
- [ ] Storage enabled
- [ ] Firebase Hosting enabled
- [ ] `.env.local` file configured with Firebase credentials
- [ ] Dependencies installed (`npm install`)
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Logged into Firebase (`firebase login`)

## Deploy Steps

### 1. Initialize Firebase (First Time Only)

```bash
firebase init
```

Select:
- Firestore: Yes
- Storage: Yes  
- Hosting: Yes
- Use existing project: [Your project]
- Firestore rules: `firestore.rules`
- Storage rules: `storage.rules`
- Public directory: `dist`
- Single-page app: Yes
- GitHub deploys: No

### 2. Deploy Security Rules

```bash
firebase deploy --only firestore:rules,storage:rules
```

### 3. Build the App

```bash
npm run build
```

### 4. Deploy to Hosting

```bash
firebase deploy --only hosting
```

Your app will be live at: `https://[your-project-id].web.app`

### 5. Deploy Everything at Once (Alternative)

```bash
npm run build && firebase deploy
```

## Post-Deployment

1. Open your app URL
2. Sign in as host (check "I'm the Host")
3. Upload a few test images
4. Test with 2+ browser windows/devices
5. Share the URL with party guests!

## Updating After Changes

```bash
npm run build
firebase deploy --only hosting
```

## Troubleshooting

**Build fails:**
- Check `npm install` completed
- Verify `.env.local` exists with correct values

**Deploy fails:**
- Run `firebase login` again
- Check you have owner/editor role on project
- Verify `firebase.json` exists

**Rules deployment fails:**
- Check `firestore.rules` and `storage.rules` exist
- Verify syntax with `firebase deploy --only firestore:rules --dry-run`

**App shows errors after deploy:**
- Check browser console for errors
- Verify Firebase config in `.env.local`
- Ensure all services are enabled in Firebase Console

## Emergency Rollback

```bash
firebase hosting:rollback
```

This reverts to the previous deployment.
