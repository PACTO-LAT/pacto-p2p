"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Clock, CheckCircle, AlertTriangle, Upload, ExternalLink, FileText, User } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TokenIcon } from "@/components/token-icon"
import { TradeTypeBadge } from "@/components/trade-type-badge"

export default function EscrowsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [disputeReason, setDisputeReason] = useState("")

  const [escrows] = useState([
    {
      id: "ESC001",
      type: "sell",
      token: "CRCX",
      amount: 500,
      fiatAmount: 260250,
      fiatCurrency: "CRC",
      counterparty: "0x1234...5678",
      counterpartyReputation: 4.8,
      status: "awaiting_payment",
      progress: 25,
      created: "2024-01-15T10:30:00Z",
      milestones: [
        { id: 1, name: "Escrow Created", status: "completed", date: "2024-01-15T10:30:00Z" },
        { id: 2, name: "Fiat Payment Sent", status: "pending", date: null },
        { id: 3, name: "Payment Confirmed", status: "pending", date: null },
        { id: 4, name: "Tokens Released", status: "pending", date: null },
      ],
    },
    {
      id: "ESC002",
      type: "buy",
      token: "USDC",
      amount: 250,
      fiatAmount: 130000,
      fiatCurrency: "CRC",
      counterparty: "0x8765...4321",
      counterpartyReputation: 4.9,
      status: "payment_confirmed",
      progress: 75,
      created: "2024-01-14T15:45:00Z",
      milestones: [
        { id: 1, name: "Escrow Created", status: "completed", date: "2024-01-14T15:45:00Z" },
        { id: 2, name: "Fiat Payment Sent", status: "completed", date: "2024-01-14T16:00:00Z" },
        { id: 3, name: "Payment Confirmed", status: "completed", date: "2024-01-14T16:30:00Z" },
        { id: 4, name: "Tokens Released", status: "pending", date: null },
      ],
    },
    {
      id: "ESC003",
      type: "sell",
      token: "MXNX",
      amount: 1000,
      fiatAmount: 18500,
      fiatCurrency: "MXN",
      counterparty: "0x9876...1234",
      counterpartyReputation: 4.7,
      status: "completed",
      progress: 100,
      created: "2024-01-13T09:15:00Z",
      milestones: [
        { id: 1, name: "Escrow Created", status: "completed", date: "2024-01-13T09:15:00Z" },
        { id: 2, name: "Fiat Payment Sent", status: "completed", date: "2024-01-13T10:00:00Z" },
        { id: 3, name: "Payment Confirmed", status: "completed", date: "2024-01-13T10:30:00Z" },
        { id: 4, name: "Tokens Released", status: "completed", date: "2024-01-13T11:00:00Z" },
      ],
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "awaiting_payment":
        return "bg-orange-500"
      case "payment_confirmed":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "disputed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "awaiting_payment":
        return Clock
      case "payment_confirmed":
        return CheckCircle
      case "completed":
        return CheckCircle
      case "disputed":
        return AlertTriangle
      default:
        return Clock
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUploadReceipt = (escrowId: string) => {
    console.log("Uploading receipt for escrow:", escrowId, selectedFile)
    // Handle receipt upload logic
  }

  const handleDispute = (escrowId: string) => {
    console.log("Creating dispute for escrow:", escrowId, disputeReason)
    // Handle dispute creation logic
  }

  const activeEscrows = escrows.filter((e) => e.status !== "completed")
  const completedEscrows = escrows.filter((e) => e.status === "completed")

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Escrow Management</h1>
          <p className="text-gray-600">Monitor and manage your active escrow contracts</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Escrows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeEscrows.length}</div>
              <p className="text-sm text-gray-600 mt-1">Currently in progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,450</div>
              <p className="text-sm text-gray-600 mt-1">Across all escrows</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.5%</div>
              <p className="text-sm text-gray-600 mt-1">Completed without disputes</p>
            </CardContent>
          </Card>
        </div>

        {/* Escrow Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active ({activeEscrows.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedEscrows.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeEscrows.map((escrow) => {
              const StatusIcon = getStatusIcon(escrow.status)
              return (
                <Card key={escrow.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <TradeTypeBadge type={escrow.type} />
                          <TokenIcon token={escrow.token} size="md" />
                          <div>
                            <p className="font-semibold text-lg">
                              {escrow.amount} {escrow.token}
                            </p>
                            <p className="text-sm text-gray-600">ID: {escrow.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(escrow.status)}`}></div>
                          <StatusIcon className="w-4 h-4" />
                          <span className="text-sm capitalize">{escrow.status.replace("_", " ")}</span>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{escrow.progress}%</span>
                        </div>
                        <Progress value={escrow.progress} className="h-2" />
                      </div>

                      {/* Milestones */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {escrow.milestones.map((milestone, index) => (
                          <div key={milestone.id} className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                milestone.status === "completed"
                                  ? "bg-green-500 text-white"
                                  : milestone.status === "pending"
                                    ? "bg-gray-200 text-gray-600"
                                    : "bg-yellow-500 text-white"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{milestone.name}</p>
                              {milestone.date && (
                                <p className="text-xs text-gray-500">{new Date(milestone.date).toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-sm text-gray-600">Counterparty</p>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="font-medium">{escrow.counterparty}</span>
                            <Badge variant="outline" className="text-xs">
                              ⭐ {escrow.counterpartyReputation}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Fiat Amount</p>
                          <p className="font-medium">
                            {escrow.fiatAmount.toLocaleString()} {escrow.fiatCurrency}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Created</p>
                          <p className="font-medium">{new Date(escrow.created).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on Stellar
                        </Button>

                        {escrow.status === "awaiting_payment" && escrow.type === "buy" && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Receipt
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Upload Payment Receipt</DialogTitle>
                                <DialogDescription>
                                  Upload proof of your fiat payment to continue the escrow process
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="receipt">Receipt File</Label>
                                  <Input id="receipt" type="file" accept="image/*,.pdf" onChange={handleFileUpload} />
                                </div>
                                {selectedFile && (
                                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                    <FileText className="w-4 h-4" />
                                    <span className="text-sm">{selectedFile.name}</span>
                                  </div>
                                )}
                                <Button
                                  onClick={() => handleUploadReceipt(escrow.id)}
                                  disabled={!selectedFile}
                                  className="w-full"
                                >
                                  Upload Receipt
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Dispute
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create Dispute</DialogTitle>
                              <DialogDescription>
                                If there's an issue with this trade, you can create a dispute for resolution
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="reason">Dispute Reason</Label>
                                <Textarea
                                  id="reason"
                                  placeholder="Describe the issue with this trade..."
                                  value={disputeReason}
                                  onChange={(e) => setDisputeReason(e.target.value)}
                                  rows={4}
                                />
                              </div>
                              <Button
                                onClick={() => handleDispute(escrow.id)}
                                disabled={!disputeReason.trim()}
                                className="w-full"
                                variant="destructive"
                              >
                                Create Dispute
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedEscrows.map((escrow) => (
              <Card key={escrow.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <TradeTypeBadge type={escrow.type} />
                        <TokenIcon token={escrow.token} size="md" />
                        <div>
                          <p className="font-semibold text-lg">
                            {escrow.amount} {escrow.token}
                          </p>
                          <p className="text-sm text-gray-600">ID: {escrow.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-medium text-green-700">Completed</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Counterparty</p>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{escrow.counterparty}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Fiat Amount</p>
                        <p className="font-medium">
                          {escrow.fiatAmount.toLocaleString()} {escrow.fiatCurrency}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Completed</p>
                        <p className="font-medium">{new Date(escrow.created).toLocaleDateString()}</p>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
