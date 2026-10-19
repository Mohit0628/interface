import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

// ---------------------------------------------------------------------------
// Base primitive
//
// The loading sheen is a transform-only sweep drawn on ::before, so it never
// triggers layout. globals.css disables it under reduced motion.
// ---------------------------------------------------------------------------

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden bg-muted before:absolute before:inset-0 before:-translate-x-full before:animate-skeleton-sweep before:bg-linear-to-r before:from-transparent before:via-foreground/5 before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

// ---------------------------------------------------------------------------
// Presets
//
// Each preset is a thin wrapper that fixes the shape, then accepts `className`
// for width / spacing overrides at the call site.
// ---------------------------------------------------------------------------

// -- Text line ---------------------------------------------------------------
// Default: single line, normal text height, rounded-sm matches design tokens.
export interface SkeletonTextProps extends React.ComponentProps<"div"> {
  /** Number of lines to render (default 1). */
  lines?: number
  /** Height of each line (default "h-3"). */
  lineHeight?: string
}

function SkeletonText({
  lines = 1,
  lineHeight = "h-3",
  className,
  ...props
}: SkeletonTextProps) {
  if (lines === 1) {
    return (
      <Skeleton
        data-slot="skeleton-text"
        className={cn("rounded-sm", lineHeight, className)}
        {...props}
      />
    )
  }

  return (
    <div
      data-slot="skeleton-text"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          // Shorten the last line to ~75 % for a more natural paragraph look
          className={cn("rounded-sm", lineHeight, i === lines - 1 && "w-3/4")}
        />
      ))}
    </div>
  )
}

// -- Avatar / icon circle ----------------------------------------------------
// Sizes mirror common usages in the codebase (size-8 default → 32 px).
export interface SkeletonAvatarProps extends React.ComponentProps<"div"> {
  /** Tailwind size class (default "size-8"). */
  size?: string
}

function SkeletonAvatar({
  size = "size-8",
  className,
  ...props
}: SkeletonAvatarProps) {
  return (
    <Skeleton
      data-slot="skeleton-avatar"
      className={cn("shrink-0 rounded-full", size, className)}
      {...props}
    />
  )
}

// -- Form control / input bar ------------------------------------------------
// Default: full-width, single input row height.
function SkeletonControl({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <Skeleton
      data-slot="skeleton-control"
      className={cn("h-7 w-full rounded-md", className)}
      {...props}
    />
  )
}

// -- Card block --------------------------------------------------------------
// Fills a card-shaped area with an optional aspect ratio via `className`.
function SkeletonCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <Skeleton
      data-slot="skeleton-card"
      className={cn("h-36 w-full rounded-xl", className)}
      {...props}
    />
  )
}

// -- Table row ---------------------------------------------------------------
// Renders a row of N evenly-spaced cells.  Pass `cols` to match the real
// column count; use `className` to set a height other than the default h-9.
export interface SkeletonTableRowProps extends React.ComponentProps<"div"> {
  /** Number of cell placeholders (default 4). */
  cols?: number
}

function SkeletonTableRow({
  cols = 4,
  className,
  ...props
}: SkeletonTableRowProps) {
  return (
    <div
      data-slot="skeleton-table-row"
      className={cn("flex w-full items-center gap-3 px-4 py-2", className)}
      {...props}
    >
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1 rounded-sm" />
      ))}
    </div>
  )
}

export {
  Skeleton,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonControl,
  SkeletonTableRow,
  SkeletonText,
}
