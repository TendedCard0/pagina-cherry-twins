import type { ProductVariantResponse } from "@/lib/catalog-types"

function shouldIgnoreVariantPrice(variantCents: number, baseCents: number): boolean {
  if (baseCents <= 0 || variantCents >= baseCents) return false
  const ceiling = Math.min(5000, Math.max(500, Math.floor(baseCents / 50)))
  return variantCents < ceiling
}

/**
 * Precio unitario alineado con /shop (`basePriceCents`).
 * Ignora precios de variante &gt; 0 pero absurdamente bajos frente al base (p. ej. 900 vs 80000).
 */
export function effectiveUnitPriceCents(
  variant: ProductVariantResponse | null | undefined,
  basePriceCents: number
): number {
  const base = Math.max(0, Math.round(Number.isFinite(basePriceCents) ? basePriceCents : 0))
  const n = variant?.priceCents
  if (n == null || !Number.isFinite(n) || n <= 0) {
    return base
  }
  const v = Math.round(n)
  if (shouldIgnoreVariantPrice(v, base)) {
    return base
  }
  return v
}

export function effectiveUnitCurrency(
  variant: ProductVariantResponse | null | undefined,
  productCurrency: string
): string {
  const c = variant?.currency?.trim()
  if (c) return c
  return productCurrency || "MXN"
}
