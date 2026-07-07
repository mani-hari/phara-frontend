"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { XMark } from "@medusajs/icons"
import { Text } from "@medusajs/ui"
import { Fragment } from "react"
import {
  Home,
  Flame,
  Info,
  HelpCircle,
  Phone,
  User,
  ShoppingCart,
  Sparkles,
  BookOpen,
} from "lucide-react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

const SideMenuItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Pujas", href: "/collections/pujas-and-homams", icon: Flame },
  { name: "How It Works", href: "/how-it-works", icon: BookOpen },
  { name: "Astrology", href: "/astrology", icon: Sparkles },
  { name: "About", href: "/about", icon: Info },
  { name: "FAQ", href: "/faq", icon: HelpCircle },
  { name: "Blog", href: "/blog", icon: BookOpen },
  { name: "Contact", href: "/contact", icon: Phone },
  { name: "Account", href: "/account", icon: User },
  { name: "Cart", href: "/cart", icon: ShoppingCart },
]

const SideMenu = ({ regions }: { regions: HttpTypes.StoreRegion[] | null }) => {
  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center transition-all ease-out duration-200 focus:outline-none text-grey-70 hover:text-brand-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                </Popover.Button>
              </div>

              {open && (
                <div
                  className="fixed inset-0 z-[50] bg-black/20 backdrop-blur-sm pointer-events-auto"
                  onClick={close}
                  data-testid="side-menu-backdrop"
                />
              )}

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 -translate-x-4"
                enterTo="opacity-100 translate-x-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-x-0"
                leaveTo="opacity-0 -translate-x-4"
              >
                <PopoverPanel className="flex flex-col absolute w-[85vw] sm:w-80 h-[calc(100vh-1rem)] z-[51] inset-y-0 left-0 text-sm m-2">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex flex-col h-full rounded-xl shadow-2xl border border-brand-100 justify-between p-6 overflow-y-auto"
                    style={{ background: "var(--paper)" }}
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-brand-700">
                            Parihara
                          </span>
                          <span className="text-lg font-light text-grey-50">
                            Online
                          </span>
                        </div>
                        <button
                          data-testid="close-menu-button"
                          onClick={close}
                          className="p-1 rounded-lg hover:bg-brand-50 transition-colors"
                        >
                          <XMark className="text-grey-60" />
                        </button>
                      </div>

                      {/* Menu Items */}
                      <ul className="flex flex-col gap-1">
                        {SideMenuItems.map(({ name, href, icon: Icon }) => (
                          <li key={name}>
                            <LocalizedClientLink
                              href={href}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-grey-70 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                              onClick={close}
                              data-testid={`${name.toLowerCase()}-link`}
                            >
                              <Icon className="w-5 h-5" />
                              <span className="text-base font-medium">
                                {name}
                              </span>
                            </LocalizedClientLink>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Footer */}
                    <div className="pt-6 border-t border-brand-100">
                      <Text className="text-xs text-grey-40">
                        &copy; {new Date().getFullYear()} PariharaOnline. All
                        rights reserved.
                      </Text>
                      <Text className="text-xs text-grey-40 mt-1">
                        Ancient Rituals, Modern Convenience
                      </Text>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
