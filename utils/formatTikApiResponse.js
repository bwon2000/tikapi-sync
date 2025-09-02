export function formatTikApiResponse(response) {
  if (!response || !response.json || !response.json.itemList) {
    console.error('❌ Invalid TikAPI response');
    return [];
  }

  // Assuming itemList contains the list of TikTok videos
  return response.json.itemList.map((item) => {
    const { id, stats, video, author } = item;
    return {
      video_id: id,
      secuid: author.secUid, // Assuming secUid exists on the author object
      username: author.uniqueId,
      full_name: author.nickname,
      account_url: `https://www.tiktok.com/@${author.uniqueId}`,
      video_url: `https://www.tiktok.com/@${author.uniqueId}/video/${id}`,
      caption: item.desc,
      views: stats.playCount,
      likes: stats.diggCount,
      comments: stats.commentCount,
      shares: stats.shareCount,
      saves: stats.saveCount,
      length: video.duration,
      video_quality: video.videoQuality || null,
      date: new Date(item.createTime * 1000),
    };
  });
}
