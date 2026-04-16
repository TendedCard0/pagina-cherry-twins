import Link from "next/link"

export function ReviewsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
      <div className="mb-10 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          Testimonios
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Lo que dicen nuestros clientes
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
          Las reseñas públicas vienen de la base de datos y se muestran en cada producto.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Ir a la tienda
        </Link>
      </div>
    </section>
  )
}
