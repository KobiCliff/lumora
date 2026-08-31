import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-control font-semibold ease-lumora transition-[transform,background-color,box-shadow,border-color,color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumora-500 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-lumora-600 text-white shadow-lift hover:bg-lumora-500 hover:shadow-lift-lg",
        outline:
          "border-2 border-hairline bg-surface text-strong hover:border-lumora-400 hover:text-lumora-600",
        ghost: "text-muted hover:bg-lumora-500/10 hover:text-lumora-600",
        danger: "bg-danger/10 text-danger hover:bg-danger/20",
        /** White-on-dark, for use over the ink gradients. The Hero CTA. */
        invert: "bg-white text-ink-950 shadow-glow hover:scale-105",
        /** Outlined white-on-dark, the Hero's secondary CTA. */
        invertOutline:
          "border-2 border-white/50 text-white hover:bg-white hover:text-ink-950",
      },
      size: {
        sm: "h-9 gap-1.5 px-3.5 text-sm",
        default: "h-11 gap-2 px-5 text-base",
        lg: "h-13 gap-2.5 px-7 text-lg",
        /** Marketing CTA scale. */
        xl: "gap-3 px-12 py-6 text-xl font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render the child element instead of a <button>, e.g. a next/link <Link>. */
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : "button";
    return (
      <Component
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
