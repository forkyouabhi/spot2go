const admin = require('firebase-admin');
const db = require('../config/db');

// --- Firebase Admin SDK Initialization ---
// Initialize using a direct file path.
// IMPORTANT: Replace the placeholder path below with the actual path to your service account key file.
try {
  // Define the path to your service account key file directly.
  const serviceAccount = require('../config/step2go_firebase.json'); // Assumes the key is in the root directory. Adjust the path as needed.

  // Initialize Firebase Admin, but only if it hasn't been done already.
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully.');
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error.message);
  // Throwing an error here will prevent the application from starting with a misconfigured Firebase connection.
  throw new Error('Firebase initialization failed. Please check the path to your serviceAccountKey.json file.');
}

// Save device token for a user
async function saveDevice(req, res) {
  const { fcm_token } = req.body;
  const userId = req.user.id;
  if (!fcm_token) return res.status(400).json({ error: 'Missing token' });
  try {
    await db.query(
      'INSERT INTO user_devices (user_id,fcm_token) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [userId, fcm_token]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save device' });
  }
}

// Send notification to one user (internal helper, not exposed directly)
async function sendToUser(userId, payload) {
  const r = await db.query('SELECT fcm_token FROM user_devices WHERE user_id=$1', [userId]);
  const tokens = r.rows.map(r => r.fcm_token).filter(Boolean);
  if (!tokens.length) return;
  return admin.messaging().sendMulticast({ tokens, ...payload });
}

module.exports = { saveDevice, sendToUser };

