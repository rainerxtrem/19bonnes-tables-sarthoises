import { RestaurantForm } from "@/components/admin/restaurant-form";

export const metadata = { title: "Nouveau restaurant | Administration" };

export default function NewRestaurantPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Nouveau restaurant</h1>
      <RestaurantForm />
    </div>
  );
}
