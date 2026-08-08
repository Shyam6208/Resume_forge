// ============================================================
// ResumeForge — Supabase Database Types
// Matches the existing Supabase SQL schema (do NOT recreate)
// ============================================================

import type { ResumeData, ResumeTheme, SectionKey, UserType } from "./resume.types";

export interface Database {
  public: {
    Tables: {
      // ----- Profiles -----
      profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string;
          avatar_url: string | null;
          username: string | null;
          user_type: UserType | null;
          is_admin: boolean;
          is_guest: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          email: string;
          avatar_url?: string | null;
          username?: string | null;
          user_type?: UserType | null;
          is_admin?: boolean;
          is_guest?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string;
          avatar_url?: string | null;
          username?: string | null;
          user_type?: UserType | null;
          is_admin?: boolean;
          is_guest?: boolean;
          updated_at?: string;
        };
      };

      // ----- Resumes -----
      resumes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          slug: string;
          template_id: string;
          data: ResumeData;
          theme: ResumeTheme;
          section_order: SectionKey[];
          is_public: boolean;
          target_job: string | null;
          download_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          slug: string;
          template_id?: string;
          data: ResumeData;
          theme?: ResumeTheme;
          section_order?: SectionKey[];
          is_public?: boolean;
          target_job?: string | null;
          download_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          slug?: string;
          template_id?: string;
          data?: ResumeData;
          theme?: ResumeTheme;
          section_order?: SectionKey[];
          is_public?: boolean;
          target_job?: string | null;
          download_count?: number;
          updated_at?: string;
        };
      };

      // ----- Cover Letters -----
      cover_letters: {
        Row: {
          id: string;
          user_id: string;
          resume_id: string | null;
          company_name: string;
          position: string;
          content: string;
          template_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          resume_id?: string | null;
          company_name: string;
          position: string;
          content: string;
          template_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          resume_id?: string | null;
          company_name?: string;
          position?: string;
          content?: string;
          template_id?: string | null;
          updated_at?: string;
        };
      };

      // ----- Templates -----
      templates: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: string;
          preview_image: string | null;
          ats_rating: number;
          is_active: boolean;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category: string;
          preview_image?: string | null;
          ats_rating?: number;
          is_active?: boolean;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          category?: string;
          preview_image?: string | null;
          ats_rating?: number;
          is_active?: boolean;
          tags?: string[];
          updated_at?: string;
        };
      };

      // ----- Job Applications -----
      job_applications: {
        Row: {
          id: string;
          user_id: string;
          resume_id: string | null;
          job_title: string;
          company: string;
          status: string;
          applied_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          resume_id?: string | null;
          job_title: string;
          company: string;
          status?: string;
          applied_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          resume_id?: string | null;
          job_title?: string;
          company?: string;
          status?: string;
          applied_date?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_type: UserType;
    };
  };
}

// ============================================================
// Helper Types — shorthand for table rows
// ============================================================

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type ResumeRow = Database["public"]["Tables"]["resumes"]["Row"];
export type ResumeInsert = Database["public"]["Tables"]["resumes"]["Insert"];
export type ResumeUpdate = Database["public"]["Tables"]["resumes"]["Update"];

export type CoverLetter = Database["public"]["Tables"]["cover_letters"]["Row"];
export type CoverLetterInsert = Database["public"]["Tables"]["cover_letters"]["Insert"];
export type CoverLetterUpdate = Database["public"]["Tables"]["cover_letters"]["Update"];

export type Template = Database["public"]["Tables"]["templates"]["Row"];
export type TemplateInsert = Database["public"]["Tables"]["templates"]["Insert"];
export type TemplateUpdate = Database["public"]["Tables"]["templates"]["Update"];

export type JobApplication = Database["public"]["Tables"]["job_applications"]["Row"];
export type JobApplicationInsert = Database["public"]["Tables"]["job_applications"]["Insert"];
export type JobApplicationUpdate = Database["public"]["Tables"]["job_applications"]["Update"];
