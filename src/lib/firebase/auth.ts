import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User as FirebaseAuthUser,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/lib/types';

export const firebaseNotConfiguredError = "Firebase is not configured correctly. Please check your environment variables.";

export async function signUp(
  name: string,
  email: string,
  password: string,
  role: 'customer' | 'owner'
): Promise<FirebaseAuthUser> {
  if (!auth || !db) {
    throw new Error(firebaseNotConfiguredError);
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await setDoc(doc(db, 'users', user.uid), {
    id: user.uid,
    name,
    email,
    role,
    joinedDate: new Date().toISOString(),
  });

  return user;
}

export async function signIn(email: string, password: string): Promise<FirebaseAuthUser> {
  if (!auth) {
    throw new Error(firebaseNotConfiguredError);
  }
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}
