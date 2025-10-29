// lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Lazy initialization
let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;

export const app = new Proxy({} as FirebaseApp, {
  get(_, prop) {
    if (!_app) {
      _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    }
    return (_app as any)[prop];
  }
});

export const auth = new Proxy({} as Auth, {
  get(_, prop) {
    if (!_auth) {
      if (!_app) {
        _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      }
      _auth = getAuth(_app);
    }
    return (_auth as any)[prop];
  }
});