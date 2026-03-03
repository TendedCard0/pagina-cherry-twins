"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, ShoppingBag, User, Menu, X, Cherry } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-store"

const navLinks = [
  { label: "Tienda", href: "/shop" },
  { label: "Colecciones", href: "/shop?category=all" },
  { label: "Sobre", href: "/#about" },
  { label: "FAQ", href: "/#faq" },
]

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { count } = useCart()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Mobile Menu */}
        <div className="flex lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-background border-border">
              <nav className="flex flex-col gap-6 pt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Cherry className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            CHERRY TWINS
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex lg:items-center lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Icons */}
        <div className="flex items-center gap-2">
          {/* Search */}
          {searchOpen ? (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Buscar..."
                className="h-8 w-40 bg-secondary text-foreground border-border placeholder:text-muted-foreground lg:w-60"
                autoFocus
                onBlur={() => setSearchOpen(false)}
              />
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(false)} className="text-foreground">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="text-foreground hidden sm:flex">
              <Search className="h-5 w-5" />
              <span className="sr-only">Buscar</span>
            </Button>
          )}

          {/* Account */}
          <Link href="/account">
            <Button variant="ghost" size="icon" className="hidden sm:flex text-foreground">
              <User className="h-5 w-5" />
              <span className="sr-only">Mi cuenta</span>
            </Button>
          </Link>

          {/* Cart */}
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" className="text-foreground">
              <ShoppingBag className="h-5 w-5" />
              <span className="sr-only">Carrito</span>
            </Button>
            {count > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground p-0 flex items-center justify-center text-xs">
                {count}
              </Badge>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
