"use client"

import { Plus } from "@medusajs/icons"
import { Button, Heading } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useFormState } from "react-dom"

import useToggleState from "@lib/hooks/use-toggle-state"
import CountrySelect from "@modules/checkout/components/country-select"
import Input from "@modules/common/components/input"
import Modal from "@modules/common/components/modal"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { HttpTypes } from "@medusajs/types"
import { addCustomerAddress } from "@lib/data/customer"
import ProvinceField from "@modules/common/components/province-field"
import {
  normalizeProvince,
  validateCity,
  validateProvince,
} from "@lib/data/regions-provinces"

const AddAddress = ({
  region,
  addresses,
}: {
  region: HttpTypes.StoreRegion
  addresses: HttpTypes.StoreCustomerAddress[]
}) => {
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)
  // Country + state are controlled so the state control can switch between a
  // list (in/us/ca/au) and free text, and be validated before submit.
  const [country, setCountry] = useState("")
  const [province, setProvince] = useState("")
  const [errors, setErrors] = useState<{ city?: string; province?: string }>({})

  const [formState, formAction] = useFormState(addCustomerAddress, {
    isDefaultShipping: addresses.length === 0,
    success: false,
    error: null,
  })

  const close = () => {
    setSuccessState(false)
    setCountry("")
    setProvince("")
    setErrors({})
    closeModal()
  }

  // City + state rules (same as checkout): block submit with inline messages.
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget)
    const next = {
      city: validateCity(fd.get("city") as string) || undefined,
      province: validateProvince(province, country) || undefined,
    }
    setErrors(next)
    if (next.city || next.province) e.preventDefault()
  }

  useEffect(() => {
    if (successState) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true)
    }
  }, [formState])

  return (
    <>
      <button
        className="border border-ui-border-base rounded-rounded p-5 min-h-[220px] h-full w-full flex flex-col justify-between"
        onClick={open}
        data-testid="add-address-button"
      >
        <span className="text-base-semi">New address</span>
        <Plus />
      </button>

      <Modal isOpen={state} close={close} data-testid="add-address-modal">
        <Modal.Title>
          <Heading className="mb-2">Add address</Heading>
        </Modal.Title>
        <form action={formAction} onSubmit={onSubmit}>
          <Modal.Body>
            <div className="flex flex-col gap-y-2">
              <div className="grid grid-cols-2 gap-x-2">
                <Input
                  label="First name"
                  name="first_name"
                  required
                  autoComplete="given-name"
                  data-testid="first-name-input"
                />
                <Input
                  label="Last name"
                  name="last_name"
                  required
                  autoComplete="family-name"
                  data-testid="last-name-input"
                />
              </div>
              <Input
                label="Company"
                name="company"
                autoComplete="organization"
                data-testid="company-input"
              />
              <Input
                label="Address"
                name="address_1"
                required
                autoComplete="address-line1"
                data-testid="address-1-input"
              />
              <Input
                label="Apartment, suite, etc."
                name="address_2"
                autoComplete="address-line2"
                data-testid="address-2-input"
              />
              <div className="grid grid-cols-[144px_1fr] gap-x-2">
                <Input
                  label="Postal code"
                  name="postal_code"
                  required
                  autoComplete="postal-code"
                  data-testid="postal-code-input"
                />
                <Input
                  label="City"
                  name="city"
                  required
                  minLength={2}
                  autoComplete="address-level2"
                  onChange={() => errors.city && setErrors((p) => ({ ...p, city: undefined }))}
                  data-testid="city-input"
                />
              </div>
              {errors.city && (
                <p className="text-rose-500 text-small-regular" data-testid="city-error">
                  {errors.city}
                </p>
              )}
              <CountrySelect
                region={region}
                name="country_code"
                required
                autoComplete="country"
                value={country}
                onChange={(e) => {
                  const cc = e.target.value
                  setCountry(cc)
                  setProvince((p) => normalizeProvince(p, cc))
                  setErrors((p) => ({ ...p, province: undefined }))
                }}
                data-testid="country-select"
              />
              <ProvinceField
                variant="account"
                countryCode={country}
                value={province}
                onChange={(v) => {
                  setProvince(v)
                  setErrors((p) => ({ ...p, province: undefined }))
                }}
                invalid={!!errors.province}
              />
              {errors.province && (
                <p className="text-rose-500 text-small-regular" data-testid="state-error">
                  {errors.province}
                </p>
              )}
              <Input
                label="Phone"
                name="phone"
                autoComplete="phone"
                data-testid="phone-input"
              />
            </div>
            {formState.error && (
              <div
                className="text-rose-500 text-small-regular py-2"
                data-testid="address-error"
              >
                {formState.error}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3 mt-6">
              <Button
                type="reset"
                variant="secondary"
                onClick={close}
                className="h-10"
                data-testid="cancel-button"
              >
                Cancel
              </Button>
              <SubmitButton data-testid="save-button">Save</SubmitButton>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

export default AddAddress
