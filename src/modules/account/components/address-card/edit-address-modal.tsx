"use client"

import React, { useEffect, useState } from "react"
import { useFormState } from "react-dom"
import { PencilSquare as Edit, Trash } from "@medusajs/icons"
import { Button, Heading, Text, clx } from "@medusajs/ui"

import useToggleState from "@lib/hooks/use-toggle-state"
import CountrySelect from "@modules/checkout/components/country-select"
import Input from "@modules/common/components/input"
import Modal from "@modules/common/components/modal"
import Spinner from "@modules/common/icons/spinner"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { HttpTypes } from "@medusajs/types"
import {
  deleteCustomerAddress,
  updateCustomerAddress,
} from "@lib/data/customer"
import ProvinceField from "@modules/common/components/province-field"
import {
  normalizeProvince,
  validateCity,
  validateProvince,
} from "@lib/data/regions-provinces"

type EditAddressProps = {
  region: HttpTypes.StoreRegion
  address: HttpTypes.StoreCustomerAddress
  isActive?: boolean
}

const EditAddress: React.FC<EditAddressProps> = ({
  region,
  address,
  isActive = false,
}) => {
  const [removing, setRemoving] = useState(false)
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)
  // Controlled country + state (list for in/us/ca/au, free text elsewhere).
  // A legacy code ("TN", "ca") is normalised to the full name; an unknown
  // value for a list country starts empty so the customer is prompted.
  const initialCountry = address.country_code || ""
  const [country, setCountry] = useState(initialCountry)
  const [province, setProvince] = useState(
    normalizeProvince(address.province, initialCountry)
  )
  const [errors, setErrors] = useState<{ city?: string; province?: string }>({})

  const [formState, formAction] = useFormState(updateCustomerAddress, {
    success: false,
    error: null,
    addressId: address.id,
  })

  const close = () => {
    setSuccessState(false)
    setCountry(initialCountry)
    setProvince(normalizeProvince(address.province, initialCountry))
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

  const removeAddress = async () => {
    setRemoving(true)
    await deleteCustomerAddress(address.id)
    setRemoving(false)
  }

  return (
    <>
      <div
        className={clx(
          "border rounded-rounded p-5 min-h-[220px] h-full w-full flex flex-col justify-between transition-colors",
          {
            "border-gray-900": isActive,
          }
        )}
        data-testid="address-container"
      >
        <div className="flex flex-col">
          <Heading
            className="text-left text-base-semi"
            data-testid="address-name"
          >
            {address.first_name} {address.last_name}
          </Heading>
          {address.company && (
            <Text
              className="txt-compact-small text-ui-fg-base"
              data-testid="address-company"
            >
              {address.company}
            </Text>
          )}
          <Text className="flex flex-col text-left text-base-regular mt-2">
            <span data-testid="address-address">
              {address.address_1}
              {address.address_2 && <span>, {address.address_2}</span>}
            </span>
            <span data-testid="address-postal-city">
              {[address.city, address.postal_code].filter(Boolean).join(", ")}
            </span>
            <span data-testid="address-province-country">
              {address.province ? (
                `${address.province}, `
              ) : (
                <span className="text-rose-500">State missing — please edit, </span>
              )}
              {address.country_code?.toUpperCase()}
            </span>
          </Text>
        </div>
        <div className="flex items-center gap-x-4">
          <button
            className="text-small-regular text-ui-fg-base flex items-center gap-x-2"
            onClick={open}
            data-testid="address-edit-button"
          >
            <Edit />
            Edit
          </button>
          <button
            className="text-small-regular text-ui-fg-base flex items-center gap-x-2"
            onClick={removeAddress}
            data-testid="address-delete-button"
          >
            {removing ? <Spinner /> : <Trash />}
            Remove
          </button>
        </div>
      </div>

      <Modal isOpen={state} close={close} data-testid="edit-address-modal">
        <Modal.Title>
          <Heading className="mb-2">Edit address</Heading>
        </Modal.Title>
        <form action={formAction} onSubmit={onSubmit}>
          <input type="hidden" name="addressId" value={address.id} />
          <Modal.Body>
            <div className="grid grid-cols-1 gap-y-2">
              <div className="grid grid-cols-2 gap-x-2">
                <Input
                  label="First name"
                  name="first_name"
                  required
                  autoComplete="given-name"
                  defaultValue={address.first_name || undefined}
                  data-testid="first-name-input"
                />
                <Input
                  label="Last name"
                  name="last_name"
                  required
                  autoComplete="family-name"
                  defaultValue={address.last_name || undefined}
                  data-testid="last-name-input"
                />
              </div>
              <Input
                label="Company"
                name="company"
                autoComplete="organization"
                defaultValue={address.company || undefined}
                data-testid="company-input"
              />
              <Input
                label="Address"
                name="address_1"
                required
                autoComplete="address-line1"
                defaultValue={address.address_1 || undefined}
                data-testid="address-1-input"
              />
              <Input
                label="Apartment, suite, etc."
                name="address_2"
                autoComplete="address-line2"
                defaultValue={address.address_2 || undefined}
                data-testid="address-2-input"
              />
              <div className="grid grid-cols-[144px_1fr] gap-x-2">
                <Input
                  label="Postal code"
                  name="postal_code"
                  required
                  autoComplete="postal-code"
                  defaultValue={address.postal_code || undefined}
                  data-testid="postal-code-input"
                />
                <Input
                  label="City"
                  name="city"
                  required
                  minLength={2}
                  autoComplete="address-level2"
                  defaultValue={address.city || undefined}
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
                name="country_code"
                region={region}
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
                defaultValue={address.phone || undefined}
                data-testid="phone-input"
              />
            </div>
            {formState.error && (
              <div className="text-rose-500 text-small-regular py-2">
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

export default EditAddress
