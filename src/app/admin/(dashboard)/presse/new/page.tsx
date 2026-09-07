import { PressAssetForm } from "@/components/admin/press-asset-form";

export const metadata = { title: "Nouveau visuel | Administration" };

export default function NewPressAssetPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-900">Ajouter un visuel</h1>
      <PressAssetForm />
    </div>
  );
}
