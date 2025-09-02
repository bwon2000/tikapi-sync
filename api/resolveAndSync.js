import resolveAndSync from '../internal/resolveAndSyncInfluencer.js';

export default async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Missing username' });
  }

  try {
    await resolveAndSync(username.toString());
    return res
      .status(200)
      .json({ success: true, message: `Synced ${username}` });
  } catch (err) {
    console.error('❌ Sync failed:', err);
    return res.status(500).json({ error: 'Sync failed', detail: err.message });
  }
}

// This is a Next.js API route that resolves a TikTok username to secUid and syncs the influencer data.
// It uses the resolveAndSyncInfluencer function from the resolveAndSyncInfluencer.js file.
// The API expects a GET request with a username query parameter.
// If the username is missing, it returns a 400 error.
// If the username is provided, it calls the resolveAndSyncInfluencer function and returns a 200 success response.
// If an error occurs during the process, it returns a 500 error with the error message.
// The handler function is exported as the default export of the module.
// This code is part of a Next.js application and is meant to be used as an API route.
// The handler function is asynchronous and uses try-catch for error handling.
// The response is sent in JSON format.
