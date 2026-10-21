import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getT } from "@/i18n/server";
import { requirePermission } from "@/lib/auth/session";

import { CustomerForm } from "../customer-forms";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).customers.add };
}

export default async function NewCustomerPage() {
  await requirePermission("customers.manage");
  const c = (await getT()).customers;
  return (
    <div className="grid max-w-3xl gap-8">
      <PageHeader
        title={c.newTitle}
        description={c.newDescription}
      />
      <Card>
        <CardContent>
          <CustomerForm />
        </CardContent>
      </Card>
    </div>
  );
}
