import { Plus } from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/button'

export function AddCustomerButton(props: Omit<ButtonProps, 'children'>) {
  return (
    <Button {...props}>
      <Plus strokeWidth={2.25} aria-hidden />
      Add Customer
    </Button>
  )
}
