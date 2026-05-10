"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { adminUpdateBookOrder } from "@/app/actions/admin-books";
import { bookFulfillmentLabel, bookOrderPaymentLabel } from "@/lib/books-labels";
import type { Book, BookOrder } from "@prisma/client";

function SaveBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-lg bg-fhj-navy px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
      {pending ? "…" : "Sauver"}
    </button>
  );
}

export function AdminBookOrderRow({ order, book }: { order: BookOrder; book: Book }) {
  const bound = adminUpdateBookOrder.bind(null, order.id);
  const [state, action] = useActionState(bound, null);

  return (
    <tr className="border-t border-fhj-navy/10 align-top text-sm">
      <td className="whitespace-nowrap px-3 py-3 text-xs text-fhj-navy/65">{order.createdAt.toLocaleString("fr-FR")}</td>
      <td className="px-3 py-3">
        <div className="font-medium">
          {order.customerFirstName} {order.customerLastName}
        </div>
        <div className="text-xs text-fhj-navy/60">{order.customerEmail}</div>
        {order.customerPhone && <div className="text-xs text-fhj-navy/50">{order.customerPhone}</div>}
      </td>
      <td className="px-3 py-3">{book.title}</td>
      <td className="px-3 py-3">{order.quantity}</td>
      <td className="px-3 py-3 font-medium">{(order.totalPrice / 100).toFixed(2)} €</td>
      <td className="px-3 py-3 text-xs">{bookOrderPaymentLabel(order.paymentStatus)}</td>
      <td className="min-w-[280px] px-3 py-3">
        <form action={action} className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <select name="orderStatus" defaultValue={order.orderStatus} className="rounded-lg border px-2 py-1.5 text-xs">
              <option value="PENDING">{bookFulfillmentLabel("PENDING")}</option>
              <option value="PROCESSING">{bookFulfillmentLabel("PROCESSING")}</option>
              <option value="SHIPPED">{bookFulfillmentLabel("SHIPPED")}</option>
              <option value="DELIVERED">{bookFulfillmentLabel("DELIVERED")}</option>
              <option value="CANCELLED">{bookFulfillmentLabel("CANCELLED")}</option>
            </select>
            <SaveBtn />
          </div>
          <input name="trackingNumber" placeholder="N° suivi" defaultValue={order.trackingNumber ?? ""} className="w-full rounded-lg border px-2 py-1.5 text-xs" />
          <input name="adminNote" placeholder="Note interne" defaultValue={order.adminNote ?? ""} className="w-full rounded-lg border px-2 py-1.5 text-xs" />
          {state && !state.ok && <span className="text-xs text-red-600">{state.error}</span>}
          {state?.ok && <span className="text-xs text-emerald-700">Enregistré.</span>}
        </form>
        {(order.shippingAddress || order.shippingCity) && (
          <p className="mt-2 max-w-sm text-xs leading-relaxed text-fhj-navy/55">
            {order.shippingAddress}
            <br />
            {order.shippingPostalCode} {order.shippingCity}, {order.shippingCountry}
          </p>
        )}
      </td>
    </tr>
  );
}
