import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  isBootstrappedAdminEmail,
} from '../firebase';

interface FirebaseContextValue {
  firebaseUser: User | null;
  authReady: boolean;
  isCloudAdmin: boolean;
  isCheckingAdmin: boolean;
  signInWithGoogle: () => Promise<User>;
  signInWithEmailPassword: (email: string, password: string) => Promise<User>;
  createAdminEmailPasswordAccount: (email: string, password: string) => Promise<User>;
  sendAdminVerificationEmail: (targetUser?: User | null) => Promise<void>;
  refreshFirebaseAuthUser: () => Promise<{ user: User | null; isAdmin: boolean }>;
  sendAdminPasswordReset: (email: string) => Promise<void>;
  signOutFirebase: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextValue>({
  firebaseUser: null,
  authReady: false,
  isCloudAdmin: false,
  isCheckingAdmin: false,
  signInWithGoogle: async () => {
    throw new Error('FirebaseProvider not mounted');
  },
  signInWithEmailPassword: async () => {
    throw new Error('FirebaseProvider not mounted');
  },
  createAdminEmailPasswordAccount: async () => {
    throw new Error('FirebaseProvider not mounted');
  },
  sendAdminVerificationEmail: async () => {},
  refreshFirebaseAuthUser: async () => ({ user: null, isAdmin: false }),
  sendAdminPasswordReset: async () => {},
  signOutFirebase: async () => {},
});

const resolveCloudAdminStatus = async (user: User | null): Promise<boolean> => {
  if (!user || !user.emailVerified) {
    return false;
  }
  if (isBootstrappedAdminEmail(user.email)) {
    return true;
  }
  try {
    const adminSnap = await getDoc(doc(db, 'admins', user.uid));
    return adminSnap.exists();
  } catch {
    return false;
  }
};

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isCloudAdmin, setIsCloudAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (!user || !user.emailVerified) {
        setIsCloudAdmin(false);
        setAuthReady(true);
        return;
      }

      if (isBootstrappedAdminEmail(user.email)) {
        setIsCloudAdmin(true);
        setAuthReady(true);
        return;
      }

      setIsCheckingAdmin(true);
      try {
        const adminSnap = await getDoc(doc(db, 'admins', user.uid));
        setIsCloudAdmin(adminSnap.exists());
      } catch {
        setIsCloudAdmin(false);
      } finally {
        setIsCheckingAdmin(false);
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<User> => {
    const credential = await signInWithPopup(auth, googleProvider);
    const user = credential.user;
    setFirebaseUser(user);
    const isAdmin = await resolveCloudAdminStatus(user);
    setIsCloudAdmin(isAdmin);
    return user;
  };

  const signInWithEmailPassword = async (
    email: string,
    password: string
  ): Promise<User> => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const user = credential.user;
    setFirebaseUser(user);
    const isAdmin = await resolveCloudAdminStatus(user);
    setIsCloudAdmin(isAdmin);
    return user;
  };

  const createAdminEmailPasswordAccount = async (
    email: string,
    password: string
  ): Promise<User> => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const user = credential.user;
    setFirebaseUser(user);
    const isAdmin = await resolveCloudAdminStatus(user);
    setIsCloudAdmin(isAdmin);
    return user;
  };

  const sendAdminVerificationEmail = async (
    targetUser?: User | null
  ): Promise<void> => {
    const user = targetUser ?? auth.currentUser;
    if (!user) {
      throw new Error('No active account to verify.');
    }
    await sendEmailVerification(user);
  };

  const refreshFirebaseAuthUser = async (): Promise<{
    user: User | null;
    isAdmin: boolean;
  }> => {
    const current = auth.currentUser;
    if (!current) {
      setFirebaseUser(null);
      setIsCloudAdmin(false);
      return { user: null, isAdmin: false };
    }
    await current.reload();
    await current.getIdToken(true);
    const refreshed = auth.currentUser;
    setFirebaseUser(refreshed);
    const isAdmin = await resolveCloudAdminStatus(refreshed);
    setIsCloudAdmin(isAdmin);
    return { user: refreshed, isAdmin };
  };

  const sendAdminPasswordReset = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  };

  const signOutFirebase = async (): Promise<void> => {
    await signOut(auth);
    setFirebaseUser(null);
    setIsCloudAdmin(false);
  };

  return (
    <FirebaseContext.Provider
      value={{
        firebaseUser,
        authReady,
        isCloudAdmin,
        isCheckingAdmin,
        signInWithGoogle,
        signInWithEmailPassword,
        createAdminEmailPasswordAccount,
        sendAdminVerificationEmail,
        refreshFirebaseAuthUser,
        sendAdminPasswordReset,
        signOutFirebase,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);
