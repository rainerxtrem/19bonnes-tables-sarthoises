"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsletterCampaignSchema, type NewsletterCampaignInput } from "@/lib/validation/newsletter-campaign";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select, Textarea } from "@/components/ui/field";

type ArticleOption = { id: string; title: string; excerpt: string | null };

export function NewsletterCampaignForm({
  articles,
  subscriberCount,
}: {
  articles: ArticleOption[];
  subscriberCount: number;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterCampaignInput>({
    resolver: zodResolver(newsletterCampaignSchema),
    defaultValues: { subject: "", introText: "", articleId: null },
  });

  function onPickArticle(articleId: string) {
    setValue("articleId", articleId || null);
    const article = articles.find((a) => a.id === articleId);
    if (article) {
      if (!getValues("subject")) setValue("subject", article.title);
      if (!getValues("introText") && article.excerpt) setValue("introText", article.excerpt);
    }
  }

  async function onSubmit(values: NewsletterCampaignInput) {
    setServerError(null);
    const res = await fetch("/api/admin/newsletter/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setServerError(data.error ?? "Une erreur est survenue.");
      setConfirming(false);
      return;
    }
    const data = await res.json();
    setResult({ sent: data.sent, failed: data.failed });
    setConfirming(false);
    router.refresh();
  }

  if (result) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-5 text-sm text-green-900">
        <p className="font-medium">Campagne envoyée !</p>
        <p className="mt-1">
          {result.sent} email(s) envoyé(s){result.failed > 0 ? `, ${result.failed} échec(s) — voir les logs serveur` : ""}.
        </p>
        <Button type="button" size="sm" variant="secondary" className="mt-3" onClick={() => setResult(null)}>
          Envoyer une autre campagne
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(() => setConfirming(true))}
      className="space-y-4 rounded-lg border border-gray-200 bg-white p-5"
    >
      <FormField label="Associer un article publié (optionnel)" htmlFor="articleId">
        <Select id="articleId" onChange={(e) => onPickArticle(e.target.value)} defaultValue="">
          <option value="">— Aucun, message libre —</option>
          {articles.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Objet de l'email" htmlFor="subject" error={errors.subject?.message}>
        <Input id="subject" {...register("subject")} placeholder="Ex. Nos actualités du mois" />
      </FormField>

      <FormField
        label="Message"
        htmlFor="introText"
        hint="Pré-rempli avec l'extrait de l'article choisi si disponible — modifiable. Un bouton « Lire l'article complet » est ajouté automatiquement si un article est associé."
        error={errors.introText?.message}
      >
        <Textarea id="introText" rows={8} {...register("introText")} />
      </FormField>

      <div className="flex items-center justify-between rounded-md bg-gray-50 px-4 py-3 text-sm text-gray-600">
        <span>
          Cet envoi touchera <strong>{subscriberCount}</strong> abonné{subscriberCount > 1 ? "s" : ""} actif
          {subscriberCount > 1 ? "s" : ""}.
        </span>
      </div>

      {!confirming ? (
        <Button type="submit" disabled={subscriberCount === 0} className="w-full">
          Envoyer la campagne
        </Button>
      ) : (
        <div className="space-y-2 rounded-md border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">
            Confirmer l&apos;envoi à {subscriberCount} abonné{subscriberCount > 1 ? "s" : ""} ? Cette action est
            irréversible.
          </p>
          <div className="flex gap-2">
            <Button type="button" disabled={isSubmitting} onClick={handleSubmit(onSubmit)}>
              {isSubmitting ? "Envoi en cours..." : "Confirmer l'envoi"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setConfirming(false)}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
    </form>
  );
}
