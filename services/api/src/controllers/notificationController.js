const admin = require('firebase-admin');
const { UserDevice } = require('../models');

// --- Firebase Admin SDK Initialization ---
try {
  const serviceAccount = require('../config/step2go_firebase.json'); 
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully.');
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error.message);
  throw new Error('Firebase initialization failed. Check the path to your service account key file.');
}

// Save device token for a user
async function saveDevice(req, res) {
  const { fcm_token } = req.body;
  const userId = req.user.id;
  if (!fcm_token) return res.status(400).json({ error: 'Missing fcm_token' });

  try {
    // findOrCreate prevents duplicates and handles updates gracefully
    const [device, created] = await UserDevice.findOrCreate({
      where: { userId: userId, fcmToken: fcm_token },
      defaults: { userId: userId, fcmToken: fcm_token }
    });
    res.json({ ok: true, message: created ? 'Device saved.' : 'Device already registered.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save device' });
  }
}

// Send notification to one user (internal helper, not exposed directly)
async function sendToUser(userId, payload) {
  try {
    const devices = await UserDevice.findAll({
      where: { userId: userId },
      attributes: ['fcmToken']
    });

    const tokens = devices.map(d => d.fcmToken).filter(Boolean);
    if (!tokens.length) return;

    return admin.messaging().sendMulticast({ tokens, ...payload });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

module.exports = { saveDevice, sendToUser };
