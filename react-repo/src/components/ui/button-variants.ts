import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-foreground/20 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-foreground text-background shadow-xs hover:bg-foreground/85',
        outline: 'border border-border bg-surface shadow-xs hover:bg-background',
        ghost: 'hover:bg-foreground/5',
        danger: 'bg-danger text-white shadow-xs hover:bg-danger/90',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)
