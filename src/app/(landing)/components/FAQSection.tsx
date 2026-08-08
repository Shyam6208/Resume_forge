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
    question: "Is it really 100% free?",
    answer:
      "Yes! ResumeForge is completely free to create, edit, score, and download your resumes. There are no hidden paywalls, trial expirations, or subscription traps.",
  },
  {
    id: "faq-2",
    question: "No watermark on PDF?",
    answer:
      "Absolutely zero watermarks. All exported PDF and DOCX documents look 100% clean, professional, and executive.",
  },
  {
    id: "faq-3",
    question: "Does it work without AI?",
    answer:
      "Yes! ResumeForge uses deterministic, rule-based algorithms for ATS keyword matching and score calculations. Your data stays fast, private, and authentic without AI hallucinations.",
  },
  {
    id: "faq-4",
    question: "Can I create multiple resumes?",
    answer:
      "Yes, you can build and manage unlimited resumes tailored for different target roles directly in your personal dashboard.",
  },
  {
    id: "faq-5",
    question: "Is my data secure?",
    answer:
      "Your privacy is our priority. Your data is encrypted and saved securely with Supabase row-level security. We never sell your personal data or email.",
  },
  {
    id: "faq-6",
    question: "Does it work on mobile?",
    answer:
      "Yes! ResumeForge is fully responsive with a mobile tab bar allowing you to edit, preview, score, and export your resume directly from your smartphone or tablet.",
  },
];

export function FAQSection() {
  return (
    <section className="py-20 px-4 sm:px-6 max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center justify-center gap-1.5">
          <HelpCircle className="w-4 h-4" />
          <span>Got Questions?</span>
        </h2>
        <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Frequently Asked Questions
        </h3>
        <p className="text-xs sm:text-sm text-slate-400">
          Everything you need to know about building your resume on ResumeForge.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Accordion className="w-full space-y-3">
          {FAQS.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-1 text-slate-100 transition-colors"
            >
              <AccordionTrigger className="text-sm font-bold text-left hover:text-indigo-400 hover:no-underline py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-xs text-slate-400 leading-relaxed pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  );
}
