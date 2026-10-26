import type { AppointmentListItem } from "./appointments";
import { customerSearchFilter } from "./customer-search";
import { supabase } from "./supabase";

export type CustomerListItem = {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
};

/** Up to 50 clients by name; RLS limits staff to the clients they see. */
export async function searchCustomers(businessId: string, term: string) {
  let query = supabase
    .from("customers")
    .select("id, first_name, last_name, email, phone")
    .eq("business_id", businessId);
  const filter = customerSearchFilter(term);
  if (filter) query = query.or(filter);
  const { data, error } = await query.order("first_name").order("last_name").limit(50);
  if (error) throw error;
  return (data ?? []) as CustomerListItem[];
}

export async function getCustomer(id: string) {
  const { data, error } = await supabase
    .from("customers")
    .select("id, first_name, last_name, email, phone")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function customerAppointments(customerId: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id, starts_at, ends_at, status, service_name, staff_id, price_cents, currency, customer:customers(id, first_name, last_name), staff:staff_members(display_name)",
    )
    .eq("customer_id", customerId)
    .order("starts_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as AppointmentListItem[];
}

export async function customerNotes(customerId: string) {
  const { data, error } = await supabase
    .from("customer_notes")
    .select("id, body, created_at")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addCustomerNote(input: {
  businessId: string;
  customerId: string;
  body: string;
  userId: string;
}) {
  return supabase.from("customer_notes").insert({
    business_id: input.businessId,
    customer_id: input.customerId,
    body: input.body,
    created_by: input.userId,
  });
}
