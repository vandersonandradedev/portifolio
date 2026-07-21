import { NextRequest, NextResponse } from 'next/server';

const GITHUB_API = 'https://api.github.com';
const CACHE_SECONDS = 300;

function githubHeaders() {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'VandinDev221-Portfolio'
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

async function githubFetch(path: string) {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: githubHeaders(),
    next: { revalidate: CACHE_SECONDS }
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`GitHub API ${response.status}: ${body.slice(0, 200)}`);
  }

  return response.json();
}

function slimRepo(repo: Record<string, unknown>) {
  return {
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    homepage: repo.homepage,
    html_url: repo.html_url,
    language: repo.language,
    updated_at: repo.updated_at,
    fork: repo.fork,
    private: repo.private
  };
}

async function fetchUserRepos(username: string) {
  const repos: ReturnType<typeof slimRepo>[] = [];
  let page = 1;

  while (page <= 5) {
    const batch = await githubFetch(
      `/users/${encodeURIComponent(username)}/repos?per_page=100&page=${page}&sort=updated`
    );
    if (!Array.isArray(batch) || batch.length === 0) break;
    repos.push(...batch.map(slimRepo));
    if (batch.length < 100) break;
    page += 1;
  }

  return repos;
}

async function fetchLanguagesMap(
  repos: { full_name: string; name: string; fork: boolean; private: boolean }[]
) {
  const languages: Record<string, Record<string, number>> = {};
  const targets = repos.filter((repo) => !repo.fork && !repo.private);

  await Promise.all(
    targets.map(async (repo) => {
      try {
        const data = await githubFetch(`/repos/${repo.full_name}/languages`);
        languages[repo.name] = data || {};
      } catch (error) {
        console.warn(`Falha ao buscar linguagens de ${repo.full_name}:`, error);
        languages[repo.name] = {};
      }
    })
  );

  return languages;
}

export async function GET(req: NextRequest) {
  const username = (req.nextUrl.searchParams.get('username') || 'VandinDev221').trim();

  if (!username) {
    return NextResponse.json({ error: 'username obrigatório' }, { status: 400 });
  }

  try {
    const repos = await fetchUserRepos(username);
    const languages = await fetchLanguagesMap(
      repos as { full_name: string; name: string; fork: boolean; private: boolean }[]
    );

    return NextResponse.json(
      {
        username,
        repos,
        languages,
        cachedAt: new Date().toISOString()
      },
      {
        headers: {
          'Cache-Control': `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=600`
        }
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro';
    const isRateLimit = /403|429/.test(message);
    return NextResponse.json(
      {
        error: isRateLimit ? 'Limite da API GitHub atingido' : 'Erro ao consultar GitHub',
        message
      },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}
