import cron from 'node-cron';

/**
 * Heuristic rules for detecting highlight-worthy segments in an episode.
 *
 * Current rules (all local, no external API calls):
 * - Title keywords: "breakthrough", "reveals", "exclusive", "interview", "deep dive"
 * - Description: numbered lists, bullet points, "key takeaways" phrases
 * - Duration-based: propose clips at 25%, 50%, 75% marks for episodes > 30 min
 * - Tag matching: AI, technology, research, science, health, quantum
 *
 * Designed to be replaced with an ML-based detection engine later
 * without changing the data model.
 */

const TITLE_KEYWORDS = [
  { word: 'breakthrough', confidence: 0.8, label: 'key_point' },
  { word: 'reveals', confidence: 0.75, label: 'key_point' },
  { word: 'exclusive', confidence: 0.85, label: 'key_point' },
  { word: 'interview', confidence: 0.6, label: 'quote' },
  { word: 'deep dive', confidence: 0.7, label: 'summary' },
];

const BOOST_TAGS = ['AI', 'technology', 'research', 'science', 'health', 'quantum', 'innovation'];

const DURATION_SEGMENT_MINUTES = [25, 50, 75]; // percentages

/**
 * Detect highlights for a single episode.
 * Creates Highlight + HighlightSegment records in the database.
 */
export async function detectHighlightsForEpisode(prisma, episode) {
  const highlights = [];

  // 1. Title keyword detection
  const lowerTitle = (episode.title || '').toLowerCase();
  for (const kw of TITLE_KEYWORDS) {
    if (lowerTitle.includes(kw.word)) {
      const durationSec = episode.duration || 600; // default 10 min if unknown
      const midPoint = Math.floor(durationSec / 2);

      highlights.push({
        title: `${kw.label === 'key_point' ? 'Key Point' : kw.label === 'quote' ? 'Quote' : 'Summary'} — ${episode.title}`,
        description: `Auto-detected ${kw.label} from episode title keyword "${kw.word}".`,
        startTime: Math.max(0, midPoint - 30),
        endTime: Math.min(durationSec, midPoint + 30),
        confidence: kw.confidence,
        status: 'pending',
        tags: JSON.stringify([]),
        segments: {
          create: [
            {
              label: kw.label,
              startTime: Math.max(0, midPoint - 30),
              endTime: Math.min(durationSec, midPoint + 30),
              text: `Auto-detected segment based on keyword "${kw.word}" in title.`,
              confidence: kw.confidence,
            },
          ],
        },
      });
    }
  }

  // 2. Description analysis (numbered lists, bullet points, key takeaways)
  const description = episode.description || '';
  if (description) {
    const listItems = description.match(/(?:^|\n)\s*(?:\d+[.）)]|[-•*])\s+(.+)/gm);
    const hasTakeaways = /key takeaways?|important point|critical|notable/i.test(description);

    if (listItems && listItems.length >= 2) {
      const durationSec = episode.duration || 600;
      const perItem = Math.floor(durationSec / (listItems.length + 1));
      const segments = listItems.slice(0, 5).map((item, i) => ({
        label: 'key_point',
        startTime: perItem * (i + 1),
        endTime: Math.min(durationSec, perItem * (i + 1) + 60),
        text: item.replace(/^\s*(?:\d+[.）)]|[-•*])\s+/, '').trim(),
        confidence: 0.6,
      }));

      highlights.push({
        title: `Key Takeaways — ${episode.title}`,
        description: `Auto-detected ${segments.length} key points from episode description.`,
        startTime: segments[0].startTime,
        endTime: segments[segments.length - 1].endTime,
        confidence: 0.6,
        status: 'pending',
        tags: JSON.stringify([]),
        segments: { create: segments },
      });
    }

    if (hasTakeaways && (!listItems || listItems.length < 2)) {
      const durationSec = episode.duration || 600;
      const midPoint = Math.floor(durationSec / 2);
      highlights.push({
        title: `Summary — ${episode.title}`,
        description: 'Episode contains key takeaways or critical discussion points.',
        startTime: Math.max(0, midPoint - 60),
        endTime: Math.min(durationSec, midPoint + 60),
        confidence: 0.5,
        status: 'pending',
        tags: JSON.stringify([]),
        segments: {
          create: [
            {
              label: 'summary',
              startTime: Math.max(0, midPoint - 60),
              endTime: Math.min(durationSec, midPoint + 60),
              text: description.substring(0, 200),
              confidence: 0.5,
            },
          ],
        },
      });
    }
  }

  // 3. Duration-based fallback: propose clips at percentage marks for long episodes
  if (episode.duration && episode.duration > 1800) {
    // only add if we have fewer than 2 highlights already
    if (highlights.length < 2) {
      const durationSec = episode.duration;
      const segments = DURATION_SEGMENT_MINUTES.map(pct => {
        const start = Math.floor(durationSec * (pct / 100));
        return {
          label: 'key_point',
          startTime: start,
          endTime: Math.min(durationSec, start + 60),
          text: `Auto-detected segment at ${pct}% of episode.`,
          confidence: 0.3,
        };
      });

      highlights.push({
        title: `Highlights — ${episode.title}`,
        description: `Auto-detected ${segments.length} segments based on episode duration (${Math.floor(durationSec / 60)} min).`,
        startTime: segments[0].startTime,
        endTime: segments[segments.length - 1].endTime,
        confidence: 0.3,
        status: 'pending',
        tags: JSON.stringify([]),
        segments: { create: segments },
      });
    }
  }

  // 4. Tag boost: if episode has matching tags, boost confidence
  let episodeTags = [];
  try {
    episodeTags = JSON.parse(episode.tags || '[]');
  } catch {
    episodeTags = [];
  }

  for (const highlight of highlights) {
    const hasBoostTag = episodeTags.some(t => BOOST_TAGS.includes(t));
    if (hasBoostTag) {
      highlight.confidence = Math.min(1, highlight.confidence + 0.2);
      // Also boost segments
      if (highlight.segments?.create) {
        for (const seg of highlight.segments.create) {
          seg.confidence = Math.min(1, seg.confidence + 0.2);
        }
      }
    }
  }

  // Persist highlights
  let created = 0;
  for (const hl of highlights) {
    try {
      await prisma.highlight.create({
        data: {
          episodeId: episode.id,
          title: hl.title,
          description: hl.description,
          startTime: hl.startTime,
          endTime: hl.endTime,
          confidence: hl.confidence,
          status: hl.status,
          tags: hl.tags,
          segments: hl.segments,
        },
      });
      created++;
    } catch (err) {
      console.error(`[HighlightDetection] Failed to create highlight for episode ${episode.id}: ${err.message}`);
    }
  }

  return created;
}

/**
 * Run detection for all episodes that don't already have highlights.
 * Used for backfill and scheduled runs.
 */
export async function runDetectionForAllPending(prisma) {
  try {
    const episodes = await prisma.episode.findMany({
      where: {
        audioUrl: { not: '' },
        // Only episodes without any highlights
        highlights: { none: {} },
      },
      take: 50, // Process in batches to avoid memory issues
      orderBy: { publishedAt: 'desc' },
    });

    console.log(`[HighlightDetection] Processing ${episodes.length} episodes without highlights...`);

    let totalCreated = 0;
    for (const episode of episodes) {
      const count = await detectHighlightsForEpisode(prisma, episode);
      totalCreated += count;
    }

    console.log(`[HighlightDetection] Completed — ${totalCreated} highlights created across ${episodes.length} episodes`);
    return { episodesProcessed: episodes.length, highlightsCreated: totalCreated };
  } catch (err) {
    console.error('[HighlightDetection] Batch detection failed:', err.message);
    throw err;
  }
}

/**
 * Start the highlight detection cron job (every 30 minutes)
 */
export function startHighlightDetectionJob(prisma) {
  cron.schedule('*/30 * * * *', async () => {
    console.log('[HighlightDetection] Cron tick — starting detection...');
    try {
      await runDetectionForAllPending(prisma);
    } catch (err) {
      console.error('[HighlightDetection] Cron job failed:', err.message);
    }
  });

  console.log('[HighlightDetection] Cron scheduled: every 30 minutes');
}
