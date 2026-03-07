"use client"

import { useState } from "react"
import Image from "next/image"
import {
  LayoutDashboard, Package, ShoppingCart, Tag, TrendingUp,
  AlertTriangle, Eye, ChevronDown, Plus, Pencil, Trash2, Power,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { products, formatPrice } from "@/lib/data"

const mockOrdersAdmin = [
  { id: "CT-54321", customer: "Juan Perez", date: "2026-02-20", total: 2098, status: "Entregado", items: 2 },
  { id: "CT-54320", customer: "Andrea Lopez", date: "2026-02-19", total: 1399, status: "Enviado", items: 1 },
  { id: "CT-54319", customer: "Miguel Rodriguez", date: "2026-02-18", total: 3147, status: "Pagado", items: 3 },
  { id: "CT-54318", customer: "Sofia Garcia", date: "2026-02-17", total: 699, status: "Pendiente", items: 1 },
  { id: "CT-54317", customer: "Diego Hernandez", date: "2026-02-16", total: 1998, status: "Enviado", items: 2 },
]

const mockCoupons = [
  { id: "c1", code: "CHERRY20", discount: "20%", uses: 45, limit: 100, active: true },
  { id: "c2", code: "WELCOME10", discount: "10%", uses: 120, limit: 200, active: true },
  { id: "c3", code: "DROP50", discount: "$50", uses: 30, limit: 30, active: false },
]

const statusColors: Record<string, string> = {
  Pendiente: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Pagado: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Enviado: "bg-primary/20 text-primary border-primary/30",
  Entregado: "bg-green-500/20 text-green-400 border-green-500/30",
}

const stats = [
  { label: "Ventas hoy", value: "$12,450", icon: TrendingUp, change: "+12%" },
  { label: "Pedidos hoy", value: "8", icon: ShoppingCart, change: "+3" },
  { label: "Productos", value: products.length.toString(), icon: Package, change: "" },
  { label: "Stock bajo", value: products.filter((p) => p.stock > 0 && p.stock <= 5).length.toString(), icon: AlertTriangle, change: "" },
]

export function AdminDashboard() {
  const [tab, setTab] = useState("dashboard")

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Panel</h1>
        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Cherry Twins</Badge>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-8 bg-secondary border border-border flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">
            <Package className="mr-2 h-4 w-4" />
            Productos
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Pedidos
          </TabsTrigger>
          <TabsTrigger value="coupons" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">
            <Tag className="mr-2 h-4 w-4" />
            Cupones
          </TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <stat.icon className="h-5 w-5 text-primary" />
                  {stat.change && (
                    <span className="text-xs font-medium text-primary">{stat.change}</span>
                  )}
                </div>
                <p className="mt-4 text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Orders */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 text-base font-semibold text-foreground">Pedidos recientes</h3>
              <div className="flex flex-col gap-3">
                {mockOrdersAdmin.slice(0, 4).map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{order.customer}</p>
                      <p className="text-xs text-muted-foreground">#{order.id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={statusColors[order.status]}>{order.status}</Badge>
                      <span className="text-sm font-semibold text-foreground">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Stock */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 text-base font-semibold text-foreground">Productos con poco stock</h3>
              <div className="flex flex-col gap-3">
                {products.filter((p) => p.stock <= 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-md bg-secondary">
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="40px" />
                      </div>
                      <p className="text-sm font-medium text-foreground">{product.name}</p>
                    </div>
                    <Badge variant="outline" className={product.stock === 0
                      ? "bg-destructive/20 text-destructive border-destructive/30"
                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }>
                      {product.stock === 0 ? "Agotado" : `${product.stock} left`}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Products */}
        <TabsContent value="products">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Input placeholder="Buscar producto..." className="w-full bg-secondary text-foreground border-border placeholder:text-muted-foreground sm:max-w-xs" />
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-fit">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo producto
            </Button>
          </div>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-secondary/50">
                  <TableHead className="text-muted-foreground">Producto</TableHead>
                  <TableHead className="text-muted-foreground">Precio</TableHead>
                  <TableHead className="text-muted-foreground">Stock</TableHead>
                  <TableHead className="text-muted-foreground">Categoria</TableHead>
                  <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="border-border hover:bg-secondary/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-md bg-secondary">
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="40px" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{product.name}</p>
                          {product.isNew && <Badge className="bg-primary/20 text-primary text-[10px] border-none mt-0.5">Nuevo</Badge>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={product.stock === 0
                        ? "bg-destructive/20 text-destructive border-destructive/30"
                        : product.stock <= 5
                          ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          : "bg-green-500/20 text-green-400 border-green-500/30"
                      }>
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground capitalize">{product.category}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Orders */}
        <TabsContent value="orders">
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-secondary/50">
                  <TableHead className="text-muted-foreground">Orden</TableHead>
                  <TableHead className="text-muted-foreground">Cliente</TableHead>
                  <TableHead className="text-muted-foreground">Fecha</TableHead>
                  <TableHead className="text-muted-foreground">Total</TableHead>
                  <TableHead className="text-muted-foreground">Estado</TableHead>
                  <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOrdersAdmin.map((order) => (
                  <TableRow key={order.id} className="border-border hover:bg-secondary/50">
                    <TableCell className="text-sm font-medium text-foreground">#{order.id}</TableCell>
                    <TableCell className="text-sm text-foreground">{order.customer}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{order.date}</TableCell>
                    <TableCell className="text-sm font-semibold text-foreground">{formatPrice(order.total)}</TableCell>
                    <TableCell>
                      <Select defaultValue={order.status}>
                        <SelectTrigger className="h-8 w-[130px] bg-secondary text-foreground border-border text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card text-foreground border-border">
                          <SelectItem value="Pendiente">Pendiente</SelectItem>
                          <SelectItem value="Pagado">Pagado</SelectItem>
                          <SelectItem value="Enviado">Enviado</SelectItem>
                          <SelectItem value="Entregado">Entregado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-secondary text-xs">
                        Ver detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Coupons */}
        <TabsContent value="coupons">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Cupones</h2>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo cupon
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            {mockCoupons.map((coupon) => (
              <div key={coupon.id} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-foreground">{coupon.code}</span>
                      <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                        {coupon.discount}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {coupon.uses}/{coupon.limit} usos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{coupon.active ? "Activo" : "Inactivo"}</span>
                    <Switch checked={coupon.active} className="data-[state=checked]:bg-primary" />
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
