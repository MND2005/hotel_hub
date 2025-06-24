'use server';

import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  console.log('[AdminSDK] No existing Firebase admin app, attempting to initialize...');
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (!privateKey || !projectId || !clientEmail) {
      throw new Error(
        'Missing required Firebase admin environment variables (PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY).'
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
    console.log('[AdminSDK] Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error(
      '[AdminSDK] CRITICAL: Firebase admin initialization error:',
      error.message
    );
  }
}

const adminDb = admin.apps.length ? admin.firestore() : null;

if (!adminDb) {
  console.error(
    '[AdminSDK] CRITICAL: Firestore admin DB is not available. Orders cannot be saved.'
  );
}

export { adminDb };
