import type { Faq } from "@prisma/client";
import { Container } from "./container";
import { FaqAccordion } from "./faq-section";
import { faqJsonLd, JsonLdScript } from "@/lib/jsonld";

/**
 * Bloque de FAQs de una página (AEO): acordeón + JSON-LD FAQPage.
 * Las respuestas llevan `data-speakable` para asistentes de voz.
 * No renderiza nada si la página no tiene FAQs.
 */
export function PageFaqs({
  faqs,
  title = "Preguntas frecuentes",
  className = "py-14 sm:py-20",
}: {
  faqs: Pick<Faq, "id" | "question" | "answer">[] | undefined;
  title?: string;
  className?: string;
}) {
  if (!faqs?.length) return null;
  return (
    <section className={className}>
      <JsonLdScript data={faqJsonLd(faqs)} />
      <Container>
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-5 font-display text-2xl font-bold tracking-[-0.02em] text-palm-950 sm:text-3xl">
            {title}
          </h2>
          <div data-speakable>
            <FaqAccordion
              faqs={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
