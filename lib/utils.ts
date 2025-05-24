import { mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const techMappings: Record<string, string> = {
  react: "react",
  typescript: "typescript",
  javascript: "javascript",
  nodejs: "nodejs",
  nextjs: "nextjs",
  vue: "vuejs",
  angular: "angularjs",
  python: "python",
  java: "java",
  csharp: "csharp",
  php: "php",
  ruby: "ruby",
  go: "go",
  rust: "rust",
  swift: "swift",
  kotlin: "kotlin",
  flutter: "flutter",
  dart: "dart",
  docker: "docker",
  kubernetes: "kubernetes",
  aws: "amazonwebservices",
  azure: "azure",
  gcp: "googlecloud",
  mongodb: "mongodb",
  postgresql: "postgresql",
  mysql: "mysql",
  redis: "redis",
  graphql: "graphql",
  firebase: "firebase",
  git: "git",
  github: "github",
  gitlab: "gitlab",
  bitbucket: "bitbucket",
  jenkins: "jenkins",
  circleci: "circleci",
  travisci: "travisci",
  html: "html5",
  css: "css3",
  sass: "sass",
  less: "less",
  tailwind: "tailwindcss",
  bootstrap: "bootstrap",
  materialui: "materialui",
  webpack: "webpack",
  babel: "babel",
  eslint: "eslint",
  jest: "jest",
  cypress: "cypress",
  selenium: "selenium",
  figma: "figma",
  sketch: "sketch",
  adobexd: "xd",
  photoshop: "photoshop",
  illustrator: "illustrator",
};

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return techMappings[key] || key;
};

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
};

export const getTechLogos = async (techArray: string[]) => {
  if (!techArray?.length) return [];
  
  const logoURLs = techArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech,
      url: (await checkIconExists(url)) ? url : "/tech.svg",
    }))
  );

  return results;
};

export const getInitialsFromRole = (role: string) => {
  // Split the role into words and get initials
  const words = role.split(' ');
  if (words.length === 1) {
    // For single word, take first two letters
    return role.slice(0, 2).toUpperCase();
  }
  // For multiple words, take first letter of first two words
  return words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
};
