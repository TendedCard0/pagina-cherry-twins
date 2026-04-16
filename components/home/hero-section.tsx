import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
      <Image
        src="/images/hero.jpg"
        alt="Cherry Twins - Coleccion nueva"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-background/60" />
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-start justify-end px-4 pb-20 lg:px-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          Drop SS26
        </p>
        <h1 className="mb-6 max-w-2xl text-balance text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl">
          Nueva Coleccion
        </h1>
        <p className="mb-8 max-w-md text-lg leading-relaxed text-muted-foreground">
          Piezas limitadas que definen tu estilo. Streetwear independiente con identidad propia.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/shop">
            <Button size="lg" className="h-12 bg-primary text-primary-foreground hover:bg-primary/90 px-8 text-sm font-semibold uppercase tracking-wider">
              Comprar ahora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/shop">
            <Button
              variant="outline"
              size="lg"
              className="h-12 border-foreground/20 bg-transparent text-foreground hover:bg-foreground/10 px-8 text-sm font-semibold uppercase tracking-wider"
            >
              Ver coleccion
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
