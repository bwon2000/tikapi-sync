export async function fetchInfluencerFromTikAPI(username) {
  try {
    const response = await fetch(`/api/sync-influencer?username=${username}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Unknown error occurred');
    }

    return result;
  } catch (err) {
    console.error('Error syncing influencer:', err);
    throw err;
  }
}
