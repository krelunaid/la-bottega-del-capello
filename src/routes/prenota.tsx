import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BookingWizard } from "@/components/booking-wizard";
import { listServices, listStylists } from "@/lib/salon-server";
import { staffOnce } from "@/lib/staff-cache";

export const Route = createFileRoute("/prenota")({
  staleTime: 60_000,
  loader: async () => {
    const [stylists, services] = await Promise.all([listStylists(), listServices()]);
    return { stylists, services };
  },
  component: PrenotaPage,
});

function PrenotaPage() {
  const { stylists, services } = Route.useLoaderData();
  const [shop, setShop] = useState(false);
  useEffect(() => {
    staffOnce()
      .then((s) => setShop(Boolean(s)))
      .catch(() => setShop(false));
  }, []);
  return (
    <div className="px-4 py-5 sm:px-6">
      <BookingWizard stylists={stylists} services={services} shopMode={shop} />
    </div>
  );
}
