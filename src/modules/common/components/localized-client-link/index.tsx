"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import React from "react"
import { localizeHref } from "@lib/util/localize-href"

/**
 * Use this component to create a Next.js `<Link />` that persists the current
 * country code in the url. For the default region (India / "in") the country
 * prefix is omitted so URLs stay clean.
 */
const LocalizedClientLink = ({
  children,
  href,
  ...props
}: {
  children?: React.ReactNode
  href: string
  className?: string
  onClick?: () => void
  passHref?: true
  [x: string]: any
}) => {
  const { countryCode } = useParams()

  return (
    <Link href={localizeHref(countryCode as string, href)} {...props}>
      {children}
    </Link>
  )
}

export default LocalizedClientLink
