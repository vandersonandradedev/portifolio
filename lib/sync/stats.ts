import type { Project, ProjectStatsMap } from '@/lib/types';

const VISITOR_KEY = 'portfolio_visitor_id';
const LIKED_PREFIX = 'portfolio_liked_';
const LOCAL_STATS_PREFIX = 'portfolio_stats_';

export function getVisitorId() {
  if (typeof window === 'undefined') return 'ssr';
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export function hasLikedLocally(slug: string) {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(`${LIKED_PREFIX}${slug}`) === 'true';
}

function saveLocalStats(slug: string, stats: { likes: number; views: number }) {
  localStorage.setItem(`${LOCAL_STATS_PREFIX}${slug}`, JSON.stringify(stats));
}

function readLocalStats(slug: string) {
  try {
    const raw = localStorage.getItem(`${LOCAL_STATS_PREFIX}${slug}`);
    return raw ? (JSON.parse(raw) as { likes: number; views: number }) : { likes: 0, views: 0 };
  } catch {
    return { likes: 0, views: 0 };
  }
}

export async function fetchAllStats(): Promise<ProjectStatsMap> {
  try {
    const response = await fetch('/api/stats');
    if (!response.ok) return {};
    return (await response.json()) as ProjectStatsMap;
  } catch {
    return {};
  }
}

export function applyStatsToProjects(
  projects: Project[],
  remote: ProjectStatsMap | null
): Project[] {
  return projects.map((project) => {
    const slug = project.slug;
    const remoteStats = remote?.[slug];
    const local = typeof window !== 'undefined' ? readLocalStats(slug) : { likes: 0, views: 0 };
    return {
      ...project,
      likes: remoteStats?.likes ?? local.likes ?? project.likes ?? 0,
      views: remoteStats?.views ?? local.views ?? project.views ?? 0
    };
  });
}

export async function recordView(slug: string) {
  try {
    const response = await fetch('/api/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, action: 'view' })
    });
    if (!response.ok) {
      const local = readLocalStats(slug);
      const next = { ...local, views: local.views + 1 };
      saveLocalStats(slug, next);
      return { success: true, slug, ...next };
    }
    const data = await response.json();
    saveLocalStats(slug, { likes: data.likes, views: data.views });
    return data;
  } catch {
    const local = readLocalStats(slug);
    const next = { ...local, views: local.views + 1 };
    saveLocalStats(slug, next);
    return { success: true, slug, ...next };
  }
}

export async function recordLike(slug: string) {
  if (hasLikedLocally(slug)) {
    return { success: false, alreadyLiked: true, ...readLocalStats(slug) };
  }

  try {
    const response = await fetch('/api/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        action: 'like',
        visitorId: getVisitorId()
      })
    });

    if (!response.ok) {
      const local = readLocalStats(slug);
      const next = { ...local, likes: local.likes + 1 };
      saveLocalStats(slug, next);
      localStorage.setItem(`${LIKED_PREFIX}${slug}`, 'true');
      return { success: true, slug, ...next };
    }

    const data = await response.json();
    if (data.success !== false) {
      localStorage.setItem(`${LIKED_PREFIX}${slug}`, 'true');
    }
    saveLocalStats(slug, { likes: data.likes, views: data.views });
    return data;
  } catch {
    const local = readLocalStats(slug);
    const next = { ...local, likes: local.likes + 1 };
    saveLocalStats(slug, next);
    localStorage.setItem(`${LIKED_PREFIX}${slug}`, 'true');
    return { success: true, slug, ...next };
  }
}
