import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User as FirebaseAuthUser,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/lib/types';

export async function signUp(
  name: string,
  email: string,
  password: string,
  role: 'customer' | 'owner'
): Promise<FirebaseAuthUser> {
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
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}
