"use client"

import Link from "next/link"
import { Cherry, Instagram, Twitter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Cherry className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold tracking-tight text-foreground">CHERRY TWINS</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Streetwear independiente con identidad propia. Piezas limitadas que cuentan historias.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="text-muted-foreground transition-colors hover:text-primary" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-primary" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Help */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground">Ayuda</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/shop" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Env\u00edos</Link>
              <Link href="/shop" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Devoluciones</Link>
              <Link href="/#faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Preguntas frecuentes</Link>
              <Link href="/#about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Contacto</Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground">Legal</h3>
            <nav className="flex flex-col gap-2">
              <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pol\u00edtica de privacidad</Link>
              <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">T\u00e9rminos y condiciones</Link>
              <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Cookies</Link>
            </nav>
          </div>

          {/* Subscribe */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground">Recibe Drops</h3>
            <p className="text-sm text-muted-foreground">
              S\u00e9 el primero en enterarte de nuevos lanzamientos y ofertas exclusivas.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="tu@email.com"
                className="h-10 bg-secondary text-foreground border-border placeholder:text-muted-foreground"
              />
              <Button type="submit" className="h-10 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
                Unirme
              </Button>
            </form>
          </div>
        </div>

        <Separator className="my-10 bg-border" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Cherry Twins. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>OXXO</span>
            <span>SPEI</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
