"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { siteSettingSchema, type SiteSettingInput } from "@/lib/validation/settings";
import { Button } from "@/components/ui/button";
import { FormField, Input, Textarea } from "@/components/ui/field";
import { MediaPicker, type PickedMedia } from "@/components/admin/media-picker";
import { Switch } from "@/components/ui/switch";
import { THEME_OPTIONS } from "@/lib/themes";
import { cn } from "@/lib/utils/cn";
import type { Media, SiteSetting } from "@prisma/client";

type SettingsWithMedia = SiteSetting & { logo: Media | null; favicon: Media | null };

export function SettingsForm({ settings }: { settings: SettingsWithMedia }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [logoPickerOpen, setLogoPickerOpen] = useState(false);
  const [logo, setLogo] = useState<PickedMedia | null>(
    settings.logo ? { id: settings.logo.id, url: settings.logo.url, alt: settings.logo.alt, filename: settings.logo.filename } : null
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SiteSettingInput>({
    resolver: zodResolver(siteSettingSchema),
    defaultValues: {
      siteName: settings.siteName,
      siteDescription: settings.siteDescription ?? "",
      logoId: settings.logoId,
      faviconId: settings.faviconId,
      contactEmail: settings.contactEmail ?? "",
      contactPhone: settings.contactPhone ?? "",
      address: settings.address ?? "",
      facebookUrl: settings.facebookUrl ?? "",
      instagramUrl: settings.instagramUrl ?? "",
      linkedinUrl: settings.linkedinUrl ?? "",
      seoDefaultTitle: settings.seoDefaultTitle ?? "",
      seoDefaultDescription: settings.seoDefaultDescription ?? "",
      footerText: settings.footerText ?? "",
      gtmId: settings.gtmId ?? "",
      themeEnabled: settings.themeEnabled,
      siteTheme: settings.siteTheme,
      themeEffects: settings.themeEffects,
      themeBannerText: settings.themeBannerText ?? "",
    },
  });

  const themeEnabled = watch("themeEnabled") ?? false;
  const siteTheme = watch("siteTheme") ?? "NORMAL";
  const themeEffects = watch("themeEffects") ?? true;
  const bannerExample = THEME_OPTIONS.find((option) => option.key === siteTheme)?.bannerExample;

  async function onSubmit(values: SiteSettingInput) {
    setServerError(null);
    setSuccess(false);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setServerError(data.error ?? "Une erreur est survenue.");
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="space-y-5 rounded-lg border border-ink-100 bg-white p-5 shadow-sm">
          <h2 className="font-display text-base text-ink-900">Thème du site</h2>
          <Switch
            id="themeEnabled"
            checked={themeEnabled}
            onChange={(value) => setValue("themeEnabled", value, { shouldDirty: true })}
            label="Activer le thème saisonnier"
            description="Désactivé, le site public s'affiche avec son thème Normal. L'administration n'est jamais modifiée."
          />

          {/* `inert` plutôt que <fieldset disabled> : les champs restent dans
              les valeurs du formulaire quand le thème est désactivé. */}
          <div inert={!themeEnabled} className={cn("space-y-5", !themeEnabled && "opacity-50")}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {THEME_OPTIONS.map((option) => {
                const selected = option.key === siteTheme;
                return (
                  <label
                    key={option.key}
                    className={cn(
                      "flex cursor-pointer flex-col gap-2 rounded-md border p-3 transition-colors",
                      selected ? "border-brand ring-1 ring-brand" : "border-ink-100 hover:border-ink-300"
                    )}
                  >
                    <input
                      type="radio"
                      value={option.key}
                      className="sr-only"
                      {...register("siteTheme")}
                    />
                    <span className="flex gap-1">
                      {option.swatches.map((color) => (
                        <span
                          key={color}
                          className="h-5 w-5 rounded-full border border-black/10"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </span>
                    <span className="text-sm font-medium text-ink-900">{option.label}</span>
                    <span className="text-xs text-ink-500">{option.description}</span>
                  </label>
                );
              })}
            </div>

            <Switch
              id="themeEffects"
              checked={themeEffects}
              onChange={(value) => setValue("themeEffects", value, { shouldDirty: true })}
              disabled={!themeEnabled || siteTheme === "NORMAL"}
              label="Animations décoratives"
              description="Neige, confettis, pétales ou cœurs selon le thème (masquées pour les visiteurs qui limitent les animations)."
            />

            <FormField
              label="Message du bandeau (optionnel)"
              htmlFor="themeBannerText"
              error={errors.themeBannerText?.message}
              hint="Affiché en haut de toutes les pages tant qu'un thème saisonnier est actif. Laisser vide pour ne pas afficher de bandeau."
            >
              <Input
                id="themeBannerText"
                placeholder={bannerExample || "Ex. Joyeuses fêtes !"}
                {...register("themeBannerText")}
              />
            </FormField>
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-ink-100 bg-white p-5 shadow-sm">
          <h2 className="font-display text-base text-ink-900">Identité du site</h2>
          <FormField label="Nom du site" htmlFor="siteName" error={errors.siteName?.message}>
            <Input id="siteName" {...register("siteName")} />
          </FormField>
          <FormField label="Description" htmlFor="siteDescription" error={errors.siteDescription?.message}>
            <Textarea id="siteDescription" rows={3} {...register("siteDescription")} />
          </FormField>
        </section>

        <section className="space-y-4 rounded-lg border border-ink-100 bg-white p-5 shadow-sm">
          <h2 className="font-display text-base text-ink-900">Coordonnées</h2>
          <FormField label="Email de contact" htmlFor="contactEmail" error={errors.contactEmail?.message}>
            <Input id="contactEmail" {...register("contactEmail")} />
          </FormField>
          <FormField label="Téléphone" htmlFor="contactPhone" error={errors.contactPhone?.message}>
            <Input id="contactPhone" {...register("contactPhone")} />
          </FormField>
          <FormField label="Adresse" htmlFor="address" error={errors.address?.message}>
            <Input id="address" {...register("address")} />
          </FormField>
          <FormField label="Facebook" htmlFor="facebookUrl" error={errors.facebookUrl?.message}>
            <Input id="facebookUrl" {...register("facebookUrl")} />
          </FormField>
          <FormField label="Instagram" htmlFor="instagramUrl" error={errors.instagramUrl?.message}>
            <Input id="instagramUrl" {...register("instagramUrl")} />
          </FormField>
          <FormField label="LinkedIn" htmlFor="linkedinUrl" error={errors.linkedinUrl?.message}>
            <Input id="linkedinUrl" {...register("linkedinUrl")} />
          </FormField>
        </section>

        <section className="space-y-4 rounded-lg border border-ink-100 bg-white p-5 shadow-sm">
          <h2 className="font-display text-base text-ink-900">SEO global</h2>
          <FormField label="Titre par défaut" htmlFor="seoDefaultTitle" error={errors.seoDefaultTitle?.message}>
            <Input id="seoDefaultTitle" {...register("seoDefaultTitle")} />
          </FormField>
          <FormField label="Meta description par défaut" htmlFor="seoDefaultDescription" error={errors.seoDefaultDescription?.message}>
            <Textarea id="seoDefaultDescription" rows={2} {...register("seoDefaultDescription")} />
          </FormField>
          <FormField label="ID Google Tag Manager" htmlFor="gtmId" error={errors.gtmId?.message}>
            <Input id="gtmId" {...register("gtmId")} placeholder="GTM-XXXXXXX" />
          </FormField>
        </section>

        <section className="space-y-4 rounded-lg border border-ink-100 bg-white p-5 shadow-sm">
          <h2 className="font-display text-base text-ink-900">Footer</h2>
          <FormField label="Texte du footer" htmlFor="footerText" error={errors.footerText?.message}>
            <Textarea id="footerText" rows={3} {...register("footerText")} />
          </FormField>
        </section>
      </div>

      <div className="space-y-6">
        <section className="space-y-3 rounded-lg border border-ink-100 bg-white p-5 shadow-sm">
          <h2 className="font-display text-base text-ink-900">Logo</h2>
          {logo ? (
            <div className="relative h-16 w-full">
              <Image src={logo.url} alt={logo.alt ?? ""} fill className="object-contain" />
            </div>
          ) : null}
          <Button type="button" variant="secondary" size="sm" onClick={() => setLogoPickerOpen(true)}>
            Choisir un logo
          </Button>
          <MediaPicker
            open={logoPickerOpen}
            onClose={() => setLogoPickerOpen(false)}
            onSelect={([media]) => {
              if (!media) return;
              setValue("logoId", media.id);
              setLogo(media);
            }}
          />
        </section>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
        {success ? <p className="text-sm text-green-600">Paramètres enregistrés.</p> : null}
        {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
      </div>
    </form>
  );
}
