import { createContext, useContext } from 'react'

export const CheckoutContext = createContext(null)

export function useCheckout() {
  const checkout = useContext(CheckoutContext)
  if (!checkout) throw new Error('useCheckout requiere CheckoutLayout')
  return checkout
}
