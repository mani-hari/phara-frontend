"use client"

import Input from "@modules/common/components/input"
import NativeSelect from "@modules/common/components/native-select"
import {
  getProvinceOptions,
  provinceLabel,
} from "@lib/data/regions-provinces"

// State / province control shared by the one-page checkout and the account
// address forms. Countries with a fixed list (in, us, ca, au) get a select of
// FULL names; every other country gets a required free-text input labelled
// "State / Province / Region". Always controlled; always posts as `name`
// (default "province") so FormData-based forms pick it up. Validation lives in
// @lib/data/regions-provinces (validateProvince) so client + server agree.

type Props = {
  countryCode: string
  value: string
  onChange: (value: string) => void
  /** "checkout" = bare control styled like the checkout inputs (the caller
   *  renders the label); "account" = Medusa-UI Input / NativeSelect with its
   *  own floating label. */
  variant?: "checkout" | "account"
  name?: string
  autoComplete?: string
  required?: boolean
  invalid?: boolean
  "data-testid"?: string
}

export default function ProvinceField({
  countryCode,
  value,
  onChange,
  variant = "checkout",
  name = "province",
  autoComplete = "address-level1",
  required = true,
  invalid,
  "data-testid": testId = "state-input",
}: Props) {
  const options = getProvinceOptions(countryCode)
  const label = provinceLabel(countryCode)

  if (variant === "account") {
    if (options) {
      return (
        <NativeSelect
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          autoComplete={autoComplete}
          placeholder={`${label}${required ? " *" : ""}`}
          aria-invalid={invalid || undefined}
          data-testid={testId}
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </NativeSelect>
      )
    }
    return (
      <Input
        label={label}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={2}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        data-testid={testId}
      />
    )
  }

  if (options) {
    return (
      <select
        className="ph-input co-input"
        style={{ width: "100%" }}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        aria-label={label}
        aria-invalid={invalid || undefined}
        data-testid={testId}
      >
        <option value="" disabled>
          Select {label.toLowerCase()}…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    )
  }
  return (
    <input
      className="ph-input co-input"
      style={{ width: "100%" }}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      minLength={2}
      autoComplete={autoComplete}
      aria-label={label}
      aria-invalid={invalid || undefined}
      data-testid={testId}
    />
  )
}
