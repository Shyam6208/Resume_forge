"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

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
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
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
                className="bg-slate-900/40 border border-white/[0.05] rounded-2xl px-5 py-1 text-slate-100 hover:border-white/[0.1] transition-colors"
              >
                <AccordionTrigger className="text-sm font-semibold text-left hover:text-indigo-300 hover:no-underline py-4 text-slate-200">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-slate-400 leading-relaxed pb-4">
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
