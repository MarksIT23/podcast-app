import RssParser from 'rss-parser';
import cron from 'node-cron';

const rssParser = new RssParser();

let supabase = null;
try {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (supabaseUrl && supabaseKey) {
    const { createClient } = await import('@supabase/supabase-js');
    supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
  }
} catch {
  /* supabase not available */
}

/**
 * Sync a parsed RSS feed to Supabase (podcast + episodes) — optional.
 */
async function syncToSupabase(feed, parsed) {
  if (!supabase) return;
  // Ensure category exists in Supabase
  let categoryId = null;
  if (feed.category) {
    const { data: existingCat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', feed.category.toLowerCase().replace(/\s+/g, '-'))
      .maybeSingle();

    if (existingCat) {
      categoryId = existingCat.id;
    } else {
      const { data: newCat } = await supabase
        .from('categories')
        .insert({ name: feed.category, slug: feed.category.toLowerCase().replace(/\s+/g, '-') })
        .select('id')
        .single();
      if (newCat) categoryId = newCat.id;
    }
  }

  // Upsert podcast
  const podcastData = {
    title: parsed.title || 'Untitled',
    description: parsed.description || null,
    author: parsed.itunes?.author || null,
    image_url: parsed.image?.url || null,
    feed_url: feed.url,
    website_url: parsed.link || null,
    category_id: categoryId,
    language: parsed.language || 'en',
    explicit: parsed.itunes?.explicit === 'yes',
    updated_at: new Date().toISOString(),
  };

  const { data: existingPodcast } = await supabase
    .from('podcasts')
    .select('id')
    .eq('feed_url', feed.url)
    .maybeSingle();

  let podcastSupabaseId;
  if (existingPodcast) {
    await supabase.from('podcasts').update(podcastData).eq('id', existingPodcast.id);
    podcastSupabaseId = existingPodcast.id;
  } else {
    const { data: newPodcast } = await supabase
      .from('podcasts')
      .insert(podcastData)
      .select('id')
      .single();
    podcastSupabaseId = newPodcast?.id;
  }

  if (!podcastSupabaseId) {
    console.warn(`[Supabase] Failed to create/update podcast for feed "${feed.url}"`);
    return;
  }

  // Upsert episodes
  for (const item of parsed.items || []) {
    const audioUrl = item.enclosure?.url || item.link;
    if (!audioUrl) continue;

    const guid = item.guid || item.link || item.title;

    // Check if episode exists by guid + podcast_id
    const { data: existingEp } = await supabase
      .from('episodes')
      .select('id')
      .eq('podcast_id', podcastSupabaseId)
      .eq('guid', guid)
      .maybeSingle();

    const epData = {
      podcast_id: podcastSupabaseId,
      title: item.title || 'Untitled',
      description: item.contentSnippet || null,
      audio_url: audioUrl,
      duration: item.itunes?.duration ? parseInt(item.itunes.duration) : null,
      published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
      season: item.itunes?.season ? parseInt(item.itunes.season) : null,
      episode_number: item.itunes?.episode ? parseInt(item.itunes.episode) : null,
      image_url: item.itunes?.image || null,
      guid,
    };

    if (existingEp) {
      await supabase.from('episodes').update(epData).eq('id', existingEp.id);
    } else {
      await supabase.from('episodes').insert(epData);
    }
  }
}

/**
 * Ingest a single RSS feed: parse XML, store in SQLite + Supabase
 */
export async function ingestFeed(prisma, feed) {
  const job = await prisma.job.create({
    data: { feedId: feed.id, status: 'running' },
  });

  try {
    const parsed = await rssParser.parseURL(feed.url);
    let ingestedCount = 0;

    for (const item of parsed.items || []) {
      const audioUrl = item.enclosure?.url || item.link;
      if (!audioUrl) continue;

      const episodeId = `${feed.id}-${item.guid || item.link || item.title}`;

      await prisma.episode.upsert({
        where: { id: episodeId },
        update: {
          title: item.title || 'Untitled',
          description: item.contentSnippet || null,
          audioUrl,
          duration: item.itunes?.duration ? parseInt(item.itunes.duration) : null,
          publishedAt: item.pubDate ? new Date(item.pubDate) : null,
        },
        create: {
          id: episodeId,
          feedId: feed.id,
          title: item.title || 'Untitled',
          description: item.contentSnippet || null,
          audioUrl,
          duration: item.itunes?.duration ? parseInt(item.itunes.duration) : null,
          publishedAt: item.pubDate ? new Date(item.pubDate) : null,
          rawData: JSON.stringify(item),
        },
      });
      ingestedCount++;
    }

    // Sync to Supabase
    try {
      await syncToSupabase(feed, parsed);
      console.log(`[Supabase] Feed "${feed.url}" synced successfully`);
    } catch (syncErr) {
      console.error(`[Supabase] Feed "${feed.url}" sync failed: ${syncErr.message}`);
    }

    // Update job as success
    await prisma.job.update({
      where: { id: job.id },
      data: { status: 'success', message: `${ingestedCount} episodes ingested` },
    });

    // Update feed timestamp
    await prisma.feed.update({
      where: { id: feed.id },
      data: { lastFetched: new Date(), status: 'active' },
    });

    // Notify gateway
    try {
      const gatewayUrl = process.env.GATEWAY_URL || 'http://localhost:3100';
      await fetch(`${gatewayUrl}/webhook/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedId: feed.id, feedUrl: feed.url, episodesCount: ingestedCount }),
      });
    } catch {
      // Gateway notification is best-effort
    }

    console.log(`[Ingestion] Feed "${feed.url}": ${ingestedCount} episodes ingested`);
  } catch (err) {
    // Update job as failed
    await prisma.job.update({
      where: { id: job.id },
      data: { status: 'error', message: err.message },
    });

    // Check for consecutive failures to suspend feed
    const recentErrors = await prisma.job.count({
      where: { feedId: feed.id, status: 'error' },
    });

    if (recentErrors >= 5) {
      await prisma.feed.update({
        where: { id: feed.id },
        data: { status: 'suspended' },
      });
      console.warn(`[Ingestion] Feed "${feed.url}" suspended after ${recentErrors} consecutive failures`);
    }

    console.error(`[Ingestion] Feed "${feed.url}" failed: ${err.message}`);
  }
}

/**
 * Start the RSS ingestion cron job (every 15 minutes)
 */
export function startIngestionJob(prisma) {
  cron.schedule('*/15 * * * *', async () => {
    console.log('[Ingestion] Cron tick — starting feed ingestion...');
    try {
      const feeds = await prisma.feed.findMany({
        where: { status: { in: ['active', 'failed', 'pending'] } },
      });

      console.log(`[Ingestion] Processing ${feeds.length} feeds...`);

      for (const feed of feeds) {
        await ingestFeed(prisma, feed);
      }

      console.log(`[Ingestion] Completed — ${feeds.length} feeds processed`);
    } catch (err) {
      console.error('[Ingestion] Cron job failed:', err.message);
    }
  });

  console.log('[Ingestion] Cron scheduled: every 15 minutes');
}
