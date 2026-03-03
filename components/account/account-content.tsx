"use client"

import { useState } from "react"
import { User, Package, MapPin, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const mockOrders = [
  { id: "CT-54321", date: "2026-02-20", total: 2098, status: "Entregado", items: 2 },
  { id: "CT-54290", date: "2026-02-10", total: 1299, status: "Enviado", items: 1 },
  { id: "CT-54188", date: "2026-01-28", total: 3147, status: "Pendiente", items: 3 },
]

const mockAddresses = [
  { id: "1", label: "Casa", street: "Av. Reforma 123, Col. Centro", city: "CDMX", cp: "06600" },
  { id: "2", label: "Oficina", street: "Insurgentes Sur 456, Col. Roma", city: "CDMX", cp: "06700" },
]

const statusColors: Record<string, string> = {
  Pendiente: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Pagado: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Enviado: "bg-primary/20 text-primary border-primary/30",
  Entregado: "bg-green-500/20 text-green-400 border-green-500/30",
}

export function AccountContent() {
  const [tab, setTab] = useState("orders")

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-muted-foreground" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-foreground">Mi Cuenta</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground">Mi Cuenta</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-8 bg-secondary border border-border">
          <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">
            <User className="mr-2 h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">
            <Package className="mr-2 h-4 w-4" />
            Pedidos
          </TabsTrigger>
          <TabsTrigger value="addresses" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            Direcciones
          </TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground">Datos personales</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Nombre</Label>
                <Input defaultValue="Juan Perez" className="bg-secondary text-foreground border-border" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Correo</Label>
                <Input defaultValue="juan@email.com" className="bg-secondary text-foreground border-border" readOnly />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Telefono</Label>
                <Input defaultValue="+52 55 1234 5678" className="bg-secondary text-foreground border-border" />
              </div>
            </div>
            <Button className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">Guardar cambios</Button>
          </div>
        </TabsContent>

        {/* Orders */}
        <TabsContent value="orders">
          <div className="flex flex-col gap-4">
            {mockOrders.map((order) => (
              <div key={order.id} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">Orden #{order.id}</span>
                    <Badge variant="outline" className={statusColors[order.status]}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {order.date} | {order.items} producto{order.items > 1 ? "s" : ""} | ${order.total.toLocaleString("es-MX")} MXN
                  </p>
                </div>
                <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-secondary w-fit">
                  Ver detalle
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Addresses */}
        <TabsContent value="addresses">
          <div className="flex flex-col gap-4">
            {mockAddresses.map((addr) => (
              <div key={addr.id} className="flex items-start justify-between rounded-lg border border-border bg-card p-6">
                <div>
                  <span className="text-sm font-semibold text-foreground">{addr.label}</span>
                  <p className="mt-1 text-sm text-muted-foreground">{addr.street}</p>
                  <p className="text-sm text-muted-foreground">{addr.city}, CP {addr.cp}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-fit border-border text-foreground hover:bg-secondary">
              <Plus className="mr-2 h-4 w-4" />
              Agregar direccion
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
