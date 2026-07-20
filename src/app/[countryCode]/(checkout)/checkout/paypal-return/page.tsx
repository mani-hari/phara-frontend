import PaypalReturnClient from "./paypal-return-client"

// Thin server wrapper — the actual capture + order-completion runs client-side
// in PaypalReturnClient (see that file for why this can't be a server component).
export default function PaypalReturnPage({
  params,
  searchParams,
}: {
  params: { countryCode: string }
  searchParams: { token?: string; PayerID?: string; cartId?: string }
}) {
  return (
    <PaypalReturnClient
      token={searchParams?.token || ""}
      cartId={searchParams?.cartId || ""}
      countryCode={params.countryCode}
    />
  )
}
