import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function AboutSection() {
  return (
    <section id="about" className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-square overflow-hidden rounded-lg">
            <Image
              src="/images/about.jpg"
              alt="Cherry Twins - Sobre el artista"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col gap-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Sobre Cherry Twins
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Streetwear con alma
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Cherry Twins nace de la necesidad de crear ropa que cuente historias. Cada pieza es
              diseñada con atencion al detalle, usando materiales premium y procesos responsables.
              Nuestra mision es vestir a quienes se atreven a ser diferentes.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              Desde la CDMX para el mundo, cada drop es una declaracion de identidad.
              Piezas limitadas, calidad sin compromisos.
            </p>
            <Link href="/#about">
              <Button variant="outline" className="w-fit border-foreground/20 text-foreground hover:bg-foreground/10">
                Conocer mas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
