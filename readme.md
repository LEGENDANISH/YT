# 🎬Video Streaming platform


> A production-grade video streaming backend built with Node.js, Express, PostgreSQL (Prisma), Redis, MinIO (S3-compatible), BullMQ, Socket.IO, and FFmpeg.

<!-- ARCHITECTURE DIAGRAM — replace with your system diagram image -->
<!-- ![Architecture Overview](./docs/architecture.png) -->

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Video Processing Pipeline](#video-processing-pipeline)
- [Search System](#search-system)
- [Recommendation & Feed System](#recommendation--feed-system)
- [Watch Tracking & Engagement](#watch-tracking--engagement)
- [Analytics](#analytics)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [WebSocket / Real-Time](#websocket--real-time)
- [Database & Storage](#database--storage)
- [Getting Started](#getting-started)
- [Production Readiness](#production-readiness)
- [Future Enhancements](#future-enhancements)

---

## Architecture Overview

```
Client
  │
  ├── REST API (Express)  ◄──► Socket.IO (real-time upload/processing updates)
  │         │
  │         ├── PostgreSQL via Prisma ORM
  │         ├── Redis (ioredis) — caching + BullMQ queue
  │         └── MinIO S3 — file storage
  │
  └── Direct S3 upload (presigned URL, bypasses API server)
                │
                ▼
         BullMQ Worker  (video-processing queue, concurrency: 2)
                │
                └── FFmpeg — 360p + 720p HLS transcoding
```

The platform follows a multi-layer event-driven architecture. Heavy compute (transcoding) is offloaded to a background BullMQ worker while Redis handles caching and queue brokering. Raw uploads bypass the API server entirely via presigned S3 URLs, keeping the API lightweight.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Runtime | Node.js 18+ | Server-side JavaScript runtime |
| Framework | Express.js | HTTP routing and middleware |
| ORM | Prisma (PostgreSQL) | Type-safe database access |
| Queue | BullMQ + Redis | Background job scheduling |
| Object Storage | MinIO (AWS S3 SDK v3) | Video and media storage |
| Video Processing | FFmpeg via fluent-ffmpeg | HLS transcoding |
| Real-time | Socket.IO | WebSocket event streaming |
| Auth | JWT (jsonwebtoken) + bcrypt | Stateless auth, password hashing |
| File Upload | multer, multer-s3 | Multipart form handling |
| Search | PostgreSQL tsvector + pg_trgm | Full-text + fuzzy search |

---

## Project Structure

```
├── server.js                        # Express app entry point
├── websocket.js                     # Socket.IO server + emitters
├── worker.js                        # BullMQ video processing worker
├── scripts/cleanup.js               # Stale video cleanup (run via cron)
│
├── config/s3.js                     # AWS S3 client (MinIO)
├── lib/
│   ├── prisma.js                    # Prisma singleton
│   └── redis.js                     # ioredis (127.0.0.1:6379)
├── queues/videoQueue.js             # BullMQ Queue instance
│
├── middleware/
│   ├── authMiddleware.js            # JWT Bearer verification
│   └── upload.js                    # multer-s3 for avatar/banner
│
├── routes/
│   ├── authRoutes.js
│   ├── video.routes.js
│   ├── feed.routes.js
│   ├── subscription.routes.js
│   ├── search.routes.js
│   ├── recommendation.routes.js
│   ├── thumbnail.routes.js
│   └── analytics.routes.js
│
├── controllers/
│   ├── authController.js
│   ├── upload.js                    # Init upload + presigned URL
│   ├── completeUpload.js            # Complete upload + enqueue job
│   ├── uploadProgress.controller.js
│   ├── video.controller.js
│   ├── videoCancel/Delete/Update/Retry.controller.js
│   ├── recordView.controller.js
│   ├── recommend.controller.js      # Related videos
│   ├── autoplay.controller.js
│   ├── likedvideo.Controller.js
│   ├── recommendation.controller.js # Related via co-watch
│   ├── feed.controller.js
│   ├── comment/Comment.controller.js
│   ├── thumbnail/thumbnail.controller.js
│   ├── Subscription/subscriptions.controller.js
│   └── videoAnalytics/videoAnalytics.controller.js
│
└── services/
    ├── feed.service.js              # getTrendingVideos, getPersonalizedVideos
    ├── hybridRank.service.js        # Hybrid feed (trending+personal+collab)
    ├── collaborative.service.js     # Collaborative filtering
    ├── trending.service.js          # Score-based trending
    ├── videoRecommendation.service.js
    ├── videoAutoplay.service.js     # Autoplay fallback chain
    ├── recommendation.service.js    # Co-watch frequency
    ├── watchSignal.service.js
    └── search/
        ├── search.service.js        # FTS + fuzzy + prefix candidates
        ├── ranking.service.js
        ├── personalization.service.js
        └── blend.service.js         # 3:1 video:channel interleaving
```

---

## Video Processing Pipeline

<!-- UPLOAD FLOW DIAGRAM — replace with your pipeline diagram -->
<!-- ![Upload Flow](./docs/upload-flow.png) -->

### Upload Flow

```
1. POST /upload/init
   → Creates Video record (status: UPLOADING)
   → Returns { videoId, uploadUrl (presigned PUT), s3Key }

2. Client PUTs file directly to MinIO via presigned URL
   PUT /upload/progress/:videoId  (0–100, emits WS events)

3. POST /upload/complete { videoId }
   → S3 HeadObject verifies file exists
   → Video status → PROCESSING
   → BullMQ job enqueued { videoId, userId, s3Key }

4. Worker processes job
   a. status → PROCESSING, processingStage → DOWNLOAD
   b. Downloads raw file from S3_RAW_BUCKET to local /tmp/yt-worker/
   c. ffmpeg.screenshots({ timestamps: ["10%"], size: "1280x720" })
      → Upload to S3_PROCESSED_BUCKET as thumbnails/{videoId}.jpg
   d. ffprobe extracts duration → saved to DB
   e. processingStage → TRANSCODE
   f. FFmpeg encodes 360p + 720p HLS (see command below)
   g. processingStage → UPLOAD
   h. All .ts + .m3u8 files → S3_PROCESSED_BUCKET/videos/{videoId}/
   i. status → READY, visibility → PUBLIC, masterPlaylist saved
   j. Cleanup all local temp files

5. On any error:
   status → PROCESSING_FAILED
   errorMessage + processingAttempts++ saved
   Retry via POST /:id/retry-processing (max 3)
```

### Video Status Machine

```
UPLOADING ──► PROCESSING ──► READY
                         └──► PROCESSING_FAILED  (max 3 retry attempts)
UPLOADING ──► FAILED     (cancelled or S3 verify failed)
```

### FFmpeg Command

```bash
ffmpeg -y -i "<localInput>" \
  -map 0:v -map 0:v -map 0:a -map 0:a \
  -c:v libx264 -crf 22 \
  -filter:v:0 scale=640:360  -maxrate:v:0 800k  -bufsize:v:0 1200k \
  -filter:v:1 scale=1280:720 -maxrate:v:1 2800k -bufsize:v:1 4200k \
  -c:a aac -b:a 128k -ac 2 \
  -var_stream_map "v:0,a:0 v:1,a:1" \
  -master_pl_name master.m3u8 \
  -f hls -hls_time 6 -hls_playlist_type vod \
  -hls_segment_filename "<outputDir>/stream_%v_%03d.ts" \
  "<outputDir>/stream_%v.m3u8"
```

### Output Quality Ladder

| Stream | Resolution | Max Bitrate | Segment Duration | Playlist Type |
|---|---|---|---|---|
| stream_0 | 360p (640×360) | 800 Kbps | 6 seconds | VOD |
| stream_1 | 720p (1280×720) | 2800 Kbps | 6 seconds | VOD |

---

## Search System

### 11-Phase Pipeline

```
1.  Receive q, type, limit, cursor
2.  Parse query (normalize, tokenize, detect intent)
3.  Generate candidates (FTS + prefix + fuzzy + token OR)
4.  Fetch full video records with user relation
5.  Rank videos (text + engagement + freshness + intent)
6.  Rank channels (text + authority + activity)
7.  Personalize (apply multipliers from watch history)
8.  Transform to frontend shape
9.  Safety trim to limit × 5
10. Parse base64 cursor
11. Blend (3 videos : 1 channel) + paginate
    → Store search context in Redis (10min, authenticated users only)
```

### Candidate Generation

| Strategy | Source | Video Limit | Channel Limit |
|---|---|---|---|
| Full-text search | `searchVector @@ plainto_tsquery('english', q)` | 5,000 | 2,000 |
| Prefix match | `title ILIKE 'token%'` | 2,000 | 1,000 |
| Trigram fuzzy | `similarity(title, q) > 0.3` | 2,000 | 1,000 |
| Token OR expansion | `searchVector @@ to_tsquery('english', 't1 \| t2')` | 2,000 | — |

All results merged into a deduplicated Set. Cached in Redis for 60s per query.

### Video Ranking Formula

```
score = textScore     × 0.40   (normalized text relevance)
      + engagement    × 0.25   (views / 1,000,000)
      + freshness     × 0.20   (exp(-ageDays/30))
      + intentBoost   × 0.15
```

### Search Personalization Multipliers

| Signal | Multiplier | Effect |
|---|---|---|
| Video already watched | × 0.70 | Demote already-seen content |
| From a channel user completed videos on | × 1.15 | Boost familiar creators |
| User completed this specific video | × 1.10 | Slight re-watch boost |
| Channel user is subscribed to | × 1.30 | Strong subscription signal |
| Channel in recent watch history | × 1.15 | Recency boost |

### Result Blending

Pattern: **3 videos → 1 channel → 3 videos → 1 channel...**  
Pagination: base64-encoded cursor `{ videoIndex, channelIndex }`

---

## Recommendation & Feed System

<!-- RECOMMENDATION DIAGRAM — replace with your phase diagram -->
<!-- ![Recommendation Engine](./docs/recommendation-phases.png) -->

The recommendation engine mirrors real-world platforms by layering multiple signals through five sequential phases, combined in a weighted hybrid scorer. Each phase contributes unique signals while remaining explainable and cache-friendly.

---

### 🔹 Phase 1 — Home Feed (Fresh Content Discovery)

**Endpoint:** `GET /api/feed/home`  
**Strategy:** Cursor-paginated, chronological (`createdAt DESC`)  
**Audience:** All users including cold-start / new accounts

Serves only `READY + PUBLIC` videos ordered by creation date. No behavioral history required — this is the entry point for all users. Cursor-based pagination eliminates offset bugs common in `LIMIT/OFFSET` approaches.

- No watch history needed — ideal for cold-start and anonymous users
- Cursor ensures stable pagination even as new videos are inserted
- Only `READY + PUBLIC` status videos are surfaced

---

### 🔹 Phase 2 — Personalized Feed

**Endpoint:** `GET /api/feed/home` (authenticated)  
**Signal Source:** `WatchHistory` table  
**Audience:** Returning authenticated users

Introduces behavioral awareness by filtering out content the user has already seen. Videos from channels the user frequently completes are implicitly boosted. This phase pairs with trending and collaborative in the hybrid scorer.

- Filters out watched videos via `WatchHistory` join
- Boosts same-creator content based on completion history
- Foundation for future category and tag embedding extensions

---

### 🔹 Phase 3 — Trending Algorithm

**Service:** `services/trending.service.js`  
**Signals:** Recent views, completion count, age decay  
**Window:** Last 24 hours

The trending score uses a recency-weighted engagement formula that naturally decays with age, preventing old viral videos from dominating indefinitely.

```
score = recentViews       × 3
      + recentCompletions × 5
      − ageInHours        × 0.5
```

- `recentViews` — views recorded within the last 24h window
- `recentCompletions` — stronger signal than partial views (weight ×5)
- `ageInHours` — linear decay prevents stale content dominating

> The completion weight being higher than the view weight (5 vs 3) deliberately rewards content that keeps users engaged, not just content with high click-through rates.

---

### 🔹 Phase 4 — Collaborative Filtering

**Service:** `services/collaborative.service.js`  
**Core Idea:** *"Users who watched this video also watched..."*  
**Output:** Co-watch frequency ranked video list

The most powerful phase for returning users. Creates implicit social proof by surfacing content that behaviorally similar viewers enjoyed.

```
1. Find all users U who watched videoId
2. Find all other videos V that users U also watched
3. Build frequency map: { videoId → watchCount }
4. Sort by count DESC
5. Return top 10 video details
```

- No explicit user profiles required — purely behavioral
- Naturally handles niche content communities
- Deduplication via `Map` prevents duplicate entries across sources
- Falls back to trending when co-watch data is sparse

---

### 🔹 Phase 5 — Watch Page Recommendations + Autoplay

**Endpoint:** `GET /api/videos/:id/recommendations`  
**Use case:** Right-sidebar on watch page + Autoplay "Up Next"

Merges three ranked sources using `Map` deduplication, preserving priority order. Each result carries an **explainable reason tag** for frontend display:

```
Priority 1 — Same creator videos (newest first)
             reason: "same_creator"

Priority 2 — Collaborative filtering results
             reason: "collaborative"

Priority 3 — Trending fallback (views DESC, createdAt DESC)
             reason: "trending"
```

Explainability is a first-class feature — the `reason` field lets the frontend show users why a video was recommended, building trust and improving click-through rates.

---

### 🔁 Hybrid Ranking Engine

**Service:** `services/hybridRank.service.js`

<!-- HYBRID RANKING DIAGRAM — replace with your score composition diagram -->
<!-- ![Hybrid Ranking](./docs/hybrid-ranking.png) -->

All three strategies run concurrently via `Promise.all`, results are merged by video ID, and a weighted formula produces the final score:

```
finalScore = trendingScore  × 0.40
           + personalScore  × 0.40
           + collabScore    × 0.20
```

| Component | Weight | Service | Cache TTL |
|---|---|---|---|
| Trending Score | 40% | `trending.service.js` | 60s per-user Redis key |
| Personalized Score | 40% | `feed.service.js` | 60s per-user Redis key |
| Collaborative Score | 20% | `collaborative.service.js` | 60s per-user Redis key |

Results are cached per-user in Redis (TTL: 60s) and return top 20 videos.

---

### ▶ Autoplay Fallback Chain

When the current video ends, the autoplay service follows a strict fallback chain — stopping at the first non-empty result:

```
Step 1 — Newest unwatched video from same creator
Step 2 — getVideoRecommendations(videoId, 5)
         → first result not in completed history
Step 3 — Top trending video not in completed history
```

> **Feedback loop:** `recordView` stores engagement signals on every watch event, which feed back into the recommendation engine on the next request — gradually personalizing the autoplay queue over time.

---

## Watch Tracking & Engagement

### WatchHistory Model

Each watch event records the following fields:

| Field | Type | Description |
|---|---|---|
| `userId` | UUID | The viewing user |
| `videoId` | UUID | The video being watched |
| `watchDuration` | Int (seconds) | Total seconds watched in session |
| `completed` | Boolean | `true` if user watched ≥ 90% of video |

### View Qualification Rules

A view is only counted if the watch event meets at least one threshold — preventing fake refresh inflation and partial-scroll gaming:

```
qualifies = watchDuration >= 20 seconds
         OR watchDuration >= 30% of total video duration
```

Watch history is always **upserted** — re-watching a video updates `watchDuration` and the `completed` flag. Per-user deduplication is checked before incrementing the global view count, so each user contributes at most one view per video.

---

## Analytics

**Endpoint:** `GET /api/analytics/video/:videoId` *(auth required)*

| Metric | Unit | Description |
|---|---|---|
| Views | Count | Total qualified view events |
| Watch Time | Seconds / Minutes / Hours | Cumulative time spent watching |
| Likes | Count | Total like events |
| Comments | Count | Total comment threads |
| Subscribers Gained | Count | Users who subscribed via this video |

<!-- ANALYTICS CHARTS — replace with your dashboard screenshots -->
<!-- ![Views Over Time](./docs/analytics-views.png) -->
<!-- ![Watch Time Distribution](./docs/analytics-watchtime.png) -->
<!-- ![Subscriber Attribution](./docs/analytics-subscribers.png) -->

### Subscription Analytics Attribution

`subscribedFromVideoId` is stored on each subscription record, enabling the analytics endpoint to count exactly how many subscribers each video drove — a key signal for content strategy.

---

## API Reference

### Authentication — `/api`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register (email, username, password, displayName) |
| POST | `/login` | — | Login → returns JWT (1h expiry) |
| GET | `/aboutme` | ✅ | Get own profile |
| PUT | `/update` | ✅ | Update displayName, bio, avatar, banner (multipart) |
| DELETE | `/delete` | ✅ | Delete own account |
| GET | `/my-videos` | ✅ | All videos by current user (all statuses) |
| GET | `/channel/:channelId` | — | Channel info + public videos |

### Videos — `/api/videos`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/upload/init` | ✅ | Init upload: creates DB record, returns presigned S3 URL |
| POST | `/upload/complete` | ✅ | Trigger processing after upload |
| PUT | `/upload/progress/:videoId` | ✅ | Update progress 0–100, emits WS event |
| GET | `/:id` | — | Get video (public only) |
| GET | `/stream/:id` | — | Get HLS stream URL |
| PUT | `/:id` | ✅ | Update title, description, visibility, scheduledAt |
| DELETE | `/:id` | ✅ | Delete video + all S3 files |
| POST | `/:id/cancel` | ✅ | Cancel UPLOADING/PROCESSING video |
| POST | `/:id/retry-processing` | ✅ | Retry PROCESSING_FAILED (max 3 attempts) |
| POST | `/:id/view` | ✅ | Record watch duration, count view if qualified |
| GET | `/:id/recommendations` | — | Watch page recommendations (5-phase pipeline) |
| GET | `/:id/recommend` | — | Related videos (co-watch frequency) |
| GET | `/:id/autoplay` | ✅ | Next autoplay video (fallback chain) |
| GET | `/:id/likes` | ✅ | Like count + did current user like |
| POST | `/like/:videoId` | ✅ | Like a video |
| DELETE | `/like/:videoId` | ✅ | Unlike a video |
| GET | `/likedvideos` | ✅ | All liked videos |

### Comments — `/api/videos/:id/comments`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | — | Paginated top-level comments (sort: newest / top) |
| POST | `/` | ✅ | Create comment or reply (`parentId` for replies) |
| PUT | `/:commentId` | ✅ | Edit own comment |
| DELETE | `/:commentId` | ✅ | Delete (own comment or video owner can delete any) |
| GET | `/:commentId/replies` | — | Paginated replies |
| POST | `/:commentId/like` | ✅ | Toggle comment like |

### Feed — `/api/feed`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/home` | ✅ | Cursor-paginated chronological (createdAt DESC) |
| GET | `/trending` | ✅ | Score-based trending (last 24h) |
| GET | `/hybrid` | ✅ | Hybrid: 40% trending + 40% personalized + 20% collaborative |
| POST | `/:id/view` | ✅ | Record view from feed |
| GET | `/history` | ✅ | Paginated watch history |
| DELETE | `/history/:videoId` | ✅ | Delete single history item |
| DELETE | `/history` | ✅ | Clear all history |

### Subscriptions — `/api`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/subscribe/:channelId` | ✅ | Subscribe (optional `videoId` body for analytics) |
| DELETE | `/subscribe/:channelId` | ✅ | Unsubscribe |
| GET | `/subscriptions` | ✅ | All subscribed channels |
| GET | `/subscriptions/videos` | ✅ | Latest videos from subscribed channels |
| GET | `/subscribers/:channelId` | — | Subscriber count |
| GET | `/subscribe/check/:channelId` | ✅ | Is current user subscribed? |

### Search — `/api/search`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/?q=&type=all\|video\|channel&limit=20&cursor=` | 11-phase search pipeline |

### Thumbnails — `/api`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| PUT | `/thumbnail/:videoId` | ✅ | Replace thumbnail (file upload) |
| DELETE | `/thumbnail/:videoId` | ✅ | Remove thumbnail |

### Recommendations — `/api`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/videos/:id/related` | ✅ | Related by co-watch frequency |

### Analytics — `/api/analytics`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/video/:videoId` | ✅ | Views, watch time (s/min/hr), likes, comments, subscribers gained |

---

## Authentication

```
Authorization: Bearer <jwt_token>
```

| Property | Value |
|---|---|
| Token type | JWT (jsonwebtoken) |
| Expiry | 1 hour |
| Password hashing | bcrypt, 10 rounds |
| WebSocket auth | `socket.handshake.auth.token` |
| Optional auth | Some endpoints accept but do not require a token |

---

## WebSocket / Real-Time

Socket.IO runs on the same HTTP server as Express. JWT authentication is required on connection. Each authenticated user joins a private room `user:{userId}` and receives only their own events.

| Event | Payload | Trigger |
|---|---|---|
| `video:update` | `{ videoId, status?, uploadProgress?, error? }` | Upload progress + processing status changes |

---

## Database & Storage

### S3 Bucket Layout

| Bucket Env Var | Path Pattern | Contents |
|---|---|---|
| `S3_RAW_BUCKET` | `raw/{videoId}/{filename}` | Original uploaded file |
| `S3_PROCESSED_BUCKET` | `videos/{videoId}/master.m3u8` | HLS master playlist |
| `S3_PROCESSED_BUCKET` | `videos/{videoId}/stream_*.m3u8` | Per-quality playlists |
| `S3_PROCESSED_BUCKET` | `videos/{videoId}/stream_*.ts` | HLS segments |
| `S3_PROCESSED_BUCKET` | `thumbnails/{videoId}.jpg` | Auto-generated thumbnail |
| `S3_PROCESSED_BUCKET` | `thumbnails/{videoId}-{ts}.jpg` | Custom-uploaded thumbnail |
| `S3_USER_MEDIA_BUCKET` | `avatars/{userId}-{ts}.ext` | User avatar |
| `S3_USER_MEDIA_BUCKET` | `banners/{userId}-{ts}.ext` | Channel banner |

### Stale Video Cleanup

`scripts/cleanup.js` marks videos stuck in `UPLOADING` or `PROCESSING` for over 1 hour as `PROCESSING_FAILED`. Schedule via cron:

```bash
0 * * * * node /app/scripts/cleanup.js
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15 (with `uuid-ossp`, `pg_trgm` extensions)
- Redis 7
- MinIO or any S3-compatible storage (3 buckets required)
- FFmpeg installed on the worker machine

### Install & Run

```bash
npm install
npx prisma migrate dev

# Start API server
node server.js

# Start video processing worker (separate process)
node worker.js

# Stale video cleanup (run periodically via cron)
node scripts/cleanup.js
```

### Environment

See `ENV_SETUP.md` for all required environment variables.

### Health Check

```
GET /health → { "status": "ok" }
```

---

## Production Readiness

| Feature | Status | Notes |
|---|---|---|
| Cursor pagination | ✅ | No offset bugs, stable across inserts |
| BigInt serialization | ✅ | Prisma BigInt → String in JSON responses |
| Redis caching | ✅ | 60s TTL on heavy recommendation queries |
| Background workers | ✅ | BullMQ, concurrency: 2, separate process |
| Safe S3 deletion | ✅ | All related S3 objects deleted on video delete |
| Explainable recommendations | ✅ | `reason` field on each recommendation result |
| Controller/service separation | ✅ | Clean architectural boundaries throughout |
| Retry logic | ✅ | Up to 3 processing retries per video |
| Stale job cleanup | ✅ | Cron-based cleanup script included |
| WebSocket real-time updates | ✅ | Upload + processing progress events |

---

## Future Enhancements

| Enhancement | Phase | Complexity |
|---|---|---|
| Category / tag embeddings for content-based filtering | Recommendation | Medium |
| Session-based recommendation context | Recommendation | Medium |
| Diversity penalties to prevent filter bubbles | Hybrid Ranking | Low |
| A/B testing framework for scoring weights | Hybrid Ranking | High |
| ML-based ranking model (replace formula scorer) | Recommendation | High |
| 480p quality tier in FFmpeg ladder | Video Processing | Low |
| 1080p quality tier in FFmpeg ladder | Video Processing | Low |
| Live streaming support (HLS live) | Video Processing | High |
| Chapter markers from video metadata | Video Processing | Medium |
| CDN integration for HLS segment delivery | Infrastructure | Medium |
