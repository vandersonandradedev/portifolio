import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

const STATS_HASH = 'portfolio:project_stats';
const LIKES_SET_PREFIX = 'portfolio:likes:';

function getRedis() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return null;
  }
  return Redis.fromEnv();
}

function parseStatsHash(hash: Record<string, unknown> = {}) {
  const stats: Record<string, { likes: number; views: number }> = {};

  for (const [key, value] of Object.entries(hash)) {
    const separator = key.lastIndexOf(':');
    if (separator === -1) continue;

    const slug = key.slice(0, separator);
    const field = key.slice(separator + 1);

    if (!stats[slug]) {
      stats[slug] = { likes: 0, views: 0 };
    }

    if (field === 'likes' || field === 'views') {
      stats[slug][field] = Number(value) || 0;
    }
  }

  return stats;
}

async function readStatsForSlug(redis: Redis, slug: string) {
  const [likes, views] = await Promise.all([
    redis.hget(STATS_HASH, `${slug}:likes`),
    redis.hget(STATS_HASH, `${slug}:views`)
  ]);

  return {
    slug,
    likes: Number(likes) || 0,
    views: Number(views) || 0
  };
}

export async function GET() {
  const redis = getRedis();

  if (!redis) {
    return NextResponse.json(
      {
        error: 'Storage not configured',
        message:
          'Conecte o Upstash Redis ao projeto na Vercel para persistir visualizações e curtidas.'
      },
      { status: 503 }
    );
  }

  try {
    const hash = (await redis.hgetall(STATS_HASH)) as Record<string, unknown>;
    return NextResponse.json(parseStatsHash(hash || {}));
  } catch (error) {
    console.error('Erro na API de stats:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar estatísticas' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const redis = getRedis();

  if (!redis) {
    return NextResponse.json(
      {
        error: 'Storage not configured',
        message:
          'Conecte o Upstash Redis ao projeto na Vercel para persistir visualizações e curtidas.'
      },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { slug, action, visitorId } = body || {};

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Slug inválido' }, { status: 400 });
    }

    if (action === 'view') {
      await redis.hincrby(STATS_HASH, `${slug}:views`, 1);
      const stats = await readStatsForSlug(redis, slug);
      return NextResponse.json({ success: true, ...stats });
    }

    if (action === 'like') {
      if (!visitorId || typeof visitorId !== 'string') {
        return NextResponse.json({ error: 'visitorId obrigatório' }, { status: 400 });
      }

      const dedupKey = `${LIKES_SET_PREFIX}${slug}`;
      const added = await redis.sadd(dedupKey, visitorId);

      if (!added) {
        const stats = await readStatsForSlug(redis, slug);
        return NextResponse.json({
          success: false,
          alreadyLiked: true,
          ...stats
        });
      }

      await redis.hincrby(STATS_HASH, `${slug}:likes`, 1);
      const stats = await readStatsForSlug(redis, slug);
      return NextResponse.json({ success: true, ...stats });
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    console.error('Erro na API de stats:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar estatísticas' },
      { status: 500 }
    );
  }
}
