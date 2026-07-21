import { PortfolioApp } from '@/components/PortfolioApp';
import { syncProjects } from '@/lib/sync/projects';
import { buildSkillsFromProjects } from '@/lib/sync/skills';
import profile from '@/content/profile.json';
import experience from '@/content/experience.json';
import type { ExperienceItem, Profile } from '@/lib/types';

export const revalidate = 300;

export default async function HomePage() {
  const { projects, repoCount } = await syncProjects();
  const skillCategories = buildSkillsFromProjects(projects);

  return (
    <PortfolioApp
      profile={profile as Profile}
      projects={projects}
      repoCount={repoCount}
      skillCategories={skillCategories}
      experience={experience as ExperienceItem[]}
    />
  );
}
