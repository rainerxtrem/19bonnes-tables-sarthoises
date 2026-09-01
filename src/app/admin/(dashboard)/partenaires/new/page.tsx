import { PartnerForm } from "@/components/admin/partner-form";

export const metadata = { title: "Nouveau partenaire | Administration" };

export default function NewPartnerPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Nouveau partenaire</h1>
      <PartnerForm />
    </div>
  );
}
