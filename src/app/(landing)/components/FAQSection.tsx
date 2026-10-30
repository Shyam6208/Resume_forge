"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const FAQS = [
  {
    id: "faq-1",
    question: "Is ResumeForge really 100% free with no paywalls?",
    answer:
      "Yes. There are zero credit card requirements, no hidden subscriptions, and no paywalls. You can create unlimited resumes, use AI auto-tailoring, and export clean PDF and DOCX files without any watermarks.",
  },
  {
    id: "faq-2",
    question: "How does the 1-Click AI Auto-Tailor feature work?",
    answer:
      "Simply paste the target Job Description into the Auto-Tailor tool. Our AI analyzes the requirements and reframes your existing bullet points and summary with missing ATS keywords, elevating your match score without fabricating fake information.",
  },
  {
    id: "faq-3",
    question: "What is the Real-Time Web Portfolio and QR Code?",
    answer:
      "Every resume you create can be published as a live, mobile-friendly web portfolio (e.g. /r/your-name). It includes an instant SVG QR code for business cards and resumes, plus a public/private toggle so you control who views it.",
  },
  {
    id: "faq-4",
    question: "How does the Live Voice Mock Interview Simulator work?",
    answer:
      "The Mock Interview Suite generates role-tailored technical and behavioral questions from your resume and target job description. You can speak your answers via voice dictation, practice with a 2-minute countdown timer, and receive instant STAR scoring.",
  },
  {
    id: "faq-5",
    question: "Is my personal data safe and private?",
    answer:
      "Yes. Your resume data is encrypted and protected by Supabase Row-Level Security (RLS). Only you have access to your drafts unless you choose to make a portfolio public.",
  },
  {
    id: "faq-6",
    question: "What export formats are supported?",
    answer:
      "You can export your resume as a pixel-perfect, printer-ready A4 PDF, an editable Microsoft Word (.docx) document, or a clean ATS Plain Text (.txt) format.",
  },
];

const col1 = FAQS.filter((_, i) => i % 2 === 0);
const col2 = FAQS.filter((_, i) => i % 2 === 1);

export function FAQSection() {
  return (
    <section id="faq" className="py-24 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="text-center space-y-3 mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Knowledge Base</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-[-0.02em]">
          Frequently Asked Questions
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Everything you need to know about ResumeForge and its AI career tools.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {[col1, col2].map((column, colIdx) => (
          <Accordion key={colIdx} className="space-y-3">
            {column.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="bg-card/50 border border-white/[0.05] rounded-xl px-5 py-1 text-foreground hover:border-cyan-500/25 transition-colors"
              >
                <AccordionTrigger className="text-sm font-semibold text-left hover:text-cyan-400 hover:no-underline py-4 text-foreground/90">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ))}
      </motion.div>
    </section>
  );
}
