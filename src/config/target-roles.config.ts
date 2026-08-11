// ============================================================
// ResumeForge — Target Role Profiles Configuration
// ============================================================

import type { SectionKey } from "@/types/resume.types";

// --- Target Role ID Union ---

export type TargetRole =
  | "software-engineer"
  | "full-stack-developer"
  | "frontend-developer"
  | "backend-developer"
  | "react-developer"
  | "nextjs-developer"
  | "nodejs-developer"
  | "python-developer"
  | "java-developer"
  | "ai-ml-engineer"
  | "data-analyst"
  | "data-scientist"
  | "devops-engineer"
  | "cloud-engineer"
  | "cyber-security-engineer"
  | "ui-ux-designer"
  | "product-manager";

// --- Target Role Profile ---

export interface TargetRoleProfile {
  id: TargetRole;
  label: string;
  emoji: string;
  description: string;
  coreSkills: string[];
  secondarySkills: string[];
  importantKeywords: string[];
  importantSections: SectionKey[];
  sectionPriority: SectionKey[];
}

// --- All Target Roles ---

export const TARGET_ROLES: TargetRoleProfile[] = [
  {
    id: "software-engineer",
    label: "Software Engineer",
    emoji: "⚙️",
    description: "General-purpose software engineering across systems and applications",
    coreSkills: ["JavaScript", "TypeScript", "Python", "Java", "C++", "Data Structures", "Algorithms", "Git", "SQL", "REST APIs"],
    secondarySkills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Testing", "Redis", "GraphQL", "Linux"],
    importantKeywords: ["Software Engineer", "Full Lifecycle Development", "System Design", "Code Review", "Agile", "Scalability", "Performance Optimization", "Unit Testing", "CI/CD Pipeline", "Microservices"],
    importantSections: ["summary", "experience", "skills", "projects"],
    sectionPriority: ["personalInfo", "summary", "experience", "skills", "projects", "education", "certifications", "achievements", "languages", "interests", "volunteer", "publications", "references"],
  },
  {
    id: "full-stack-developer",
    label: "Full Stack Developer",
    emoji: "💻",
    description: "End-to-end web development covering frontend and backend",
    coreSkills: ["React", "Next.js", "JavaScript", "TypeScript", "Node.js", "Express", "REST APIs", "MongoDB", "SQL", "Git"],
    secondarySkills: ["Docker", "AWS", "Redis", "CI/CD", "Testing", "GraphQL", "Tailwind CSS", "PostgreSQL"],
    importantKeywords: ["Full Stack", "REST API", "Authentication", "Database", "Responsive Design", "API Integration", "Deployment", "Performance", "CRUD", "MVC"],
    importantSections: ["summary", "skills", "projects", "experience"],
    sectionPriority: ["personalInfo", "summary", "experience", "skills", "projects", "education", "certifications", "achievements", "languages", "interests", "volunteer", "publications", "references"],
  },
  {
    id: "frontend-developer",
    label: "Frontend Developer",
    emoji: "🎨",
    description: "Building user interfaces and interactive web experiences",
    coreSkills: ["React", "JavaScript", "TypeScript", "HTML", "CSS", "Next.js", "Tailwind CSS", "Responsive Design", "Git", "REST APIs"],
    secondarySkills: ["Vue.js", "Angular", "SASS", "Webpack", "Figma", "Testing", "GraphQL", "Storybook", "Accessibility"],
    importantKeywords: ["Frontend", "UI/UX", "Responsive Design", "Component Architecture", "State Management", "Performance Optimization", "Cross-Browser", "Accessibility", "SPA", "PWA"],
    importantSections: ["summary", "skills", "projects", "experience"],
    sectionPriority: ["personalInfo", "summary", "skills", "projects", "experience", "education", "certifications", "achievements", "languages", "interests", "volunteer", "publications", "references"],
  },
  {
    id: "backend-developer",
    label: "Backend Developer",
    emoji: "🔧",
    description: "Server-side architecture, APIs, and database systems",
    coreSkills: ["Node.js", "Python", "Java", "SQL", "REST APIs", "PostgreSQL", "MongoDB", "Express", "Git", "Docker"],
    secondarySkills: ["Kubernetes", "Redis", "GraphQL", "AWS", "CI/CD", "RabbitMQ", "Kafka", "Nginx", "Linux"],
    importantKeywords: ["Backend", "API Design", "Database Design", "Microservices", "Scalability", "Authentication", "Caching", "Message Queue", "Server Architecture", "Data Modeling"],
    importantSections: ["summary", "experience", "skills", "projects"],
    sectionPriority: ["personalInfo", "summary", "experience", "skills", "projects", "education", "certifications", "achievements", "languages", "interests", "volunteer", "publications", "references"],
  },
  {
    id: "react-developer",
    label: "React Developer",
    emoji: "⚛️",
    description: "Specialized in React ecosystem and modern UI development",
    coreSkills: ["React", "JavaScript", "TypeScript", "Redux", "React Router", "Hooks", "Context API", "CSS-in-JS", "HTML", "Git"],
    secondarySkills: ["Next.js", "Tailwind CSS", "Testing Library", "Storybook", "GraphQL", "REST APIs", "Webpack", "Vite"],
    importantKeywords: ["React", "Component Architecture", "State Management", "Hooks", "Virtual DOM", "JSX", "SPA", "Performance", "Reusable Components", "Custom Hooks"],
    importantSections: ["summary", "skills", "projects", "experience"],
    sectionPriority: ["personalInfo", "summary", "skills", "projects", "experience", "education", "certifications", "achievements", "languages", "interests", "volunteer", "publications", "references"],
  },
  {
    id: "nextjs-developer",
    label: "Next.js Developer",
    emoji: "▲",
    description: "Server-side rendering, app router, and full-stack Next.js",
    coreSkills: ["Next.js", "React", "TypeScript", "Node.js", "Tailwind CSS", "REST APIs", "Server Components", "App Router", "Git", "Vercel"],
    secondarySkills: ["Prisma", "PostgreSQL", "MongoDB", "GraphQL", "tRPC", "Zustand", "Testing", "Docker"],
    importantKeywords: ["Next.js", "SSR", "SSG", "ISR", "App Router", "Server Components", "API Routes", "SEO", "Performance", "Full Stack"],
    importantSections: ["summary", "skills", "projects", "experience"],
    sectionPriority: ["personalInfo", "summary", "skills", "projects", "experience", "education", "certifications", "achievements", "languages", "interests", "volunteer", "publications", "references"],
  },
  {
    id: "nodejs-developer",
    label: "Node.js Developer",
    emoji: "🟢",
    description: "Server-side JavaScript, APIs, and real-time applications",
    coreSkills: ["Node.js", "Express", "JavaScript", "TypeScript", "MongoDB", "REST APIs", "SQL", "Git", "npm", "Docker"],
    secondarySkills: ["NestJS", "Socket.io", "Redis", "GraphQL", "AWS", "Kubernetes", "RabbitMQ", "Testing"],
    importantKeywords: ["Node.js", "Express", "API Development", "Middleware", "Authentication", "WebSockets", "Real-time", "Microservices", "Event-Driven", "npm"],
    importantSections: ["summary", "experience", "skills", "projects"],
    sectionPriority: ["personalInfo", "summary", "experience", "skills", "projects", "education", "certifications", "achievements", "languages", "interests", "volunteer", "publications", "references"],
  },
  {
    id: "python-developer",
    label: "Python Developer",
    emoji: "🐍",
    description: "Python applications, automation, and data processing",
    coreSkills: ["Python", "Django", "Flask", "SQL", "REST APIs", "Git", "PostgreSQL", "Docker", "Linux", "pip"],
    secondarySkills: ["FastAPI", "Celery", "Redis", "AWS", "NumPy", "Pandas", "Testing", "CI/CD"],
    importantKeywords: ["Python", "Django", "Flask", "API Development", "Automation", "Scripting", "OOP", "Data Processing", "Backend", "Database"],
    importantSections: ["summary", "experience", "skills", "projects"],
    sectionPriority: ["personalInfo", "summary", "experience", "skills", "projects", "education", "certifications", "achievements", "languages", "interests", "volunteer", "publications", "references"],
  },
  {
    id: "java-developer",
    label: "Java Developer",
    emoji: "☕",
    description: "Enterprise Java applications and microservices",
    coreSkills: ["Java", "Spring Boot", "SQL", "Hibernate", "Maven", "REST APIs", "Git", "JUnit", "Docker", "PostgreSQL"],
    secondarySkills: ["Kubernetes", "Kafka", "Redis", "AWS", "Microservices", "Jenkins", "Gradle", "MongoDB"],
    importantKeywords: ["Java", "Spring Boot", "Enterprise", "Microservices", "JPA", "REST API", "MVC", "Design Patterns", "Multi-Threading", "JVM"],
    importantSections: ["summary", "experience", "skills", "certifications"],
    sectionPriority: ["personalInfo", "summary", "experience", "skills", "projects", "education", "certifications", "achievements", "languages", "interests", "volunteer", "publications", "references"],
  },
  {
    id: "ai-ml-engineer",
    label: "AI/ML Engineer",
    emoji: "🤖",
    description: "Machine learning models, AI systems, and data pipelines",
    coreSkills: ["Python", "TensorFlow", "PyTorch", "scikit-learn", "NumPy", "Pandas", "SQL", "Git", "Jupyter", "Machine Learning"],
    secondarySkills: ["Deep Learning", "NLP", "Computer Vision", "Docker", "AWS SageMaker", "MLflow", "Hugging Face", "LLMs"],
    importantKeywords: ["Machine Learning", "Deep Learning", "Neural Network", "Model Training", "Feature Engineering", "Data Pipeline", "NLP", "Computer Vision", "Model Deployment", "AI"],
    importantSections: ["summary", "experience", "skills", "projects", "publications"],
    sectionPriority: ["personalInfo", "summary", "experience", "skills", "projects", "publications", "education", "certifications", "achievements", "languages", "interests", "volunteer", "references"],
  },
  {
    id: "data-analyst",
    label: "Data Analyst",
    emoji: "📊",
    description: "Data analysis, visualization, and business insights",
    coreSkills: ["SQL", "Python", "Excel", "Tableau", "Power BI", "Pandas", "Statistics", "Data Visualization", "Git", "Google Analytics"],
    secondarySkills: ["R", "Looker", "BigQuery", "ETL", "A/B Testing", "Jupyter", "NumPy", "Matplotlib"],
    importantKeywords: ["Data Analysis", "Business Intelligence", "Dashboard", "KPI", "Reporting", "SQL", "Visualization", "Insights", "Trend Analysis", "Data-Driven"],
    importantSections: ["summary", "experience", "skills", "certifications"],
    sectionPriority: ["personalInfo", "summary", "experience", "skills", "projects", "education", "certifications", "achievements", "languages", "interests", "volunteer", "publications", "references"],
  },
  {
    id: "data-scientist",
    label: "Data Scientist",
    emoji: "🔬",
    description: "Statistical modeling, predictive analytics, and data engineering",
    coreSkills: ["Python", "R", "SQL", "Machine Learning", "Statistics", "Pandas", "NumPy", "scikit-learn", "Jupyter", "Data Visualization"],
    secondarySkills: ["TensorFlow", "PyTorch", "Spark", "AWS", "Docker", "A/B Testing", "Deep Learning", "NLP"],
    importantKeywords: ["Data Science", "Predictive Modeling", "Statistical Analysis", "Machine Learning", "Feature Engineering", "Hypothesis Testing", "Data Pipeline", "Business Insights", "Regression", "Classification"],
    importantSections: ["summary", "experience", "skills", "projects", "publications"],
    sectionPriority: ["personalInfo", "summary", "experience", "skills", "projects", "publications", "education", "certifications", "achievements", "languages", "interests", "volunteer", "references"],
  },
  {
    id: "devops-engineer",
    label: "DevOps Engineer",
    emoji: "🚀",
    description: "CI/CD, infrastructure automation, and cloud operations",
    coreSkills: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "Linux", "Git", "Jenkins", "Python", "Bash"],
    secondarySkills: ["Ansible", "Prometheus", "Grafana", "Azure", "GCP", "Helm", "ArgoCD", "Nginx"],
    importantKeywords: ["DevOps", "CI/CD", "Infrastructure as Code", "Container Orchestration", "Cloud Architecture", "Automation", "Monitoring", "Deployment Pipeline", "High Availability", "Scalability"],
    importantSections: ["summary", "experience", "skills", "certifications"],
    sectionPriority: ["personalInfo", "summary", "experience", "skills", "certifications", "projects", "education", "achievements", "languages", "interests", "volunteer", "publications", "references"],
  },
  {
    id: "cloud-engineer",
    label: "Cloud Engineer",
    emoji: "☁️",
    description: "Cloud infrastructure, migration, and architecture",
    coreSkills: ["AWS", "Azure", "GCP", "Terraform", "Docker", "Kubernetes", "Linux", "Networking", "Python", "Git"],
    secondarySkills: ["Ansible", "CloudFormation", "Serverless", "IAM", "VPC", "Load Balancing", "CDN", "Cost Optimization"],
    importantKeywords: ["Cloud Architecture", "AWS", "Infrastructure as Code", "Migration", "Serverless", "High Availability", "Security", "Cost Optimization", "Networking", "Scalability"],
    importantSections: ["summary", "experience", "skills", "certifications"],
    sectionPriority: ["personalInfo", "summary", "experience", "skills", "certifications", "projects", "education", "achievements", "languages", "interests", "volunteer", "publications", "references"],
  },
  {
    id: "cyber-security-engineer",
    label: "Cyber Security Engineer",
    emoji: "🔒",
    description: "Security architecture, threat analysis, and compliance",
    coreSkills: ["Network Security", "Penetration Testing", "SIEM", "Firewalls", "Linux", "Python", "Vulnerability Assessment", "Encryption", "IAM", "Compliance"],
    secondarySkills: ["Splunk", "Wireshark", "Burp Suite", "AWS Security", "OWASP", "SOC", "Incident Response", "Forensics"],
    importantKeywords: ["Cybersecurity", "Threat Analysis", "Penetration Testing", "Vulnerability Assessment", "Incident Response", "Compliance", "Risk Management", "Security Audit", "Zero Trust", "SIEM"],
    importantSections: ["summary", "experience", "skills", "certifications"],
    sectionPriority: ["personalInfo", "summary", "experience", "skills", "certifications", "education", "projects", "achievements", "languages", "interests", "volunteer", "publications", "references"],
  },
  {
    id: "ui-ux-designer",
    label: "UI/UX Designer",
    emoji: "🎨",
    description: "User interface design, user research, and prototyping",
    coreSkills: ["Figma", "Adobe XD", "User Research", "Wireframing", "Prototyping", "Design Systems", "UI Design", "UX Design", "HTML", "CSS"],
    secondarySkills: ["Sketch", "InVision", "Usability Testing", "Information Architecture", "Interaction Design", "Adobe Illustrator", "Responsive Design", "Accessibility"],
    importantKeywords: ["UI/UX", "User-Centered Design", "Wireframes", "Prototyping", "Design System", "User Research", "Usability", "Interaction Design", "Visual Design", "Accessibility"],
    importantSections: ["summary", "experience", "projects", "skills"],
    sectionPriority: ["personalInfo", "summary", "experience", "projects", "skills", "education", "certifications", "achievements", "languages", "interests", "volunteer", "publications", "references"],
  },
  {
    id: "product-manager",
    label: "Product Manager",
    emoji: "📋",
    description: "Product strategy, roadmaps, and cross-functional leadership",
    coreSkills: ["Product Strategy", "Roadmapping", "Agile", "Scrum", "User Stories", "Stakeholder Management", "Analytics", "Market Research", "Jira", "SQL"],
    secondarySkills: ["A/B Testing", "Data Analysis", "Figma", "Competitive Analysis", "Customer Interviews", "OKRs", "Prioritization Frameworks", "Technical Communication"],
    importantKeywords: ["Product Management", "Roadmap", "Stakeholder", "User Story", "Sprint Planning", "Product-Market Fit", "Go-to-Market", "Metrics", "Cross-Functional", "Prioritization"],
    importantSections: ["summary", "experience", "skills", "achievements"],
    sectionPriority: ["personalInfo", "summary", "experience", "skills", "achievements", "education", "certifications", "projects", "languages", "interests", "volunteer", "publications", "references"],
  },
];

// --- O(1) Lookup Map ---

export const TARGET_ROLE_MAP: Record<TargetRole, TargetRoleProfile> = Object.fromEntries(
  TARGET_ROLES.map((role) => [role.id, role])
) as Record<TargetRole, TargetRoleProfile>;
