
import * as admin from 'firebase-admin';

// This file initializes the Firebase Admin SDK for server-side operations.

// Ensure all necessary environment variables are present.
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

let adminDb: admin.firestore.Firestore | null = null;

if (privateKey && projectId && clientEmail) {
  // Check if the app is already initialized to prevent errors.
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          // Replace escaped newlines from the environment variable.
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
      console.log('[AdminSDK] Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
      console.error('[AdminSDK] CRITICAL: Firebase admin initialization error:', error.message);
    }
  }
  // Get the Firestore instance from the initialized app.
  adminDb = admin.firestore();
} else {
  console.error('[AdminSDK] CRITICAL: Missing Firebase admin environment variables. SDK not initialized.');
}

if (!adminDb) {
  console.error('[AdminSDK] CRITICAL: Firestore admin DB is not available. This will cause webhook processing to fail.');
}

export { adminDb };
