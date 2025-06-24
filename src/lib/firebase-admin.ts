
import * as admin from 'firebase-admin';

// This is the one place we use the admin SDK.
// It is used by the Stripe webhook to create an order in Firestore,
// bypassing security rules, as the webhook is a trusted server-to-server call.

if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error('FIREBASE_PRIVATE_KEY environment variable not set.');
    }
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.stack);
  }
}

const adminDb = admin.firestore();
export { adminDb };
