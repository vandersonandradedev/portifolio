import type { GithubRepo, Project, ProjectOverride, ProjectsConfig } from '@/lib/types';
import projectsConfig from '@/content/projects.json';
import { loadGithubBundle } from '@/lib/sync/github';

const VERCEL_PATTERN = /vercel\.app|vercel\.com/i;

const GRADIENTS = [
  'linear-gradient(135deg, #0d9488 0%, #134e4a 100%)',
  'linear-gradient(135deg, #0891b2 0%, #164e63 100%)',
  'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)',
  'linear-gradient(135deg, #0f766e 0%, #042f2e 100%)',
  'linear-gradient(135deg, #155e75 0%, #083344 100%)',
  'linear-gradient(135deg, #1d4ed8 0%, #172554 100%)'
];

const HIDDEN_LANGUAGES = new Set([
  'Dockerfile',
  'Shell',
  'PowerShell',
  'Batchfile',
  'Nix'
]);

function formatRepoTitle(name: string) {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function inferCategory(repoName: string, homepage: string | null) {
  const value = `${repoName} ${homepage || ''}`.toLowerCase();
  if (/dashboard|analytics|habit|metric/.test(value)) return 'dashboard';
  if (/landing|page|carros|alpha/.test(value)) return 'landing';
  return 'web';
}

function isVercelDeploy(homepage: string | null | undefined) {
  return Boolean(homepage && VERCEL_PATTERN.test(homepage));
}

function gradientForRepo(repoName: string) {
  let hash = 0;
  for (let i = 0; i < repoName.length; i++) {
    hash = repoName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function mergeTechnologies(
  languages: Record<string, number>,
  overrideTech?: string[]
) {
  const githubLangs = Object.keys(languages || {})
    .filter((lang) => !HIDDEN_LANGUAGES.has(lang))
    .sort((a, b) => languages[b] - languages[a]);

  if (overrideTech?.length) {
    const merged = [...overrideTech];
    const known = new Set(overrideTech.map((tech) => tech.toLowerCase()));
    for (const lang of githubLangs) {
      if (!known.has(lang.toLowerCase())) {
        merged.push(lang);
        known.add(lang.toLowerCase());
      }
    }
    return merged;
  }

  if (githubLangs.length) {
    return githubLangs.includes('Vercel') ? githubLangs : [...githubLangs, 'Vercel'];
  }

  return ['Vercel'];
}

function buildScreenshotUrl(liveUrl: string) {
  const normalized = liveUrl.replace(/\/$/, '');
  return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(`${normalized}/`)}?w=800`;
}

async function fetchVercelPreview(liveUrl: string): Promise<string> {
  try {
    const endpoint = `https://api.microlink.io?url=${encodeURIComponent(liveUrl)}&screenshot=true&meta=false&viewport=1280x720`;
    const response = await fetch(endpoint, { next: { revalidate: 43200 } });
    if (response.ok) {
      const payload = await response.json();
      const previewUrl =
        payload?.data?.screenshot?.url || payload?.data?.image?.url || null;
      if (previewUrl) return previewUrl;
    }
  } catch {
    // fallback
  }
  return buildScreenshotUrl(liveUrl);
}

export function getProjectsConfig(): ProjectsConfig {
  return projectsConfig as ProjectsConfig;
}

export async function fetchGithubBundle(username: string) {
  if (typeof window === 'undefined') {
    return loadGithubBundle(username);
  }

  const response = await fetch(
    `/api/github?username=${encodeURIComponent(username)}`
  );

  if (!response.ok) {
    throw new Error(`GitHub proxy: ${response.status}`);
  }

  return response.json() as Promise<{
    repos: GithubRepo[];
    languages: Record<string, Record<string, number>>;
  }>;
}

export async function syncProjects(): Promise<{
  projects: Project[];
  repoCount: number;
  source: 'github' | 'fallback';
}> {
  const config = getProjectsConfig();
  const username = config.githubUsername || 'VandinDev221';
  const excludeRepos = new Set(
    (config.excludeRepos || ['portifolio', 'portfolio']).map((n) => n.toLowerCase())
  );
  const overrideMap = new Map(
    (config.overrides || []).map((item) => [item.repo.toLowerCase(), item])
  );

  try {
    const { repos, languages: languagesMap = {} } = await fetchGithubBundle(username);

    const publicRepos = repos.filter((repo) => !repo.fork && !repo.private);
    const repoCount = publicRepos.filter(
      (repo) => !excludeRepos.has(repo.name.toLowerCase())
    ).length;

    const deployed = publicRepos
      .filter((repo) => !excludeRepos.has(repo.name.toLowerCase()))
      .filter((repo) => isVercelDeploy(repo.homepage))
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

    const projects = await Promise.all(
      deployed.map(async (repo, index) => {
        const override = overrideMap.get(repo.name.toLowerCase());
        return mergeProject(repo, override, languagesMap[repo.name] || {}, index);
      })
    );

    return { projects, repoCount, source: 'github' };
  } catch {
    // Sem GITHUB_TOKEN (ou rate limit): usa content/projects.json.
    // Não logar aqui — em RSC o warn vai para o console do browser.
    const projects = await Promise.all(
      (config.overrides || []).map(async (override, index) =>
        fallbackFromOverride(override, config.githubUsername, index)
      )
    );
    return { projects, repoCount: projects.length, source: 'fallback' };
  }
}

async function mergeProject(
  repo: GithubRepo,
  override: ProjectOverride | undefined,
  languages: Record<string, number>,
  index: number
): Promise<Project> {
  const liveUrl = override?.liveUrl || repo.homepage;
  const title = override?.title || formatRepoTitle(repo.name);
  const description =
    override?.description ||
    repo.description ||
    `Projeto ${title} publicado na Vercel.`;

  let image: string | null = null;
  let imageSource: Project['imageSource'] = 'gradient';
  const imageGradient = gradientForRepo(repo.name);

  if (liveUrl && isVercelDeploy(liveUrl)) {
    image = await fetchVercelPreview(liveUrl);
    imageSource = 'vercel';
  }

  return {
    id: repo.id || index + 1,
    slug: repo.name,
    title,
    description,
    longDescription: override?.longDescription || description,
    category: override?.category || inferCategory(repo.name, liveUrl),
    technologies: mergeTechnologies(languages, override?.technologies),
    languages,
    liveUrl,
    githubUrl: repo.html_url,
    featured: override?.featured ?? index < 3,
    image,
    imageGradient,
    imageSource,
    likes: 0,
    views: 0,
    updatedAt: repo.updated_at
  };
}

async function fallbackFromOverride(
  override: ProjectOverride,
  username: string,
  index: number
): Promise<Project> {
  const liveUrl = override.liveUrl || null;
  let image: string | null = null;
  let imageSource: Project['imageSource'] = 'gradient';
  const imageGradient = gradientForRepo(override.repo);

  if (liveUrl && isVercelDeploy(liveUrl)) {
    image = await fetchVercelPreview(liveUrl);
    imageSource = 'vercel';
  }

  return {
    id: index + 1,
    slug: override.repo,
    title: override.title || formatRepoTitle(override.repo),
    description: override.description || '',
    longDescription: override.longDescription || override.description || '',
    category: override.category || 'web',
    technologies: override.technologies || [],
    languages: {},
    liveUrl,
    githubUrl:
      override.githubUrl ||
      `https://github.com/${username}/${override.repo}`,
    featured: override.featured ?? false,
    image,
    imageGradient,
    imageSource,
    likes: 0,
    views: 0
  };
}
