"use client"

import { Input, Label, clx } from "@medusajs/ui"
import NativeSelect from "@modules/common/components/native-select"

// Nakshatram (Birth Star) options
const NAKSHATRAM_OPTIONS = [
  { value: "ashwini", label: "Ashwini" },
  { value: "bharani", label: "Bharani" },
  { value: "krittika", label: "Krittika" },
  { value: "rohini", label: "Rohini" },
  { value: "mrigashira", label: "Mrigashira" },
  { value: "ardra", label: "Ardra" },
  { value: "punarvasu", label: "Punarvasu" },
  { value: "pushya", label: "Pushya" },
  { value: "ashlesha", label: "Ashlesha" },
  { value: "magha", label: "Magha" },
  { value: "purvaphalguni", label: "Purva Phalguni" },
  { value: "uttaraphalguni", label: "Uttara Phalguni" },
  { value: "hasta", label: "Hasta" },
  { value: "chitra", label: "Chitra" },
  { value: "swati", label: "Swati" },
  { value: "vishakha", label: "Vishakha" },
  { value: "anuradha", label: "Anuradha" },
  { value: "jyeshtha", label: "Jyeshtha" },
  { value: "moola", label: "Moola" },
  { value: "purvashadha", label: "Purva Ashadha" },
  { value: "uttarashadha", label: "Uttara Ashadha" },
  { value: "shravana", label: "Shravana" },
  { value: "dhanishta", label: "Dhanishta" },
  { value: "shatabhisha", label: "Shatabhisha" },
  { value: "purvabhadrapada", label: "Purva Bhadrapada" },
  { value: "uttarabhadrapada", label: "Uttara Bhadrapada" },
  { value: "revati", label: "Revati" },
]

// Rasi (Zodiac Sign) options
const RASI_OPTIONS = [
  { value: "mesha", label: "Mesha (Aries)" },
  { value: "vrishabha", label: "Vrishabha (Taurus)" },
  { value: "mithuna", label: "Mithuna (Gemini)" },
  { value: "karka", label: "Karka (Cancer)" },
  { value: "simha", label: "Simha (Leo)" },
  { value: "kanya", label: "Kanya (Virgo)" },
  { value: "tula", label: "Tula (Libra)" },
  { value: "vrishchika", label: "Vrishchika (Scorpio)" },
  { value: "dhanu", label: "Dhanu (Sagittarius)" },
  { value: "makara", label: "Makara (Capricorn)" },
  { value: "kumbha", label: "Kumbha (Aquarius)" },
  { value: "meena", label: "Meena (Pisces)" },
]

export interface PujaDetails {
  devotee_name: string
  nakshatram: string
  rasi: string
  gothram: string
  date_preference: string
  sankalpam_notes: string
}

interface PujaDetailsFormProps {
  value: PujaDetails
  onChange: (details: PujaDetails) => void
  disabled?: boolean
}

export default function PujaDetailsForm({
  value,
  onChange,
  disabled = false,
}: PujaDetailsFormProps) {
  const updateField = (field: keyof PujaDetails, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue })
  }

  return (
    <div className="bg-ui-bg-subtle rounded-lg p-4 border border-ui-border-base">
      <h3 className="text-ui-fg-base font-semibold mb-2">
        Puja Details for Sankalpam
      </h3>
      <p className="text-ui-fg-subtle text-sm mb-4">
        Please provide the devotee details for the puja. This information will be used during the sankalpam.
      </p>

      <div className="flex flex-col gap-y-4">
        {/* Devotee Name */}
        <div className="flex flex-col gap-y-2">
          <Label className="text-ui-fg-base text-sm">
            Devotee Name <span className="text-ui-fg-error">*</span>
          </Label>
          <Input
            name="devotee_name"
            value={value.devotee_name}
            onChange={(e) => updateField("devotee_name", e.target.value)}
            placeholder="Enter devotee name for sankalpam"
            disabled={disabled}
            required
          />
        </div>

        {/* Nakshatram and Rasi in a row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-y-2">
            <Label className="text-ui-fg-base text-sm">
              Nakshatram (Birth Star)
            </Label>
            <NativeSelect
              name="nakshatram"
              value={value.nakshatram}
              onChange={(e) => updateField("nakshatram", e.target.value)}
              disabled={disabled}
              placeholder="Select Nakshatram"
            >
              {NAKSHATRAM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="flex flex-col gap-y-2">
            <Label className="text-ui-fg-base text-sm">
              Rasi (Zodiac Sign)
            </Label>
            <NativeSelect
              name="rasi"
              value={value.rasi}
              onChange={(e) => updateField("rasi", e.target.value)}
              disabled={disabled}
              placeholder="Select Rasi"
            >
              {RASI_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>

        {/* Gothram */}
        <div className="flex flex-col gap-y-2">
          <Label className="text-ui-fg-base text-sm">
            Gothram
          </Label>
          <Input
            name="gothram"
            value={value.gothram}
            onChange={(e) => updateField("gothram", e.target.value)}
            placeholder="Enter your gothram"
            disabled={disabled}
          />
        </div>

        {/* Preferred Date */}
        <div className="flex flex-col gap-y-2">
          <Label className="text-ui-fg-base text-sm">
            Preferred Date
          </Label>
          <Input
            name="date_preference"
            type="date"
            value={value.date_preference}
            onChange={(e) => updateField("date_preference", e.target.value)}
            disabled={disabled}
          />
          <p className="text-ui-fg-muted text-xs">
            We will try to accommodate your preferred date
          </p>
        </div>

        {/* Sankalpam Notes */}
        <div className="flex flex-col gap-y-2">
          <Label className="text-ui-fg-base text-sm">
            Additional Notes / Sankalpam
          </Label>
          <textarea
            name="sankalpam_notes"
            value={value.sankalpam_notes}
            onChange={(e) => updateField("sankalpam_notes", e.target.value)}
            placeholder="Any additional names or special requests for the puja"
            rows={3}
            disabled={disabled}
            className={clx(
              "w-full px-4 py-2.5 text-base-regular bg-ui-bg-field border border-ui-border-base rounded-md",
              "focus:outline-none focus:border-ui-border-interactive",
              "disabled:bg-ui-bg-disabled disabled:text-ui-fg-disabled",
              "placeholder:text-ui-fg-muted"
            )}
          />
        </div>
      </div>
    </div>
  )
}
