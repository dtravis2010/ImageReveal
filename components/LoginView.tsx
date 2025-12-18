import React, { useState, useEffect } from 'react';
import { signInAnonymouslyUser, completeEmailSignIn, onAuthChange, createOrUpdateUser, getUser } from '../firebaseService';
import { User as FirebaseUser } from 'firebase/auth';

interface LoginViewProps {
  onLoginComplete: (userId: string, isHost: boolean) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginComplete }) => {
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [needsDisplayName, setNeedsDisplayName] = useState(false);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    // Check for email sign-in completion
    const checkEmailSignIn = async () => {
      const user = await completeEmailSignIn();
      if (user) {
        setFirebaseUser(user);
        const existingUser = await getUser(user.uid);
        if (existingUser && existingUser.displayName) {
          onLoginComplete(user.uid, existingUser.isHost);
        } else {
          setNeedsDisplayName(true);
        }
      }
    };
    checkEmailSignIn();

    // Listen for auth state changes
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        setFirebaseUser(user);
        const existingUser = await getUser(user.uid);
        if (existingUser && existingUser.displayName) {
          onLoginComplete(user.uid, existingUser.isHost);
        } else if (!needsDisplayName) {
          setNeedsDisplayName(true);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    try {
      const user = await signInAnonymouslyUser();
      if (user) {
        setFirebaseUser(user);
        setNeedsDisplayName(true);
      }
    } catch (error) {
      console.error("Sign-in error:", error);
    }
    setIsLoading(false);
  };

  const handleSetDisplayName = async () => {
    if (!displayName.trim() || !firebaseUser) return;
    
    setIsLoading(true);
    try {
      await createOrUpdateUser(firebaseUser.uid, {
        id: firebaseUser.uid,
        displayName: displayName.trim(),
        authProvider: 'anonymous',
        status: 'available',
        isHost: isHost,
        createdAt: Date.now()
      });
      onLoginComplete(firebaseUser.uid, isHost);
    } catch (error) {
      console.error("Error setting display name:", error);
    }
    setIsLoading(false);
  };

  if (needsDisplayName && firebaseUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full space-y-6 animate-in zoom-in duration-500">
          <div className="text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-user-tag text-4xl text-indigo-600"></i>
            </div>
            <h1 className="text-3xl font-black text-slate-800 mb-2">Welcome to the Party!</h1>
            <p className="text-slate-500 font-medium">What should we call you?</p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSetDisplayName()}
              placeholder="Your display name"
              className="w-full px-6 py-4 text-lg font-bold border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              disabled={isLoading}
              autoFocus
            />

            <label className="flex items-center gap-3 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl cursor-pointer hover:bg-amber-100 transition-colors">
              <input
                type="checkbox"
                checked={isHost}
                onChange={(e) => setIsHost(e.target.checked)}
                className="w-6 h-6 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
              />
              <div>
                <p className="font-bold text-amber-900">I'm the Host</p>
                <p className="text-xs text-amber-700">Check this if you'll be running the game</p>
              </div>
            </label>

            <button
              onClick={handleSetDisplayName}
              disabled={!displayName.trim() || isLoading}
              className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xl font-black rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
            >
              {isLoading ? (
                <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Setting up...</>
              ) : (
                <><i className="fa-solid fa-arrow-right mr-2"></i> Join the Party</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg w-full space-y-8 animate-in zoom-in duration-500">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl transform rotate-3">
            <i className="fa-solid fa-gamepad text-5xl text-white"></i>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-3 tracking-tight">
            Image Guess Duel
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            🎄 Christmas Party Edition 🎄
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Guess the image. First correct answer wins!
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleAnonymousSignIn}
            disabled={isLoading}
            className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xl font-black rounded-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading...</>
            ) : (
              <><i className="fa-solid fa-right-to-bracket mr-2"></i> Quick Join</>
            )}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-slate-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm text-slate-400 font-bold uppercase tracking-wider">
                Party Time!
              </span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="fa-solid fa-1 text-indigo-600 text-sm"></i>
              </div>
              <div>
                <p className="font-bold text-slate-800">Sign in and set your name</p>
                <p className="text-sm text-slate-600">Let everyone know who you are</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="fa-solid fa-2 text-purple-600 text-sm"></i>
              </div>
              <div>
                <p className="font-bold text-slate-800">Wait for your turn</p>
                <p className="text-sm text-slate-600">Two players compete each round</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="fa-solid fa-3 text-pink-600 text-sm"></i>
              </div>
              <div>
                <p className="font-bold text-slate-800">Guess first to win!</p>
                <p className="text-sm text-slate-600">Type the correct answer before your opponent</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
