import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
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
  signOutFirebase: async () => {},
});

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
    if (user.emailVerified && isBootstrappedAdminEmail(user.email)) {
      setIsCloudAdmin(true);
    } else if (user.emailVerified) {
      try {
        const adminSnap = await getDoc(doc(db, 'admins', user.uid));
        setIsCloudAdmin(adminSnap.exists());
      } catch {
        setIsCloudAdmin(false);
      }
    } else {
      setIsCloudAdmin(false);
    }
    return user;
  };

  const signOutFirebase = async (): Promise<void> => {
    await signOut(auth);
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
        signOutFirebase,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);
