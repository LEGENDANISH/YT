function blendResults(videos, channels, limit, cursor) {
  let all = [
    ...videos.map(v => ({ ...v, type: "video" })),
    ...channels.map(c => ({ ...c, type: "channel" }))
  ];

  // Stable sort
  all.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.id.localeCompare(b.id);
  });

  // Cursor filtering
  if (cursor) {
    all = all.filter(item => {
      if (item.score < cursor.score) return true;
      if (item.score === cursor.score) {
        return item.id > cursor.id;
      }
      return false;
    });
  }

  // Soft channel limiting
  const result = [];
  let channelStreak = 0;

  for (const item of all) {
    if (result.length >= limit) break;

    if (item.type === "channel") {
      if (channelStreak >= 2) continue;
      channelStreak++;
    } else {
      channelStreak = 0;
    }

    result.push(item);
  }

  const last = result[result.length - 1];

  const nextCursor = last
    ? Buffer.from(
        JSON.stringify({
          score: last.score,
          id: last.id,
          type: last.type
        })
      ).toString("base64")
    : null;

  return { items: result, nextCursor };
}

module.exports = { blendResults };
