"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Wallet, Plus, TrendingUp, AlertCircle, ExternalLink, Upload, FileText, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TokenIcon } from "@/components/token-icon"
import { TradeTypeBadge } from "@/components/trade-type-badge"
import { StatusBadge } from "@/components/status-badge"

export default function DashboardPage() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [balances, setBalances] = useState({
    CRCX: 1250.5,
    MXNX: 890.25,
    USDC: 500.0,
  })

  const [activeListings] = useState([
    {
      id: 1,
      type: "sell",
      token: "CRCX",
      amount: 1000,
      rate: 520.5,
      fiatCurrency: "CRC",
      status: "active",
      created: "2024-01-15",
    },
    {
      id: 2,
      type: "buy",
      token: "USDC",
      amount: 500,
      rate: 1.02,
      fiatCurrency: "CRC",
      status: "pending",
      created: "2024-01-14",
    },
  ])

  const [activeEscrows] = useState([
    {
      id: "ESC001",
      type: "sell",
      token: "CRCX",
      amount: 500,
      buyer: "0x1234...5678",
      status: "awaiting_payment",
      progress: 25,
      created: "2024-01-15",
    },
    {
      id: "ESC002",
      type: "buy",
      token: "USDC",
      amount: 250,
      seller: "0x8765...4321",
      status: "payment_confirmed",
      progress: 75,
      created: "2024-01-14",
    },
  ])

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [disputeReason, setDisputeReason] = useState("")
  const [selectedEscrow, setSelectedEscrow] = useState<any>(null)
  const [dialogType, setDialogType] = useState<"receipt" | "dispute" | null>(null)

  const connectWallet = async () => {
    setWalletConnected(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "awaiting_payment":
        return "bg-orange-500"
      case "payment_confirmed":
        return "bg-primary"
      case "completed":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Activo</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendiente</Badge>
      case "awaiting_payment":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Esperando Pago</Badge>
      case "payment_confirmed":
        return <Badge className="bg-primary-100 text-primary-800 border-primary-200">Pago Confirmado</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUploadReceipt = () => {
    console.log("Uploading receipt for escrow:", selectedEscrow?.id, selectedFile)
    setDialogType(null)
    setSelectedEscrow(null)
    setSelectedFile(null)
  }

  const handleDispute = () => {
    console.log("Creating dispute for escrow:", selectedEscrow?.id, disputeReason)
    setDialogType(null)
    setSelectedEscrow(null)
    setDisputeReason("")
  }

  const openDialog = (escrow: any, type: "receipt" | "dispute") => {
    setSelectedEscrow(escrow)
    setDialogType(type)
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-lg text-gray-600 mt-2">Gestiona tus trades OTC y escrows</p>
          </div>
          <div className="flex gap-3">
            <Link href="/listings/create">
              <Button className="bg-primary hover:bg-primary-600">
                <Plus className="w-4 h-4 mr-2" />
                Crear Listing
              </Button>
            </Link>
          </div>
        </div>

        {/* Wallet Connection */}
        {!walletConnected && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-orange-900 text-lg">Conecta tu wallet de Stellar</p>
                    <p className="text-orange-700">Conecta tu wallet para comenzar a hacer trading</p>
                  </div>
                </div>
                <Button onClick={connectWallet} className="bg-primary hover:bg-primary-600">
                  <Wallet className="w-4 h-4 mr-2" />
                  Conectar Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wallet Balances */}
        {walletConnected && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(balances).map(([token, balance]) => (
              <Card key={token} className="bg-white shadow-lg border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Balance {token}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{balance.toLocaleString()}</div>
                  <p className="text-sm text-gray-500">
                    ≈ ${(balance * (token === "USDC" ? 1 : token === "CRCX" ? 0.002 : 0.018)).toFixed(2)} USD
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="bg-gray-100 p-1">
            <TabsTrigger value="listings" className="data-[state=active]:bg-white">
              Mis Listings
            </TabsTrigger>
            <TabsTrigger value="escrows" className="data-[state=active]:bg-white">
              Escrows Activos
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-white">
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Listings Activos</h2>
              <Link href="/listings/create">
                <Button className="bg-primary hover:bg-primary-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Listing
                </Button>
              </Link>
            </div>

            <div className="grid gap-6">
              {activeListings.map((listing) => (
                <Card
                  key={listing.id}
                  className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center">
                            <TradeTypeBadge type={listing.type} className="mb-3" />
                            <TokenIcon token={listing.token} size="lg" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-1">
                              <h3 className="text-2xl font-bold text-gray-900">{listing.amount.toLocaleString()}</h3>
                              <span className="text-lg font-semibold text-gray-600">{listing.token}</span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Tasa:</span> {listing.rate} {listing.fiatCurrency}/
                                {listing.token}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Creado:</span>{" "}
                                {new Date(listing.created).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          <StatusBadge status={listing.status} />
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Valor Total</p>
                            <p className="text-xl font-bold text-gray-900">
                              {(listing.amount * listing.rate).toLocaleString()} {listing.fiatCurrency}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getStatusColor(listing.status)}`}></div>
                              <span className="text-sm font-medium text-gray-700 capitalize">
                                {listing.status.replace("_", " ")}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">ID: #{listing.id}</span>
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="bg-transparent border-gray-300">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                            <Button size="sm" className="bg-primary hover:bg-primary-600">
                              Gestionar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="escrows" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Escrows Activos</h2>

            <div className="grid gap-6">
              {activeEscrows.map((escrow) => (
                <Card
                  key={escrow.id}
                  className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center">
                            <TradeTypeBadge type={escrow.type} className="mb-3" />
                            <TokenIcon token={escrow.token} size="lg" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-2">
                              <h3 className="text-2xl font-bold text-gray-900">{escrow.amount.toLocaleString()}</h3>
                              <span className="text-lg font-semibold text-gray-600">{escrow.token}</span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">ID:</span> {escrow.id}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">
                                  {escrow.type === "sell" ? "Comprador" : "Vendedor"}:
                                </span>{" "}
                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                  {escrow.type === "sell" ? escrow.buyer : escrow.seller}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          <StatusBadge status={escrow.status} />
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Progreso</p>
                            <p className="text-xl font-bold text-gray-900">{escrow.progress}%</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="flex justify-between text-sm font-medium mb-2">
                          <span className="text-gray-600">Estado del Escrow</span>
                          <span className="text-gray-900">{escrow.progress}% Completado</span>
                        </div>
                        <div className="relative">
                          <Progress value={escrow.progress} className="h-3" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-medium text-white drop-shadow-sm">{escrow.progress}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getStatusColor(escrow.status)}`}></div>
                              <span className="text-sm font-medium text-gray-700 capitalize">
                                {escrow.status.replace("_", " ")}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              Creado: {new Date(escrow.created).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="bg-transparent border-gray-300">
                              Ver Detalles
                            </Button>
                            {escrow.status === "awaiting_payment" && escrow.type === "buy" && (
                              <Button
                                size="sm"
                                className="bg-primary hover:bg-primary-600"
                                onClick={() => openDialog(escrow, "receipt")}
                              >
                                <Upload className="w-4 h-4 mr-1" />
                                Subir Recibo
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-transparent border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => openDialog(escrow, "dispute")}
                            >
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Disputa
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Historial de Trades</h2>
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg text-gray-600 mb-2">No hay trades completados aún</p>
                <p className="text-gray-500">
                  Tu historial de trades aparecerá aquí una vez que completes tu primera transacción
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <Dialog
          open={dialogType === "receipt"}
          onOpenChange={() => {
            setDialogType(null)
            setSelectedEscrow(null)
            setSelectedFile(null)
          }}
        >
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Subir Recibo de Pago</DialogTitle>
              <DialogDescription>Sube la prueba de tu pago fiat para continuar el proceso de escrow</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receipt">Archivo de Recibo</Label>
                <Input id="receipt" type="file" accept="image/*,.pdf" onChange={handleFileUpload} />
              </div>
              {selectedFile && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">{selectedFile.name}</span>
                </div>
              )}
              <Button
                onClick={handleUploadReceipt}
                disabled={!selectedFile}
                className="w-full bg-primary hover:bg-primary-600"
              >
                Subir Recibo
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={dialogType === "dispute"}
          onOpenChange={() => {
            setDialogType(null)
            setSelectedEscrow(null)
            setDisputeReason("")
          }}
        >
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Crear Disputa</DialogTitle>
              <DialogDescription>
                Si hay un problema con este trade, puedes crear una disputa para resolución
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Razón de la Disputa</Label>
                <Textarea
                  id="reason"
                  placeholder="Describe el problema con este trade..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  rows={4}
                />
              </div>
              <Button
                onClick={handleDispute}
                disabled={!disputeReason.trim()}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Crear Disputa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
