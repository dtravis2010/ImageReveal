
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getDatabase, ref, set, onValue, off, Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: "demo-key",
  projectId: "reveal-masters-arena",
  databaseURL: "https://reveal-masters-default-rtdb.firebaseio.com",
};

// Singleton pattern for Firebase initialization
let db: Database;

try {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getDatabase(app);
} catch (error) {
  console.error("Firebase Initialization Error:", error);
}

export const syncGameState = (roomId: string, state: any) => {
  if (!db || !roomId) return;
  try {
    const roomRef = ref(db, `rooms/${roomId}`);
    const serializedState = {
      ...state,
      revealedTiles: Array.from(state.revealedTiles as Set<number>)
    };
    set(roomRef, serializedState);
  } catch (err) {
    console.warn("Sync failed:", err);
  }
};

export const subscribeToRoom = (roomId: string, callback: (state: any) => void) => {
  if (!db || !roomId) return () => {};
  const roomRef = ref(db, `rooms/${roomId}`);
  onValue(roomRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      data.revealedTiles = new Set(data.revealedTiles || []);
      callback(data);
    }
  });
  return () => off(roomRef);
};

export const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};
