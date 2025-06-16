// 서버 → 클라이언트 태그 변환 매핑
export const TECH_TAG_LABELS: Record<string, string> = {
  // Frontend
  JAVASCRIPT: "JavaScript",
  TYPESCRIPT: "TypeScript",
  REACT: "React",
  ANGULAR: "Angular",
  NEXT_JS: "Next.js",
  VUE_JS: "Vue.js",
  TAILWIND: "Tailwind",
  BOOTSTRAP: "Bootstrap",
  HTML: "HTML",
  CSS: "CSS",
  SASS: "SASS",

  // Backend
  NODE_JS: "Node.js",
  EXPRESS: "Express",
  NEST_JS: "NestJS",
  SPRING: "Spring",
  DJANGO: "Django",
  FLASK: "Flask",
  JAVA: "Java",
  PYTHON: "Python",
  C_SHARP: "C#",
  PHP: "PHP",
  GO: "Go",
  RUST: "Rust",
  RUBY: "Ruby",

  // Database
  MYSQL: "MySQL",
  POSTGRESQL: "PostgreSQL",
  MONGODB: "MongoDB",
  NOSQL: "NoSQL",
  SQL: "SQL",

  // Cloud & DevOps
  AWS: "AWS",
  GCP: "GCP",
  AZURE: "Azure",
  DOCKER: "Docker",
  KUBERNETES: "Kubernetes",
  CI_CD: "CI/CD",
  DEVOPS: "DevOps",
  GIT: "Git",
  GITHUB: "GitHub",
  GITLAB: "GitLab",

  // Etc
  REST_API: "REST API",
  GRAPHQL: "GraphQL",
  TESTING: "Testing",
  TDD: "TDD",
  DATA_STRUCTURE: "Data Structure",
  ALGORITHM: "Algorithm",
  MACHINE_LEARNING: "Machine Learning",
  AI: "AI",
  BLOCKCHAIN: "Blockchain",

  // Mobile
  MOBILE: "Mobile",
  IOS: "iOS",
  ANDROID: "Android",
  REACT_NATIVE: "React Native",
  FLUTTER: "Flutter"
};

// 클라이언트에서 사용할 태그 목록
export const AVAILABLE_TECH_TAGS = Object.values(TECH_TAG_LABELS);

// 태그 변환 함수 (클라이언트 → 서버)
export function toServerTechTag(label: string): string {
  // 클라이언트의 태그를 서버의 TechTag enum 값으로 변환
  const serverTag = Object.entries(TECH_TAG_LABELS).find(([_, value]) => value === label)?.[0];
  if (!serverTag) {
    throw new Error(`Invalid tech tag: ${label}`);
  }
  return serverTag;
}

// 태그 변환 함수 (서버 → 클라이언트)
export function toClientTechTag(tag: string): string {
  return TECH_TAG_LABELS[tag] || tag;
} 