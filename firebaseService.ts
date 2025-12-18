import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithEmailLink,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  Auth,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  limit,
  Firestore,
  Unsubscribe,
  addDoc,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL,
  Storage 
} from 'firebase/storage';
import { User, Round, Guess, Scoreboard, GameSettings, UploadedImage, PlayerScore } from './gameTypes';

// Firebase configuration - REPLACE WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(
    'Firebase configuration is missing. Please create a .env.local file with your Firebase credentials. ' +
    'See .env.example for the required variables.'
  );
}

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: Storage;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.error("Firebase Initialization Error:", error);
}

// Auth Functions
export const signInAnonymouslyUser = async (): Promise<FirebaseUser | null> => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error("Anonymous sign-in error:", error);
    return null;
  }
};

export const sendEmailSignInLink = async (email: string): Promise<boolean> => {
  try {
    const actionCodeSettings = {
      url: window.location.href,
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
    return true;
  } catch (error) {
    console.error("Email link send error:", error);
    return false;
  }
};

export const completeEmailSignIn = async (): Promise<FirebaseUser | null> => {
  try {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }
      if (!email) return null;
      
      const result = await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem('emailForSignIn');
      return result.user;
    }
    return null;
  } catch (error) {
    console.error("Email sign-in completion error:", error);
    return null;
  }
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void): Unsubscribe => {
  return auth.onAuthStateChanged(callback);
};

// User Functions
export const createOrUpdateUser = async (userId: string, userData: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      id: userId,
      createdAt: userData.createdAt || Date.now()
    }, { merge: true });
  } catch (error) {
    console.error("Error creating/updating user:", error);
    throw error;
  }
};

export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() as User : null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
};

export const updateUserStatus = async (userId: string, status: 'available' | 'in_match'): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { status });
  } catch (error) {
    console.error("Error updating user status:", error);
  }
};

export const subscribeToUsers = (callback: (users: User[]) => void): Unsubscribe => {
  const usersRef = collection(db, 'users');
  return onSnapshot(usersRef, (snapshot) => {
    const users = snapshot.docs.map(doc => doc.data() as User);
    callback(users);
  });
};

// Round Functions
export const createRound = async (roundData: Omit<Round, 'id'>): Promise<string> => {
  try {
    const roundsRef = collection(db, 'rounds');
    const docRef = await addDoc(roundsRef, roundData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating round:", error);
    throw error;
  }
};

export const updateRound = async (roundId: string, updates: Partial<Round>): Promise<void> => {
  try {
    const roundRef = doc(db, 'rounds', roundId);
    await updateDoc(roundRef, updates);
  } catch (error) {
    console.error("Error updating round:", error);
    throw error;
  }
};

export const getRound = async (roundId: string): Promise<Round | null> => {
  try {
    const roundRef = doc(db, 'rounds', roundId);
    const roundSnap = await getDoc(roundRef);
    return roundSnap.exists() ? { ...roundSnap.data(), id: roundSnap.id } as Round : null;
  } catch (error) {
    console.error("Error getting round:", error);
    return null;
  }
};

export const subscribeToActiveRound = (callback: (round: Round | null) => void): Unsubscribe => {
  const roundsRef = collection(db, 'rounds');
  const q = query(roundsRef, where('status', 'in', ['pending', 'active']), orderBy('startedAt', 'desc'), limit(1));
  return onSnapshot(q, (snapshot) => {
    const round = snapshot.docs.length > 0 ? { ...snapshot.docs[0].data(), id: snapshot.docs[0].id } as Round : null;
    callback(round);
  });
};

// Guess Functions
export const submitGuess = async (roundId: string, playerId: string, playerName: string, text: string): Promise<string> => {
  try {
    const guessesRef = collection(db, 'rounds', roundId, 'guesses');
    const docRef = await addDoc(guessesRef, {
      roundId,
      playerId,
      playerName,
      text: text.trim(),
      timestamp: Date.now(),
      isCorrect: false
    });
    return docRef.id;
  } catch (error) {
    console.error("Error submitting guess:", error);
    throw error;
  }
};

export const subscribeToGuesses = (roundId: string, callback: (guesses: Guess[]) => void): Unsubscribe => {
  const guessesRef = collection(db, 'rounds', roundId, 'guesses');
  const q = query(guessesRef, orderBy('timestamp', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const guesses = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Guess));
    callback(guesses);
  });
};

// Scoreboard Functions
export const updateScoreboard = async (eventId: string, userId: string, scoreUpdate: Partial<PlayerScore>): Promise<void> => {
  try {
    const scoreboardRef = doc(db, 'scoreboard', eventId);
    const scoreboardSnap = await getDoc(scoreboardRef);
    
    const currentTotals = scoreboardSnap.exists() ? scoreboardSnap.data().totals || {} : {};
    const currentScore = currentTotals[userId] || { wins: 0, plays: 0, fastestMs: null };
    
    const updatedScore: PlayerScore = {
      wins: currentScore.wins + (scoreUpdate.wins || 0),
      plays: currentScore.plays + (scoreUpdate.plays || 0),
      fastestMs: scoreUpdate.fastestMs 
        ? (currentScore.fastestMs === null ? scoreUpdate.fastestMs : Math.min(currentScore.fastestMs, scoreUpdate.fastestMs))
        : currentScore.fastestMs
    };
    
    await setDoc(scoreboardRef, {
      eventId,
      totals: {
        ...currentTotals,
        [userId]: updatedScore
      },
      updatedAt: Date.now()
    }, { merge: true });
  } catch (error) {
    console.error("Error updating scoreboard:", error);
  }
};

export const subscribeToScoreboard = (eventId: string, callback: (scoreboard: Scoreboard | null) => void): Unsubscribe => {
  const scoreboardRef = doc(db, 'scoreboard', eventId);
  return onSnapshot(scoreboardRef, (snapshot) => {
    const scoreboard = snapshot.exists() ? snapshot.data() as Scoreboard : null;
    callback(scoreboard);
  });
};

export const clearScoreboard = async (eventId: string): Promise<void> => {
  try {
    const scoreboardRef = doc(db, 'scoreboard', eventId);
    await deleteDoc(scoreboardRef);
  } catch (error) {
    console.error("Error clearing scoreboard:", error);
  }
};

// Settings Functions
export const getSettings = async (): Promise<GameSettings | null> => {
  try {
    const settingsRef = doc(db, 'settings', 'host');
    const settingsSnap = await getDoc(settingsRef);
    return settingsSnap.exists() ? settingsSnap.data() as GameSettings : null;
  } catch (error) {
    console.error("Error getting settings:", error);
    return null;
  }
};

export const updateSettings = async (updates: Partial<GameSettings>): Promise<void> => {
  try {
    const settingsRef = doc(db, 'settings', 'host');
    await setDoc(settingsRef, updates, { merge: true });
  } catch (error) {
    console.error("Error updating settings:", error);
  }
};

// Storage Functions
export const uploadImage = async (file: File, userId: string): Promise<string> => {
  try {
    const fileRef = storageRef(storage, `images/${userId}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    
    // Save to Firestore for listing
    const imagesRef = collection(db, 'images');
    await addDoc(imagesRef, {
      url,
      uploadedBy: userId,
      uploadedAt: Date.now(),
      name: file.name
    });
    
    return url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const getUploadedImages = async (): Promise<UploadedImage[]> => {
  try {
    const imagesRef = collection(db, 'images');
    const q = query(imagesRef, orderBy('uploadedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as UploadedImage));
  } catch (error) {
    console.error("Error getting images:", error);
    return [];
  }
};

// Utility Functions
export const generateEventId = (): string => {
  return `event_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
};

export { auth, db, storage };
