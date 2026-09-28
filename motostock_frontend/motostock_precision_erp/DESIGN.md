---
name: MotoStock Precision ERP
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#5c403c'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#916f6b'
  outline-variant: '#e6bdb8'
  surface-tint: '#bf0715'
  primary: '#b70011'
  on-primary: '#ffffff'
  primary-container: '#dc2626'
  on-primary-container: '#fff6f5'
  inverse-primary: '#ffb4ab'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006645'
  on-tertiary: '#ffffff'
  tertiary-container: '#008259'
  on-tertiary-container: '#e1ffec'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ab'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#93000b'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Outfit
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Outfit
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-compact: 0.5rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system drives a mission-critical inventory management ecosystem for motorcycle parts, gear, and technical components. The visual tone balances industrial utility with high-performance automotive precision. It communicates operational discipline, rapid scanability, and reliability under fast-paced warehouse and retail operations.

The aesthetic fuses modern high-density ERP utility with dark carbon-chassis architecture and crisp, clinical white workspace surfaces:
- **Tone:** Technical, robust, precise, unyielding, and operational.
- **Visual Personality:** Deep carbon graphite mechanics contrasted against stark, paper-clean white data planes. Energetic racing red acts as a surgical accent for critical path actions, thresholds, and brand velocity.
- **Design Metaphor:** An engineered telemetry dashboard meets a clean-room parts assembly catalog. Clean, sharp lines, tactile mechanical feedback, and unambiguous data density.

## Colors

The system uses a targeted dual-environment canvas: deep carbon-slate for persistent global shells (navbars, tool rails, sidebars) and a high-clarity white/neutral-slate workspace for data sheets, inventory grids, and metric nodes.

### Palette Architecture
- **Primary Racing Crimson (`#DC2626`):** Reserved for primary conversion vectors, active operational states, cycle counts, stock-out emergencies, and high-priority filters.
- **Secondary Carbon Slate (`#0F172A` / `#182234`):** Anchors global chrome, headers, terminal states, and deep structural surfaces.
- **Operational Status Colors:**
  - **Success Emerald (`#10B981`):** In-stock stability, fulfilled shipments, verified cycle counts.
  - **Amber Warning (`#F59E0B`):** Reorder threshold reached, pending inbound logistics, backorders.
  - **Critical Crimson (`#DC2626`):** Out of stock, damaged SKU, failed barcode verification.
- **Surfaces & Data Grids:**
  - **App Canvas:** `#F8FAFC`
  - **Card & Grid Surface:** `#FFFFFF`
  - **Borders & Dividers:** Light mode `#E2E8F0`, deep structural borders `#1E293B`.
  - **Text Neutrality:** Primary data `#0F172A`, supporting metadata `#64748B`, disabled states `#94A3B8`.

## Typography

The typography combines the structural, geometric presence of **Outfit** for metrics, section headers, and stat cards with the utilitarian readability of **Inter** for dense transactional tables, batch tracking, and tabular figures.

### Usage Standards
- Enable `tabular-nums` (`font-variant-numeric: tabular-nums`) across all data grids, inventory counts, bin locations, and pricing cells to ensure numerical vertical alignment.
- Use `code-sm` exclusively for SKUs, VIN codes, UPC barcodes, and storage bin identifiers (`BIN-A04-R2`).
- Uppercase styling with expanded tracking (`0.04em`) is mandatory on `label-sm` when used for column sorting markers, inventory status pills, and warehouse zone badges.

## Layout & Spacing

The layout uses a high-density operational grid tailored for expansive, multi-column desktop environments while scaling to hand-held warehouse scanners and tablet terminals.

### Grid & Density Hierarchy
- **Desktop (>= 1280px):** Fixed 260px Carbon Sidebar dock, accompanied by a 12-column fluid content area using `1rem` gutters. Inventory and ledger screens can toggle a "Compact ERP" density mode, tightening row heights to 36px and inline cell gaps to `space-xs`.
- **Tablet / Rugged Terminal (768px - 1279px):** Collapsible icon rail (64px width), 8-column layout with `1rem` gutters. Touch targets automatically expand to a minimum 44px height.
- **Mobile Handheld Scanner (< 768px):** Single-column stacked cards, full-width search and barcode scan triggers, utilizing `margin-mobile` (`1rem`).

## Elevation & Depth

This design system abandons soft consumer drop-shadows in favor of industrial boundary definitions: low-contrast borders, structural crispness, and flat elevation levels with tactical dark anchors.

- **Level 0 (App Base Canvas):** Flat `#F8FAFC` background.
- **Level 1 (Card & Row Surfaces):** Pure `#FFFFFF` fill with a strict `1px solid #E2E8F0` border. No drop shadow.
- **Level 2 (Dropdowns, Flyouts, Popovers):** Pure `#FFFFFF` framed with `1px solid #CBD5E1` and an ambient, low-spread drop shadow: `0 4px 12px -2px rgba(15, 23, 42, 0.08)`.
- **Level 3 (Modal Dialogs, Physical Scan Overlays):** Background `#FFFFFF` framed with `1px solid #94A3B8`, elevated by a directional shadow: `0 12px 32px -4px rgba(15, 23, 42, 0.16)`.
- **Dark Structural Chrome (Sidebar & Top Utility):** Layered from `#0F172A` (base) to `#182234` (active navigation, pinned breadcrumbs), separated by hairline `#1E293B` borders.

## Shapes

The system implements a precise, engineered shape profile (`roundedness: 1`):
- **Base Components (Inputs, Buttons, Badges, Table Rows):** Fixed `0.25rem` (4px) radius. This sharp, controlled curve maximizes data area efficiency and retains an industrial feel.
- **Containers & Stat Cards:** `0.5rem` (8px) radius, preventing awkward visual weight while maintaining distinct modular segmentation.
- **Status Pills & Count Chips:** Fully rounded pill shapes (`9999px`) to immediately distinguish operational states and dynamic counts from interactive square buttons and input fields.

## Components

### Buttons
- **Primary Action (Commit / Save / Receive Stock):** Racing Crimson (`#DC2626`) fill, pure white text, bold weight (`600`), 4px border radius. Hover: `#B91C1C`. Active: `#991B1B`.
- **Secondary Action (Export / Print Slip / Filter):** Surface white, 1px border `#E2E8F0`, slate text `#0F172A`. Hover: `#F1F5F9` background, `#CBD5E1` border.
- **Destructive / Void:** Transparent background, crimson text `#DC2626`, 1px border `#FECACA`. Hover: `#FEF2F2`.
- **Utility / Quick Actions:** High-density 32px height for rapid table interactions.

### Badges & Status Pills
- **In Stock (Green):** Background `#ECFDF5`, text `#065F46`, border `#A7F3D0`. Includes a 6px solid `#10B981` dot prefix.
- **Low Stock / Reorder (Amber):** Background `#FFFBEB`, text `#92400E`, border `#FDE68A`.
- **Out of Stock / Critical (Red):** Background `#FEF2F2`, text `#991B1B`, border `#FECACA`.
- **Category & Warehouse Tags:** Neutral slate background `#F1F5F9`, text `#334155`, border `#E2E8F0`.

### Data Grids & High-Density Tables
- **Header:** Sticky `#F8FAFC` background, text `#475569`, 11px uppercase with tracked letter spacing (`label-sm`), bottom border `2px solid #E2E8F0`.
- **Row Anatomy:** 40px default height (34px compact mode), alternating hover highlight `#F8FAFC`. Selected rows highlight with `#FEF2F2` (crimson tint) and a 3px vertical `#DC2626` left border indicator.
- **Numerical & Code Cells:** Monospaced, right-aligned for inventory quantities and currency; left-aligned with `code-sm` font for SKUs and bin tags.

### Stat Cards (KPI Telemetry)
- White container, 8px radius, `1px solid #E2E8F0`.
- Top row: Lucide-style icon badge (36x36px container, `#0F172A` background with crisp white icon, or primary crimson for alert metrics).
- Middle row: Outfit bold display numeric metric (e.g., "14,820", "$428.5K").
- Bottom row: Inline delta tag (+12.4% vs last cycle) accompanied by muted neutral context label.

### Form Inputs & Barcode Fields
- **Default State:** Background `#FFFFFF`, border `1px solid #CBD5E1`, text `#0F172A`, 36px height.
- **Focus State:** Border `1px solid #DC2626`, ring `2px rgba(220, 38, 38, 0.15)`.
- **Dedicated Barcode Scanner Input:** Elevated with an integrated scan icon prefix, monospace placeholder, and flashing red cursor indicator during hardware input listening mode.