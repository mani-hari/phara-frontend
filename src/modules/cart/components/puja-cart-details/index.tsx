"use client"

import { updateCartPujaDetails } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import PujaDetailsForm, {
  PujaDetails,
  emptyDevotee,
} from "@modules/puja/components/puja-details-form"
import { Loader2 } from "lucide-react"
import { useMemo, useState, useTransition } from "react"

const getInitialDetails = (cart: HttpTypes.StoreCart): PujaDetails => {
  const metadata = (cart.metadata || {}) as Record<string, unknown>
  const serialized =
    typeof metadata.puja_details === "string" ? metadata.puja_details : null

  if (serialized) {
    try {
      const parsed = JSON.parse(serialized) as PujaDetails

      return {
        devotees:
          parsed.devotees?.length > 0 ? parsed.devotees : [{ ...emptyDevotee }],
        date_preference: parsed.date_preference || "",
        sankalpam_notes: parsed.sankalpam_notes || "",
      }
    } catch {}
  }

  const devotees = (() => {
    if (typeof metadata.devotees !== "string") {
      return [{ ...emptyDevotee }]
    }

    try {
      const parsed = JSON.parse(metadata.devotees) as PujaDetails["devotees"]
      return parsed.length > 0 ? parsed : [{ ...emptyDevotee }]
    } catch {
      return [{ ...emptyDevotee }]
    }
  })()

  return {
    devotees,
    date_preference:
      typeof metadata.date_preference === "string"
        ? metadata.date_preference
        : "",
    sankalpam_notes:
      typeof metadata.sankalpam_notes === "string"
        ? metadata.sankalpam_notes
        : "",
  }
}

export default function PujaCartDetails({
  cart,
}: {
  cart: HttpTypes.StoreCart
}) {
  const [details, setDetails] = useState<PujaDetails>(() => getInitialDetails(cart))
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const devoteeCount = useMemo(
    () => details.devotees.filter((devotee) => devotee.name.trim() !== "").length,
    [details.devotees]
  )

  const saveDetails = () => {
    setMessage(null)

    startTransition(async () => {
      await updateCartPujaDetails(details)
      setMessage("Devotee details saved to this cart.")
    })
  }

  return (
    <section className="rounded-2xl border border-grey-10 bg-white p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-[28px] leading-tight text-grey-90">
            Devotee Details
          </h2>
          <p className="mt-2 text-sm leading-6 text-grey-50">
            These sankalpam details apply to this order and stay attached to the
            cart while you continue to checkout.
          </p>
        </div>
        <div className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
          {devoteeCount}/4 devotees
        </div>
      </div>

      <PujaDetailsForm value={details} onChange={setDetails} disabled={isPending} />

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-xs text-grey-50">
          Fill this once for the family members included in the booking.
        </p>
        <button
          type="button"
          onClick={saveDetails}
          disabled={isPending || details.devotees[0]?.name.trim() === ""}
          className="inline-flex items-center gap-2 rounded-full bg-brand-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Details
        </button>
      </div>

      {message && <p className="mt-3 text-sm text-brand-700">{message}</p>}
    </section>
  )
}
