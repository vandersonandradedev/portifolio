import skillsConfig from '@/content/skills.json';
import type { Project, SkillCategory, SkillItem } from '@/lib/types';

type SkillsConfig = typeof skillsConfig;

const TECH_ALIASES: Record<string, string> = {
  HTML5: 'HTML',
  CSS3: 'CSS',
  Node: 'Node.js',
  Tailwind: 'Tailwind CSS'
};

function normalizeTech(name: string) {
  if (!name) return '';
  const trimmed = String(name).trim();
  return TECH_ALIASES[trimmed] || trimmed;
}

function collectProjectTechs(project: Project) {
  const techs = new Set<string>();
  (project.technologies || []).forEach((tech) => techs.add(normalizeTech(tech)));
  Object.keys(project.languages || {}).forEach((lang) =>
    techs.add(normalizeTech(lang))
  );
  return [...techs];
}

function calcPercentage(projectCount: number, totalProjects: number) {
  if (!projectCount) return 70;
  const ratio = projectCount / Math.max(totalProjects, 1);
  return Math.min(95, Math.max(55, Math.round(ratio * 100)));
}

export function buildSkillsFromProjects(projects: Project[]): SkillCategory[] {
  const config = skillsConfig as SkillsConfig;
  const totalProjects = projects.length;
  const usage = new Map<
    string,
    {
      name: string;
      category: string;
      tooltip: string;
      fallbackPercentage?: number;
      projectSlugs: Set<string>;
    }
  >();
  const hidden = new Set(config.hiddenLanguages || []);
  const groups = config.groups || {};
  const languageMeta = config.languageMeta || {};

  const register = (
    key: string,
    entry: { name: string; category: string; tooltip: string; fallbackPercentage?: number }
  ) => {
    if (!usage.has(key)) {
      usage.set(key, { ...entry, projectSlugs: new Set() });
    }
    return usage.get(key)!;
  };

  for (const project of projects) {
    const techs = collectProjectTechs(project);
    const slug = project.slug || project.title;

    for (const [groupKey, group] of Object.entries(groups)) {
      const match = (group as { match: string[] }).match.some((token) =>
        techs.includes(normalizeTech(token))
      );
      if (!match) continue;
      const item = register(`group:${groupKey}`, {
        name: (group as { name: string }).name,
        category: (group as { category: string }).category,
        tooltip: (group as { tooltip: string }).tooltip
      });
      item.projectSlugs.add(slug);
    }

    for (const tech of techs) {
      if (hidden.has(tech)) continue;
      const grouped = Object.entries(groups).find(([, group]) =>
        (group as { match: string[] }).match.some(
          (token) => normalizeTech(token) === tech
        )
      );
      if (grouped) continue;

      const meta = (languageMeta as Record<string, { name?: string; category?: string; tooltip?: string }>)[tech] || {};
      const item = register(`lang:${tech}`, {
        name: meta.name || tech,
        category: meta.category || 'frontend',
        tooltip: meta.tooltip || `${tech} detectado nos repositórios`
      });
      item.projectSlugs.add(slug);
    }
  }

  for (const manual of config.manualSkills || []) {
    const matchedSlugs = new Set<string>();
    for (const project of projects) {
      const techs = collectProjectTechs(project);
      const hit = (manual.match || [manual.name]).some((token) =>
        techs.includes(normalizeTech(token))
      );
      if (hit) matchedSlugs.add(project.slug || project.title);
    }

    const item = register(`manual:${manual.name}`, {
      name: manual.name,
      category: manual.category,
      tooltip: manual.tooltip,
      fallbackPercentage: manual.percentage
    });
    matchedSlugs.forEach((s) => item.projectSlugs.add(s));
  }

  const skills: SkillItem[] = [...usage.values()].map((item) => {
    const count = item.projectSlugs.size;
    const percentage = count
      ? calcPercentage(count, totalProjects)
      : item.fallbackPercentage || 70;

    return {
      name: item.name,
      category: item.category,
      percentage,
      tooltip: count
        ? `${item.tooltip} · Usado em ${count} de ${totalProjects} projetos`
        : item.tooltip,
      auto: count > 0
    };
  });

  const categoryMap = new Map(
    (config.categories || []).map((category) => [
      category.id,
      { ...category, skills: [] as SkillItem[] }
    ])
  );

  for (const skill of skills) {
    const bucket = categoryMap.get(skill.category);
    if (!bucket) continue;

    const existing = bucket.skills.find(
      (s) => s.name.toLowerCase() === skill.name.toLowerCase()
    );

    if (existing) {
      existing.percentage = Math.max(existing.percentage, skill.percentage);
      existing.auto = existing.auto || skill.auto;
      if (skill.auto && skill.tooltip.length > existing.tooltip.length) {
        existing.tooltip = skill.tooltip;
      }
      continue;
    }

    bucket.skills.push(skill);
  }

  for (const category of categoryMap.values()) {
    category.skills.sort((a, b) => {
      if (b.percentage !== a.percentage) return b.percentage - a.percentage;
      return a.name.localeCompare(b.name, 'pt-BR');
    });
  }

  return [...categoryMap.values()].filter((c) => c.skills.length > 0);
}
