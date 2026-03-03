import { reviews } from "@/lib/data"
import { Star } from "lucide-react"

export function ReviewsSection() {
  const featured = reviews.slice(0, 3)

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
      <div className="mb-10 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          Testimonios
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Lo que dicen nuestros clientes
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {featured.map((review) => (
          <div
            key={review.id}
            className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6"
          >
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating ? "fill-primary text-primary" : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {`"${review.text}"`}
            </p>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{review.author}</span>
              <span className="text-xs text-muted-foreground">{review.date}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
