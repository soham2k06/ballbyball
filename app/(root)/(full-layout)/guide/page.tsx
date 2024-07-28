import { TypographyH3 } from "@/components/ui/typography";
import { faqs, guideSteps } from "@/lib/constants";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function page() {
  return (
    <div>
      <div className="space-y-2">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Guide</h1>
        <p className="text-lg text-muted-foreground">
          <span className="inline-block text-balance">
            To begin a match and start scoring, follow these steps:
          </span>
        </p>
      </div>

      <section className="mt-8 space-y-4 md:mt-16">
        {guideSteps.map((step, i) => (
          <div key={i} className="space-y-4">
            <TypographyH3>
              {i + 1}.{" "}
              <Link href={step.href} className="underline">
                {step.title}
              </Link>
            </TypographyH3>
            {step.notes.map((note, index) => (
              <li key={index} className="text-muted-foreground">
                {note}
              </li>
            ))}
          </div>
        ))}
      </section>

      <section className="mt-8 md:mt-16">
        <TypographyH3>FAQs</TypographyH3>
        <Accordion type="single" collapsible>
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}

export default page;
