"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { CaretDown } from "@phosphor-icons/react";

export type FaqItem = { id: string; question: string; answer: string };

/**
 * Acordeón de preguntas frecuentes (AEO). El JSON-LD FAQPage se inyecta
 * desde el server component que lo usa.
 */
export function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  if (!faqs.length) return null;
  return (
    <Accordion.Root type="single" collapsible className="divide-y divide-mist-200 rounded-2xl border border-mist-200 bg-white">
      {faqs.map((faq) => (
        <Accordion.Item key={faq.id} value={faq.id} className="px-5 first:rounded-t-2xl last:rounded-b-2xl">
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 py-4 text-left">
              <span className="text-[15px] font-semibold text-palm-950 sm:text-base">
                {faq.question}
              </span>
              <CaretDown
                size={18}
                weight="bold"
                className="shrink-0 text-palm-700 transition-transform duration-200 group-data-[state=open]:rotate-180"
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <p className="pb-5 pr-8 text-[15px] leading-relaxed text-mist-600">
              {faq.answer}
            </p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
