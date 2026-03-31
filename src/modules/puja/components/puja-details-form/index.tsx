"use client"

import { Input, Label, clx } from "@medusajs/ui"
import NativeSelect from "@modules/common/components/native-select"
import { Plus, Trash2 } from "lucide-react"

export interface DevoteeInfo {
  name: string
  nakshatram: string
  rasi: string
  gothram: string
}

export interface PujaDetails {
  devotees: DevoteeInfo[]
  date_preference: string
  sankalpam_notes: string
}

export const emptyDevotee: DevoteeInfo = {
  name: "",
  nakshatram: "",
  rasi: "",
  gothram: "",
}

// Nakshatram (Birth Star) with Tamil transliterations
const NAKSHATRAM_OPTIONS = [
  { value: "ashwini", label: "Ashwini (அஸ்வினி)" },
  { value: "bharani", label: "Bharani (பரணி)" },
  { value: "krittika", label: "Krittika (கார்த்திகை)" },
  { value: "rohini", label: "Rohini (ரோகிணி)" },
  { value: "mrigashira", label: "Mrigashira (மிருகசீரிடம்)" },
  { value: "ardra", label: "Ardra (திருவாதிரை)" },
  { value: "punarvasu", label: "Punarvasu (புனர்பூசம்)" },
  { value: "pushya", label: "Pushya (பூசம்)" },
  { value: "ashlesha", label: "Ashlesha (ஆயில்யம்)" },
  { value: "magha", label: "Magha (மகம்)" },
  { value: "purvaphalguni", label: "Purva Phalguni (பூரம்)" },
  { value: "uttaraphalguni", label: "Uttara Phalguni (உத்திரம்)" },
  { value: "hasta", label: "Hasta (ஹஸ்தம்)" },
  { value: "chitra", label: "Chitra (சித்திரை)" },
  { value: "swati", label: "Swati (சுவாதி)" },
  { value: "vishakha", label: "Vishakha (விசாகம்)" },
  { value: "anuradha", label: "Anuradha (அனுஷம்)" },
  { value: "jyeshtha", label: "Jyeshtha (கேட்டை)" },
  { value: "moola", label: "Moola (மூலம்)" },
  { value: "purvashadha", label: "Purva Ashadha (பூராடம்)" },
  { value: "uttarashadha", label: "Uttara Ashadha (உத்திராடம்)" },
  { value: "shravana", label: "Shravana (திருவோணம்)" },
  { value: "dhanishta", label: "Dhanishta (அவிட்டம்)" },
  { value: "shatabhisha", label: "Shatabhisha (சதயம்)" },
  { value: "purvabhadrapada", label: "Purva Bhadrapada (பூரட்டாதி)" },
  { value: "uttarabhadrapada", label: "Uttara Bhadrapada (உத்திரட்டாதி)" },
  { value: "revati", label: "Revati (ரேவதி)" },
]

// Rasi (Zodiac Sign) with Tamil transliterations
const RASI_OPTIONS = [
  { value: "mesha", label: "Mesha / Aries (மேஷம்)" },
  { value: "vrishabha", label: "Vrishabha / Taurus (ரிஷபம்)" },
  { value: "mithuna", label: "Mithuna / Gemini (மிதுனம்)" },
  { value: "karka", label: "Kataka / Cancer (கடகம்)" },
  { value: "simha", label: "Simha / Leo (சிம்மம்)" },
  { value: "kanya", label: "Kanya / Virgo (கன்னி)" },
  { value: "tula", label: "Tula / Libra (துலாம்)" },
  { value: "vrishchika", label: "Vrishchika / Scorpio (விருச்சிகம்)" },
  { value: "dhanu", label: "Dhanus / Sagittarius (தனுசு)" },
  { value: "makara", label: "Makara / Capricorn (மகரம்)" },
  { value: "kumbha", label: "Kumbha / Aquarius (கும்பம்)" },
  { value: "meena", label: "Meena / Pisces (மீனம்)" },
]

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
  const addDevotee = () => {
    if (value.devotees.length >= 4) return
    onChange({
      ...value,
      devotees: [...value.devotees, { ...emptyDevotee }],
    })
  }

  const removeDevotee = (index: number) => {
    if (value.devotees.length <= 1) return
    onChange({
      ...value,
      devotees: value.devotees.filter((_, i) => i !== index),
    })
  }

  const updateDevotee = (
    index: number,
    field: keyof DevoteeInfo,
    fieldValue: string
  ) => {
    const updated = [...value.devotees]
    updated[index] = { ...updated[index], [field]: fieldValue }
    onChange({ ...value, devotees: updated })
  }

  return (
    <div className="bg-brand-50/50 rounded-xl p-5 border border-brand-100">
      <h3 className="text-grey-90 font-semibold mb-1">
        Puja Sankalpam Details
      </h3>
      <p className="text-grey-50 text-sm mb-5">
        Enter devotee details for the puja. You can add up to 4 devotees per
        booking.
      </p>

      <div className="flex flex-col gap-y-4">
        {/* Devotee Entries */}
        {value.devotees.map((devotee, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-grey-10 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-grey-70">
                Devotee {index + 1}
              </span>
              {value.devotees.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDevotee(index)}
                  disabled={disabled}
                  className="text-red-400 hover:text-red-600 p-1 rounded transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Devotee Name */}
              <div className="flex flex-col gap-y-1">
                <Label className="text-xs text-grey-60">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={devotee.name}
                  onChange={(e) => updateDevotee(index, "name", e.target.value)}
                  placeholder="Full name for sankalpam"
                  disabled={disabled}
                  required
                />
              </div>

              {/* Nakshatram */}
              <div className="flex flex-col gap-y-1">
                <Label className="text-xs text-grey-60">
                  Nakshatram (Birth Star)
                </Label>
                <NativeSelect
                  value={devotee.nakshatram}
                  onChange={(e) =>
                    updateDevotee(index, "nakshatram", e.target.value)
                  }
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

              {/* Rasi */}
              <div className="flex flex-col gap-y-1">
                <Label className="text-xs text-grey-60">
                  Rasi (Zodiac Sign)
                </Label>
                <NativeSelect
                  value={devotee.rasi}
                  onChange={(e) =>
                    updateDevotee(index, "rasi", e.target.value)
                  }
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

              {/* Gothram */}
              <div className="flex flex-col gap-y-1">
                <Label className="text-xs text-grey-60">Gothram</Label>
                <Input
                  value={devotee.gothram}
                  onChange={(e) =>
                    updateDevotee(index, "gothram", e.target.value)
                  }
                  placeholder="Family lineage"
                  disabled={disabled}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add Devotee Button */}
        {value.devotees.length < 4 && (
          <button
            type="button"
            onClick={addDevotee}
            disabled={disabled}
            className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Another Devotee ({value.devotees.length}/4)
          </button>
        )}

        {/* Shared Fields */}
        <div className="pt-3 border-t border-grey-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Preferred Date */}
          <div className="flex flex-col gap-y-1">
            <Label className="text-xs text-grey-60">Preferred Date</Label>
            <Input
              type="date"
              value={value.date_preference}
              onChange={(e) =>
                onChange({ ...value, date_preference: e.target.value })
              }
              disabled={disabled}
            />
            <p className="text-grey-40 text-xs">
              We will accommodate your preferred date
            </p>
          </div>

          {/* Sankalpam Notes */}
          <div className="flex flex-col gap-y-1 sm:col-span-2">
            <Label className="text-xs text-grey-60">
              Special Prayer / Additional Notes
            </Label>
            <textarea
              value={value.sankalpam_notes}
              onChange={(e) =>
                onChange({ ...value, sankalpam_notes: e.target.value })
              }
              placeholder="Any specific prayer request or additional details for the priest..."
              rows={3}
              disabled={disabled}
              className={clx(
                "w-full px-3 py-2 text-sm bg-white border border-grey-20 rounded-lg",
                "focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400",
                "disabled:bg-grey-5 disabled:text-grey-40",
                "placeholder:text-grey-30 transition-colors"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
