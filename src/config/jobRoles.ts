export type JobRole = {
  id: string;
  title: string;
  category: string;
  aliases?: string[];
  keywords?: string[];
  popular?: boolean;
};

export const JOB_ROLES: JobRole[] = [
  // TECHNOLOGY & SOFTWARE
  { id: "software-engineer", title: "Software Engineer", category: "Technology & Software", aliases: ["Software Developer", "SDE"], keywords: ["coding", "programming", "software"], popular: true },
  { id: "full-stack-developer", title: "Full Stack Developer", category: "Technology & Software", aliases: ["Fullstack Developer", "Full Stack Engineer"], keywords: ["frontend", "backend", "web"], popular: true },
  { id: "frontend-developer", title: "Frontend Developer", category: "Technology & Software", aliases: ["Front End Developer", "Frontend Engineer", "UI Developer", "React Developer", "Vue Developer"], keywords: ["web", "ui", "browser", "react", "vue", "angular"], popular: true },
  { id: "backend-developer", title: "Backend Developer", category: "Technology & Software", aliases: ["Back End Developer", "Backend Engineer", "Node.js Developer", "Java Developer", "Python Developer"], keywords: ["server", "api", "database", "node", "java", "python"], popular: true },
  { id: "mobile-app-developer", title: "Mobile App Developer", category: "Technology & Software", aliases: ["iOS Developer", "Android Developer", "React Native Developer", "Flutter Developer"], keywords: ["mobile", "app", "ios", "android", "flutter", "react native"] },
  { id: "devops-engineer", title: "DevOps Engineer", category: "Technology & Software", aliases: ["Site Reliability Engineer", "SRE", "Cloud Engineer"], keywords: ["infrastructure", "deployment", "aws", "azure", "gcp", "docker", "kubernetes"] },
  { id: "software-architect", title: "Software Architect", category: "Technology & Software", aliases: ["Solutions Architect", "System Architect", "Cloud Architect"], keywords: ["design", "system", "architecture"] },
  { id: "qa-engineer", title: "QA Engineer", category: "Technology & Software", aliases: ["Quality Assurance Engineer", "Automation Test Engineer", "Test Engineer", "SDET"], keywords: ["testing", "quality", "automation", "manual"] },
  { id: "security-engineer", title: "Security Engineer", category: "Technology & Software", aliases: ["Cybersecurity Analyst", "Cybersecurity Engineer", "Ethical Hacker", "Penetration Tester"], keywords: ["security", "hacking", "cyber", "infosec"] },
  { id: "network-engineer", title: "Network Engineer", category: "Technology & Software", aliases: ["System Administrator", "Sysadmin", "IT Support Specialist"], keywords: ["network", "hardware", "infrastructure", "support"] },
  { id: "database-administrator", title: "Database Administrator", category: "Technology & Software", aliases: ["DBA", "Database Developer"], keywords: ["sql", "nosql", "database", "data"] },
  { id: "machine-learning-engineer", title: "Machine Learning Engineer", category: "Technology & Software", aliases: ["ML Engineer", "AI Engineer", "NLP Engineer", "Computer Vision Engineer", "MLOps Engineer"], keywords: ["ai", "ml", "artificial intelligence", "machine learning", "deep learning"] },
  { id: "prompt-engineer", title: "Prompt Engineer", category: "Technology & Software", aliases: ["Generative AI Engineer"], keywords: ["llm", "chatgpt", "openai", "claude", "prompting"] },
  { id: "blockchain-developer", title: "Blockchain Developer", category: "Technology & Software", aliases: ["Smart Contract Developer", "Web3 Developer"], keywords: ["crypto", "ethereum", "solidity", "web3", "bitcoin"] },
  { id: "game-developer", title: "Game Developer", category: "Technology & Software", aliases: ["AR/VR Developer", "Unity Developer", "Unreal Developer"], keywords: ["gaming", "unity", "unreal", "ar", "vr"] },
  { id: "embedded-systems-engineer", title: "Embedded Systems Engineer", category: "Technology & Software", aliases: ["Firmware Engineer", "Robotics Engineer"], keywords: ["hardware", "c", "c++", "microcontroller", "robotics"] },
  { id: "technical-writer", title: "Technical Writer", category: "Technology & Software", aliases: ["Developer Advocate", "Developer Relations", "DevRel"], keywords: ["documentation", "writing", "community", "advocacy"] },

  // DATA & ANALYTICS
  { id: "data-analyst", title: "Data Analyst", category: "Data & Analytics", aliases: ["Senior Data Analyst"], keywords: ["sql", "excel", "tableau", "powerbi", "analysis"], popular: true },
  { id: "business-analyst", title: "Business Analyst", category: "Data & Analytics", aliases: ["Business Intelligence Analyst", "BI Developer"], keywords: ["business", "intelligence", "bi", "requirements"] },
  { id: "data-scientist", title: "Data Scientist", category: "Data & Analytics", aliases: ["Senior Data Scientist", "Quantitative Analyst", "Statistician"], keywords: ["math", "statistics", "python", "r", "machine learning"], popular: true },
  { id: "data-engineer", title: "Data Engineer", category: "Data & Analytics", aliases: ["Analytics Engineer"], keywords: ["pipeline", "etl", "warehouse", "spark", "hadoop"] },
  { id: "product-analyst", title: "Product Analyst", category: "Data & Analytics", aliases: ["Marketing Analyst", "Operations Analyst"], keywords: ["metrics", "kpi", "product", "growth"] },
  { id: "financial-analyst", title: "Financial Analyst", category: "Data & Analytics", aliases: ["Risk Analyst", "Investment Analyst"], keywords: ["finance", "modeling", "excel", "risk", "investment"], popular: true },

  // DESIGN
  { id: "ui-ux-designer", title: "UI/UX Designer", category: "Design", aliases: ["UI Designer", "UX Designer", "Product Designer", "Interaction Designer"], keywords: ["figma", "sketch", "wireframe", "prototype", "user experience"], popular: true },
  { id: "ux-researcher", title: "UX Researcher", category: "Design", aliases: ["User Researcher"], keywords: ["interview", "usability", "testing", "research"] },
  { id: "graphic-designer", title: "Graphic Designer", category: "Design", aliases: ["Visual Designer", "Brand Designer", "Web Designer"], keywords: ["photoshop", "illustrator", "branding", "logo"] },
  { id: "motion-designer", title: "Motion Designer", category: "Design", aliases: ["3D Designer", "Animator"], keywords: ["after effects", "cinema4d", "blender", "animation"] },
  { id: "creative-director", title: "Creative Director", category: "Design", aliases: ["Art Director", "Design Lead", "Design Manager"], keywords: ["leadership", "vision", "creative", "management"] },

  // PRODUCT & MANAGEMENT
  { id: "product-manager", title: "Product Manager", category: "Product & Management", aliases: ["Senior Product Manager", "Associate Product Manager", "Technical Product Manager"], keywords: ["roadmap", "strategy", "agile", "scrum"], popular: true },
  { id: "product-owner", title: "Product Owner", category: "Product & Management", aliases: ["Scrum Master", "Agile Coach"], keywords: ["agile", "scrum", "kanban", "sprint"] },
  { id: "project-manager", title: "Project Manager", category: "Product & Management", aliases: ["Program Manager", "Technical Project Manager", "Delivery Manager"], keywords: ["planning", "execution", "pmp", "timeline"] },
  { id: "engineering-manager", title: "Engineering Manager", category: "Product & Management", aliases: ["Tech Lead", "Software Engineering Manager"], keywords: ["leadership", "management", "technical", "mentorship"] },
  { id: "operations-manager", title: "Operations Manager", category: "Product & Management", aliases: ["Business Operations Manager", "Product Operations Manager"], keywords: ["process", "efficiency", "operations", "strategy"] },

  // MARKETING & SALES
  { id: "digital-marketing-specialist", title: "Digital Marketing Specialist", category: "Marketing & Sales", aliases: ["Digital Marketing Manager", "Growth Marketer", "Performance Marketing Specialist"], keywords: ["ads", "campaign", "social media", "marketing"], popular: true },
  { id: "seo-specialist", title: "SEO Specialist", category: "Marketing & Sales", aliases: ["SEO Manager", "SEM Specialist"], keywords: ["search", "google", "ranking", "optimization"] },
  { id: "social-media-manager", title: "Social Media Manager", category: "Marketing & Sales", aliases: ["Social Media Specialist"], keywords: ["twitter", "instagram", "facebook", "linkedin", "community"] },
  { id: "content-strategist", title: "Content Strategist", category: "Marketing & Sales", aliases: ["Content Writer", "Copywriter"], keywords: ["writing", "blog", "article", "copy"] },
  { id: "brand-manager", title: "Brand Manager", category: "Marketing & Sales", aliases: ["Marketing Manager"], keywords: ["brand", "strategy", "positioning", "campaign"] },
  { id: "sales-manager", title: "Sales Manager", category: "Marketing & Sales", aliases: ["Sales Executive", "Account Executive", "Business Development Manager"], keywords: ["b2b", "b2c", "revenue", "quota", "sales"] },
  { id: "account-manager", title: "Account Manager", category: "Marketing & Sales", aliases: ["Customer Success Manager", "Client Success Manager"], keywords: ["retention", "relationship", "client", "support"] },

  // FINANCE & ACCOUNTING
  { id: "finance-manager", title: "Finance Manager", category: "Finance & Accounting", aliases: ["Financial Controller"], keywords: ["finance", "budget", "planning", "forecast"] },
  { id: "investment-banker", title: "Investment Banker", category: "Finance & Accounting", aliases: ["M&A Analyst"], keywords: ["mergers", "acquisitions", "banking", "finance"] },
  { id: "accountant", title: "Accountant", category: "Finance & Accounting", aliases: ["Senior Accountant", "Tax Accountant", "Chartered Accountant"], keywords: ["tax", "audit", "cpa", "reconciliation"] },
  { id: "auditor", title: "Auditor", category: "Finance & Accounting", aliases: ["Internal Auditor"], keywords: ["compliance", "risk", "control", "audit"] },
  { id: "bookkeeper", title: "Bookkeeper", category: "Finance & Accounting", aliases: ["Payroll Specialist"], keywords: ["payroll", "invoicing", "expenses", "ledger"] },

  // HR & RECRUITMENT
  { id: "hr-manager", title: "HR Manager", category: "HR & Recruitment", aliases: ["HR Executive", "HR Business Partner"], keywords: ["human resources", "people", "culture", "employee"] },
  { id: "recruiter", title: "Recruiter", category: "HR & Recruitment", aliases: ["Talent Acquisition Specialist", "Technical Recruiter"], keywords: ["hiring", "sourcing", "interview", "talent"] },
  { id: "learning-development-specialist", title: "Learning & Development Specialist", category: "HR & Recruitment", aliases: ["Training Manager"], keywords: ["training", "education", "development", "onboarding"] },

  // HEALTHCARE
  { id: "doctor", title: "Doctor", category: "Healthcare", aliases: ["Physician", "Surgeon"], keywords: ["medical", "health", "hospital", "patient"] },
  { id: "nurse", title: "Nurse", category: "Healthcare", aliases: ["Registered Nurse"], keywords: ["medical", "health", "care", "rn"] },
  { id: "pharmacist", title: "Pharmacist", category: "Healthcare", aliases: ["Pharmacy Manager"], keywords: ["medicine", "drugs", "prescription", "pharmacy"] },
  { id: "dentist", title: "Dentist", category: "Healthcare", aliases: ["Orthodontist"], keywords: ["dental", "teeth", "oral", "health"] },
  { id: "physiotherapist", title: "Physiotherapist", category: "Healthcare", aliases: ["Occupational Therapist"], keywords: ["physical", "therapy", "rehabilitation"] },
  { id: "medical-researcher", title: "Medical Researcher", category: "Healthcare", aliases: ["Clinical Research Associate", "Medical Laboratory Technician"], keywords: ["research", "lab", "clinical", "trial"] },

  // EDUCATION
  { id: "teacher", title: "Teacher", category: "Education", aliases: ["School Teacher", "High School Teacher", "Primary School Teacher", "Educator"], keywords: ["school", "student", "education", "teaching"], popular: true },
  { id: "professor", title: "Professor", category: "Education", aliases: ["College Professor", "University Professor", "Lecturer"], keywords: ["university", "college", "higher education", "research"] },
  { id: "tutor", title: "Tutor", category: "Education", aliases: ["Teaching Assistant"], keywords: ["tutoring", "mentoring", "help", "education"] },
  { id: "instructional-designer", title: "Instructional Designer", category: "Education", aliases: ["Curriculum Developer", "Training Specialist"], keywords: ["curriculum", "course", "learning", "design"] },

  // ENGINEERING
  { id: "mechanical-engineer", title: "Mechanical Engineer", category: "Engineering", aliases: ["Manufacturing Engineer", "Automotive Engineer", "Aerospace Engineer"], keywords: ["cad", "design", "manufacturing", "machines"] },
  { id: "civil-engineer", title: "Civil Engineer", category: "Engineering", aliases: ["Structural Engineer", "Environmental Engineer"], keywords: ["construction", "building", "infrastructure", "civil"] },
  { id: "electrical-engineer", title: "Electrical Engineer", category: "Engineering", aliases: ["Electronics Engineer", "Mechatronics Engineer"], keywords: ["circuits", "power", "electronics", "hardware"] },
  { id: "chemical-engineer", title: "Chemical Engineer", category: "Engineering", aliases: ["Process Engineer", "Quality Engineer", "Industrial Engineer"], keywords: ["chemistry", "process", "quality", "production"] },

  // LEGAL
  { id: "lawyer", title: "Lawyer", category: "Legal", aliases: ["Attorney", "Corporate Lawyer", "Legal Advisor", "Legal Consultant"], keywords: ["law", "legal", "court", "litigation"] },
  { id: "paralegal", title: "Paralegal", category: "Legal", aliases: ["Legal Assistant", "Legal Associate"], keywords: ["law", "legal", "research", "document"] },
  { id: "compliance-officer", title: "Compliance Officer", category: "Legal", aliases: ["Contract Specialist"], keywords: ["compliance", "regulatory", "contract", "risk"] },

  // MEDIA & CREATIVE
  { id: "content-creator", title: "Content Creator", category: "Media & Creative", aliases: ["YouTuber", "Influencer"], keywords: ["video", "social media", "creative", "content"] },
  { id: "video-editor", title: "Video Editor", category: "Media & Creative", aliases: ["Film Editor", "Videographer", "Animator"], keywords: ["premiere", "final cut", "editing", "video"] },
  { id: "photographer", title: "Photographer", category: "Media & Creative", aliases: ["Photo Editor"], keywords: ["camera", "photography", "photo", "lightroom"] },
  { id: "journalist", title: "Journalist", category: "Media & Creative", aliases: ["Editor", "Writer", "Reporter"], keywords: ["news", "media", "writing", "reporting"] },

  // HOSPITALITY & TRAVEL
  { id: "hotel-manager", title: "Hotel Manager", category: "Hospitality & Travel", aliases: ["Hospitality Manager", "Front Office Manager"], keywords: ["hotel", "hospitality", "management", "guest"] },
  { id: "chef", title: "Chef", category: "Hospitality & Travel", aliases: ["Sous Chef", "Executive Chef"], keywords: ["cooking", "food", "kitchen", "culinary"] },
  { id: "event-manager", title: "Event Manager", category: "Hospitality & Travel", aliases: ["Event Planner"], keywords: ["events", "planning", "coordination", "management"] },
  { id: "travel-agent", title: "Travel Agent", category: "Hospitality & Travel", aliases: ["Travel Consultant", "Tour Manager"], keywords: ["travel", "tourism", "booking", "tours"] },

  // RETAIL & CUSTOMER SERVICE
  { id: "retail-manager", title: "Retail Manager", category: "Retail & Customer Service", aliases: ["Store Manager", "Store Supervisor"], keywords: ["retail", "store", "management", "sales"] },
  { id: "customer-service-representative", title: "Customer Service Representative", category: "Retail & Customer Service", aliases: ["Customer Support Specialist", "Call Center Executive"], keywords: ["support", "service", "customer", "helpdesk"] },

  // GOVERNMENT & PUBLIC SERVICE
  { id: "government-officer", title: "Government Officer", category: "Government & Public Service", aliases: ["Administrative Officer", "Civil Services Officer"], keywords: ["government", "public", "administration", "policy"] },

  // SCIENCE & RESEARCH
  { id: "research-scientist", title: "Research Scientist", category: "Science & Research", aliases: ["Research Associate"], keywords: ["research", "science", "laboratory", "experiment"] },
  { id: "biotechnologist", title: "Biotechnologist", category: "Science & Research", aliases: ["Microbiologist", "Biochemist"], keywords: ["biology", "lab", "research", "biotech"] },
];

export const POPULAR_JOB_ROLES = JOB_ROLES.filter((role) => role.popular);
