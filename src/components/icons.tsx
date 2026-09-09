import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 18, className, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true as const,
    ...props,
  };
}

export function DeliveryScooterIcon(props: IconProps) {
  return (
    <svg {...base({ strokeWidth: 1.7, ...props })}>
      <circle cx="6.5" cy="17.5" r="2.2" />
      <circle cx="17.5" cy="17.5" r="2.2" />
      <path d="M8.8 17.5h5.2" />
      <path d="M14 17.5V9.2h3.2l1.8 3.6H14" />
      <path d="M14 11.2H9.2L7.4 17.5" />
      <path d="M9.5 9.2h2.2" />
      <path d="M17.2 9.2V7.4h2.4" />
    </svg>
  );
}

export function BrandMark({
  size = 40,
  className = "",
  iconSize,
}: {
  size?: number;
  className?: string;
  iconSize?: number;
}) {
  const box = typeof size === "number" ? `${size}px` : size;
  const glyph = iconSize ?? Math.round((typeof size === "number" ? size : 40) * 0.72);
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl bg-brand text-white shadow-[0_0_20px_rgba(255,107,0,0.35)] ${className}`}
      style={{ width: box, height: box }}
      aria-hidden
    >
      <DeliveryScooterIcon size={glyph} className="text-black" />
    </span>
  );
}

export function CartIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 5h2l1.5 10h11L20 8H7" />
      <circle cx="9.5" cy="19" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="19" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}

export function PizzaIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3c5 1.2 8.5 5.8 8.5 11.2 0 .8-.1 1.5-.3 2.2L12 21 3.8 16.4c-.2-.7-.3-1.4-.3-2.2C3.5 8.8 7 4.2 12 3Z" />
      <circle cx="10" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MarketIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 9h16l-1.2 10.2a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8L4 9Z" />
      <path d="M8 9V7a4 4 0 0 1 8 0v2" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7.5 3.8c.4-.4 1-.5 1.5-.3l2.2 1c.5.2.8.7.8 1.2v2.2c0 .4-.2.8-.5 1L10 10.3c1.2 2.2 3 4 5.2 5.2l1.4-1.5c.3-.3.7-.5 1.1-.5h2.2c.5 0 1 .3 1.2.8l1 2.2c.2.5.1 1.1-.3 1.5l-1.3 1.3c-.4.4-1 .6-1.6.5C11.5 20.4 3.6 12.5 2.7 5.2c-.1-.6.1-1.2.5-1.6L7.5 3.8Z" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5L15 15" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg {...base({ ...props, strokeWidth: props.strokeWidth ?? 1.5 })}>
      <path
        d="m12 3.5 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.8 7.2 18.4l.9-5.4-3.9-3.8 5.4-.8L12 3.5Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function StoreGlyph({
  storeId,
  category,
  size = 20,
  className,
}: {
  storeId?: string;
  category?: string;
  size?: number;
  className?: string;
}) {
  if (storeId === "king-pizza" || category === "restaurant") {
    return <PizzaIcon size={size} className={className} />;
  }
  return <MarketIcon size={size} className={className} />;
}
