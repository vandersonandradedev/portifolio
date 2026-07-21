export type ProjectOverride = {
  repo: string;
  title?: string;
  description?: string;
  longDescription?: string;
  category?: string;
  technologies?: string[];
  liveUrl?: string;
  featured?: boolean;
  githubUrl?: string;
};

export type ProjectsConfig = {
  githubUsername: string;
  excludeRepos: string[];
  overrides: ProjectOverride[];
};

export type GithubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  homepage: string | null;
  html_url: string;
  language: string | null;
  updated_at: string;
  fork: boolean;
  private: boolean;
};

export type Project = {
  id: number | string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  technologies: string[];
  languages: Record<string, number>;
  liveUrl: string | null;
  githubUrl: string;
  featured: boolean;
  image: string | null;
  imageGradient: string | null;
  imageSource: 'vercel' | 'gradient' | 'local';
  likes: number;
  views: number;
  updatedAt?: string;
};

export type SkillItem = {
  name: string;
  category: string;
  percentage: number;
  tooltip: string;
  auto: boolean;
};

export type SkillCategory = {
  id: string;
  title: string;
  icon: string;
  skills: SkillItem[];
};

export type Profile = {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  email: string;
  location: string;
  social: {
    github: string;
    linkedin: string;
    website: string;
    instagram: string;
    whatsapp: string;
  };
  stats: {
    projects: number;
    repos: number;
    experience: number;
  };
};

export type ExperienceItem = {
  id: number;
  type: string;
  title: string;
  company: string;
  period: string;
  description: string;
  technologies: string[];
};

export type ProjectStatsMap = Record<string, { likes: number; views: number }>;
