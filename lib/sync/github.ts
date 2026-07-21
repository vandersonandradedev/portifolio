const GITHUB_API = 'https://api.github.com';

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
    next: { revalidate: 300 }
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`GitHub API ${response.status}: ${body.slice(0, 200)}`);
  }
  return response.json();
}

function slimRepo(repo: Record<string, unknown>) {
  return {
    id: repo.id as number,
    name: repo.name as string,
    full_name: repo.full_name as string,
    description: (repo.description as string | null) ?? null,
    homepage: (repo.homepage as string | null) ?? null,
    html_url: repo.html_url as string,
    language: (repo.language as string | null) ?? null,
    updated_at: repo.updated_at as string,
    fork: Boolean(repo.fork),
    private: Boolean(repo.private)
  };
}

export async function loadGithubBundle(username: string) {
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

  const languages: Record<string, Record<string, number>> = {};
  const targets = repos.filter((repo) => !repo.fork && !repo.private);

  await Promise.all(
    targets.map(async (repo) => {
      try {
        const data = await githubFetch(`/repos/${repo.full_name}/languages`);
        languages[repo.name] = data || {};
      } catch {
        languages[repo.name] = {};
      }
    })
  );

  return { repos, languages };
}
