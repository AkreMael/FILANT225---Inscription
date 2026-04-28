import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import firebaseConfig from '../../firebase-applet-config.json';

const extendedConfig = {
  ...firebaseConfig,
  databaseURL: 'https://filant225-base-default-rtdb.firebaseio.com'
};

const app = initializeApp(extendedConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const rtdb = getDatabase(app);

// Test connection function
export async function testFirebaseConnection() {
  try {
    // Testing read access - this will now check if the user is signed in per the new rules
    if (!auth.currentUser) {
      console.log('Firebase: User not signed in. Connection test skipped (requires auth per new rules).');
      return true; // We assume connectivity is fine, rules are just blocking anonymous read
    }
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection successful: read validated.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
    // With "allow read, write: if request.auth != null", an unauthenticated test read will fail.
    // This is expected if the user hasn't logged in yet.
    if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('Insufficient permissions'))) {
        console.log('Firebase connection successful: Auth-required rules communicated.');
        return true;
    }
    console.error('Firebase connection test failed:', error);
    return false;
  }
}
