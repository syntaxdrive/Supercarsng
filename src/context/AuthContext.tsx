import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import {
  ADMIN_EMAIL,
  OperationType,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
} from '../lib/firebase';
import type { UserProfile } from '../types/supercars';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  savedListingIds: string[];
  signInWithGoogle: () => Promise<User | null>;
  signOutUser: () => Promise<void>;
  toggleSaveListing: (listingId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [savedListingIds, setSavedListingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setIsAdmin(false);
        setSavedListingIds([]);
        setLoading(false);
        return;
      }

      const isBootstrappedAdmin =
        Boolean(firebaseUser.emailVerified) &&
        firebaseUser.email?.toLowerCase() === ADMIN_EMAIL;

      let adminDocExists = false;
      try {
        const adminSnap = await getDoc(doc(db, 'admins', firebaseUser.uid));
        adminDocExists = adminSnap.exists();
      } catch {
        adminDocExists = false;
      }

      setIsAdmin(isBootstrappedAdmin || adminDocExists);

      const profilePath = `profiles/${firebaseUser.uid}`;
      try {
        const profileRef = doc(db, 'profiles', firebaseUser.uid);
        const snap = await getDoc(profileRef);
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        } else if (firebaseUser.emailVerified) {
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            fullName: firebaseUser.displayName || 'Supercars.ng Member',
            email: firebaseUser.email || '',
            avatarUrl: firebaseUser.photoURL || '',
            role: 'customer',
            status: 'active',
          };
          await setDoc(profileRef, {
            ...newProfile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          setProfile(newProfile);
        }
      } catch (error) {
        console.error('Profile sync warning:', error);
        if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
          handleFirestoreError(error, OperationType.GET, profilePath);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setSavedListingIds([]);
      return;
    }

    const savedQuery = query(
      collection(db, 'saved_listings'),
      where('profileId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      savedQuery,
      (snapshot) => {
        const ids = snapshot.docs.map((d) => String(d.data().listingId));
        setSavedListingIds(ids);
      },
      (error) => {
        console.error('Saved listings listener warning:', error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const signInWithGoogle = async (): Promise<User | null> => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  };

  const signOutUser = async (): Promise<void> => {
    await signOut(auth);
  };

  const toggleSaveListing = async (listingId: string): Promise<boolean> => {
    if (!user) {
      await signInWithGoogle();
      return false;
    }
    const savedId = `${user.uid}_${listingId}`;
    const docRef = doc(db, 'saved_listings', savedId);
    const isCurrentlySaved = savedListingIds.includes(listingId);

    try {
      if (isCurrentlySaved) {
        await deleteDoc(docRef);
        return false;
      } else {
        await setDoc(docRef, {
          id: savedId,
          profileId: user.uid,
          listingId,
          createdAt: serverTimestamp(),
        });
        return true;
      }
    } catch (error) {
      handleFirestoreError(
        error,
        isCurrentlySaved ? OperationType.DELETE : OperationType.CREATE,
        `saved_listings/${savedId}`
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        savedListingIds,
        signInWithGoogle,
        signOutUser,
        toggleSaveListing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
