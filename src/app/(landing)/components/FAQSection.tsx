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
    question: "Is it really 100% free?",
    answer:
      "Yes. No trials, no paywalls, and no hidden premium tiers. Create, edit, score, and download as many resumes as you need.",
  },
  {
    id: "faq-2",
    question: "Is there any watermark on the exported PDF?",
    answer:
      "None. Exported PDF and DOCX documents are completely clean — with no branding, logos, or watermarks.",
  },
  {
    id: "faq-3",
    question: "Does it use AI to write my resume?",
    answer:
      "No. ResumeForge uses deterministic, rule-based algorithms for ATS matching and scoring. Your content stays authentic and private.",
  },
  {
    id: "faq-4",
    question: "Can I create multiple resumes?",
    answer:
      "Yes. You can create unlimited resumes tailored for different job roles, all managed directly from your dashboard.",
  },
  {
    id: "faq-5",
    question: "Is my personal data secure?",
    answer:
      "Your data is encrypted and protected with Supabase row-level security. We never share or sell your personal information.",
  },
  {
    id: "faq-6",
    question: "Does it work on mobile devices?",
    answer:
      "Yes, fully. The editor features a responsive tabbed interface on mobile devices — allowing you to edit, preview, score, and export from anywhere.",
  },
];

const col1 = FAQS.filter((_, i) => i % 2 === 0);
const col2 = FAQS.filter((_, i) => i % 2 === 1);

export function FAQSection() {
  return (
    <section id="faq" className="py-24 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="text-center space-y-3 mb-14">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Questions & answers
        </h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          The short version of everything you need to know.
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
                className="bg-slate-900/40 border border-white/[0.05] rounded-xl px-5 py-1 text-slate-100 hover:border-white/[0.08] transition-colors"
              >
                <AccordionTrigger className="text-sm font-semibold text-left hover:text-white hover:no-underline py-4 text-slate-200">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs text-slate-400 leading-relaxed pb-4">
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
