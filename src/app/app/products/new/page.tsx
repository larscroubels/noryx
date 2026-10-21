import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getT } from "@/i18n/server";
import { can, requirePermission } from "@/lib/auth/session";

import { ProductForm } from "../product-forms";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).retail.products.new };
}

export default async function NewProductPage() {
  const workspace = await requirePermission("products.manage");
  const p = (await getT()).retail.products;
  return (
    <div className="grid max-w-3xl gap-8">
      <PageHeader
        title={p.new}
        description={p.newDescription}
      />
      <Card>
        <CardContent>
          <ProductForm canSetStock={can(workspace, "inventory.manage")} />
        </CardContent>
      </Card>
    </div>
  );
}
