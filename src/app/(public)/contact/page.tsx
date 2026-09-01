import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/services/settings.service";
import { ContactForm } from "@/components/public/contact-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-2xl font-semibold text-brand-dark">Contactez-nous</h1>
        <p className="mt-3 text-sm text-gray-600">
          Pour toute demande de renseignements concernant l&apos;association ou de collaborations,
          contactez-nous, nous vous répondrons dans les plus brefs délais. Ce site n&apos;est pas
          destiné aux réservations.
        </p>
        {settings.contactEmail ? (
          <p className="mt-2 text-sm text-gray-600">
            Ou par email :{" "}
            <a href={`mailto:${settings.contactEmail}`} className="text-brand hover:underline">
              {settings.contactEmail}
            </a>
          </p>
        ) : null}
      </div>
      <div className="mx-auto mt-8 max-w-xl">
        <ContactForm />
      </div>
    </div>
  );
}
