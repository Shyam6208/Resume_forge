import type { ResumeData } from "@/types/resume.types";

export const SAMPLE_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: "Alex Morgan",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 234-5678",
    city: "San Francisco",
    country: "CA",
    website: "https://alexmorgan.dev",
    linkedin: "https://linkedin.com/in/alexmorgan",
    github: "https://github.com/alexmorgan",
    professionalTitle: "Senior Full Stack Engineer",
  },
  summary:
    "Results-driven Senior Full Stack Engineer with 6+ years of experience designing and scaling web applications using React, Next.js, Node.js, and Cloud Infrastructure. Proven track record of improving system performance by 40% and leading cross-functional engineering teams.",
  experience: [
    {
      id: "exp-1",
      company: "TechForge Systems",
      position: "Senior Full Stack Engineer",
      location: "San Francisco, CA",
      startDate: "2022-03",
      endDate: "Present",
      isCurrentlyWorking: true,
      responsibilities: [
        "Architected microservices infrastructure serving 2M+ active monthly users with 99.99% uptime.",
        "Optimized frontend bundle size by 35% through dynamic code splitting and tree shaking.",
        "Mentored team of 5 junior developers and conducted weekly technical architecture reviews.",
      ],
    },
    {
      id: "exp-2",
      company: "Innovate AI Lab",
      position: "Frontend Software Engineer",
      location: "San Jose, CA",
      startDate: "2019-06",
      endDate: "2022-02",
      isCurrentlyWorking: false,
      responsibilities: [
        "Developed responsive web dashboard for real-time AI model monitoring using React and TailwindCSS.",
        "Integrated GraphQL query layer reducing client network latency by 50%.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science in Computer Science",
      startDate: "2015-08",
      endDate: "2019-05",
      isCurrentlyStudying: false,
      grade: "3.85 / 4.0",
      description: "Dean's Honor List • President of ACM Student Chapter",
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "ResumeForge SaaS",
      description: "AI-powered target job role auto-optimization platform built with Next.js and Supabase.",
      liveDemo: "https://resumeforge.app",
      technologies: ["React", "Next.js", "TypeScript", "Supabase", "TailwindCSS"],
      startDate: "2024-01",
      endDate: "Present",
      highlights: ["Over 10,000 resumes generated with instant PDF and DOCX export capabilities."],
    },
  ],
  skills: {
    programming: ["JavaScript", "TypeScript", "Python", "SQL"],
    frontend: ["React", "Next.js", "TailwindCSS", "Redux"],
    backend: ["Node.js", "Express", "REST APIs", "GraphQL"],
    database: ["PostgreSQL", "Supabase", "Redis"],
    cloud: ["AWS", "Docker", "Vercel"],
  },
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect",
      organization: "Amazon Web Services",
      issueDate: "2023-05",
    },
  ],
  achievements: [
    {
      id: "ach-1",
      title: "1st Place Winner — Global AI Hackathon 2023",
      description: "Built automated document synthesis tool within 48 hours.",
      date: "2023-11",
    },
  ],
  languages: [
    { id: "lang-1", name: "English", proficiency: "native" },
    { id: "lang-2", name: "Spanish", proficiency: "intermediate" },
  ],
  volunteer: [],
  publications: [],
  references: [],
};
