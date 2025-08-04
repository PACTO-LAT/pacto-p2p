'use client';

import {
  AlertCircle,
  Bell,
  Camera,
  CheckCircle,
  CreditCard,
  Lock,
  Settings,
  Shield,
  Star,
  TrendingUp,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { WalletInfo } from '@/components/wallet-info';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock user data - in real app, this would come from useAuth hook
  const [userData, setUserData] = useState({
    id: 'user_123',
    email: 'user@example.com',
    full_name: 'Juan Pérez',
    username: 'juanperez',
    bio: 'Experienced trader in Stellar ecosystem. Focused on USDC and EURC trading.',
    avatar_url: '',
    stellar_address: 'GDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    phone: '+1234567890',
    country: 'Mexico',
    kyc_status: 'verified' as 'pending' | 'verified' | 'rejected',
    reputation_score: 4.8,
    total_trades: 127,
    total_volume: 45000,
    created_at: '2024-01-15',
    notifications: {
      email_trades: true,
      email_escrows: true,
      push_notifications: true,
      sms_notifications: false,
    },
    security: {
      two_factor_enabled: true,
      login_notifications: true,
    },
    payment_methods: {
      sinpe_number: '+50612345678',
      bank_iban: 'CR05015202001026284066',
      bank_name: 'Banco Nacional de Costa Rica',
      bank_account_holder: 'Juan Pérez',
      preferred_method: 'sinpe' as 'sinpe' | 'bank_transfer',
    },
  });

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsEditing(false);
    toast.success('Perfil actualizado');
  };

  const getKycStatusBadge = () => {
    switch (userData.kyc_status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verificado
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Rechazado
          </Badge>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Mi Perfil
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your personal information and settings
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? 'Guardando...' : 'Guardar'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="payments">Pagos</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
            <TabsTrigger value="security">Seguridad</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Info */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Información Personal
                    </CardTitle>
                    <CardDescription>
                      Tu información básica y datos de contacto
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage
                          src={userData.avatar_url || '/placeholder.svg'}
                        />
                        <AvatarFallback className="text-lg">
                          {userData.full_name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button variant="outline" size="sm">
                          <Camera className="w-4 h-4 mr-2" />
                          Cambiar Foto
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Nombre Completo</Label>
                        <Input
                          id="full_name"
                          value={userData.full_name}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              full_name: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Nombre de Usuario</Label>
                        <Input
                          id="username"
                          value={userData.username}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              username: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={userData.email}
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          value={userData.phone}
                          onChange={(e) =>
                            setUserData({ ...userData, phone: e.target.value })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">País</Label>
                        <Input
                          id="country"
                          value={userData.country}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              country: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>KYC Status</Label>
                        <div className="flex items-center gap-2">
                          {getKycStatusBadge()}
                          {userData.kyc_status !== 'verified' && (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto"
                            >
                              Completar KYC
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografía</Label>
                      <Textarea
                        id="bio"
                        value={userData.bio}
                        onChange={(e) =>
                          setUserData({ ...userData, bio: e.target.value })
                        }
                        disabled={!isEditing}
                        rows={3}
                        placeholder="Cuéntanos sobre ti y tu experiencia en trading..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Stats */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Estadísticas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Reputación
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">
                          {userData.reputation_score}
                        </span>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Total Trades
                      </span>
                      <span className="font-semibold">
                        {userData.total_trades}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Volumen Total
                      </span>
                      <span className="font-semibold">
                        ${userData.total_volume.toLocaleString()}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Miembro desde
                      </span>
                      <span className="font-semibold">
                        {new Date(userData.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <WalletInfo showDetails={true} />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Methods
                </CardTitle>
                <CardDescription>
                  Configure your payment methods to receive money
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* SINPE Móvil */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">SINPE Mobile</h3>
                    <Badge variant="secondary">Costa Rica</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sinpe_number">Phone Number</Label>
                      <Input
                        id="sinpe_number"
                        type="tel"
                        value={userData.payment_methods.sinpe_number}
                        onChange={(e) =>
                          setUserData({
                            ...userData,
                            payment_methods: {
                              ...userData.payment_methods,
                              sinpe_number: e.target.value,
                            },
                          })
                        }
                        disabled={!isEditing}
                        placeholder="+506 1234 5678"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Number registered in SINPE Mobile to receive
                        transfers
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Transferencia Bancaria */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      Bank Transfer
                    </h3>
                    <Badge variant="secondary">International</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank_iban">IBAN Number</Label>
                      <Input
                        id="bank_iban"
                        value={userData.payment_methods.bank_iban}
                        onChange={(e) =>
                          setUserData({
                            ...userData,
                            payment_methods: {
                              ...userData.payment_methods,
                              bank_iban: e.target.value,
                            },
                          })
                        }
                        disabled={!isEditing}
                        placeholder="CR05015202001026284066"
                        className="font-mono"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        International IBAN code of your bank account
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bank_name">Bank Name</Label>
                      <Input
                        id="bank_name"
                        value={userData.payment_methods.bank_name}
                        onChange={(e) =>
                          setUserData({
                            ...userData,
                            payment_methods: {
                              ...userData.payment_methods,
                              bank_name: e.target.value,
                            },
                          })
                        }
                        disabled={!isEditing}
                        placeholder="Banco Nacional de Costa Rica"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bank_account_holder">
                        Account Holder
                      </Label>
                      <Input
                        id="bank_account_holder"
                        value={userData.payment_methods.bank_account_holder}
                        onChange={(e) =>
                          setUserData({
                            ...userData,
                            payment_methods: {
                              ...userData.payment_methods,
                              bank_account_holder: e.target.value,
                            },
                          })
                        }
                        disabled={!isEditing}
                        placeholder="Juan Pérez"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Must match exactly with the name on your bank
                        account
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                        <Button variant="link" size="sm" className="p-0 h-auto">
                          Verify
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Método Preferido */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Preferred Method</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="preferred_sinpe"
                        name="preferred_method"
                        value="sinpe"
                        checked={
                          userData.payment_methods.preferred_method === 'sinpe'
                        }
                        onChange={(e) =>
                          setUserData({
                            ...userData,
                            payment_methods: {
                              ...userData.payment_methods,
                              preferred_method: e.target.value as
                                | 'sinpe'
                                | 'bank_transfer',
                            },
                          })
                        }
                        disabled={!isEditing}
                        className="w-4 h-4"
                      />
                      <Label
                        htmlFor="preferred_sinpe"
                        className="flex items-center gap-2"
                      >
                        SINPE Mobile
                        <Badge variant="outline" className="text-xs">
                          Instant
                        </Badge>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="preferred_bank"
                        name="preferred_method"
                        value="bank_transfer"
                        checked={
                          userData.payment_methods.preferred_method ===
                          'bank_transfer'
                        }
                        onChange={(e) =>
                          setUserData({
                            ...userData,
                            payment_methods: {
                              ...userData.payment_methods,
                              preferred_method: e.target.value as
                                | 'sinpe'
                                | 'bank_transfer',
                            },
                          })
                        }
                        disabled={!isEditing}
                        className="w-4 h-4"
                      />
                      <Label
                        htmlFor="preferred_bank"
                        className="flex items-center gap-2"
                      >
                        Bank Transfer
                        <Badge variant="outline" className="text-xs">
                          1-3 days
                        </Badge>
                      </Label>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    This will be the payment method shown by default in your
                    listings
                  </p>
                </div>

                {/* Información Importante */}
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Important Information
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>
                      • Verify that all information is correct before
                      saving
                    </li>
                    <li>
                      • Payment methods must be in your name for greater
                      security
                    </li>
                                          <li>• SINPE Mobile is only available in Costa Rica</li>
                    <li>
                      • Bank transfers may take 1-3 days
                                              business days
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notificaciones
                </CardTitle>
                <CardDescription>
                  Configura cómo quieres recibir notificaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                                          <Label>Trade Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Receive emails when you have new trades
                    </p>
                  </div>
                  <Switch
                    checked={userData.notifications.email_trades}
                    onCheckedChange={(checked) =>
                      setUserData({
                        ...userData,
                        notifications: {
                          ...userData.notifications,
                          email_trades: checked,
                        },
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                                          <Label>Escrow Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Receive emails about the status of your escrows
                    </p>
                  </div>
                  <Switch
                    checked={userData.notifications.email_escrows}
                    onCheckedChange={(checked) =>
                      setUserData({
                        ...userData,
                        notifications: {
                          ...userData.notifications,
                          email_escrows: checked,
                        },
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificaciones Push</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Recibe notificaciones push en tu navegador
                    </p>
                  </div>
                  <Switch
                    checked={userData.notifications.push_notifications}
                    onCheckedChange={(checked) =>
                      setUserData({
                        ...userData,
                        notifications: {
                          ...userData.notifications,
                          push_notifications: checked,
                        },
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificaciones SMS</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Recibe SMS para eventos importantes
                    </p>
                  </div>
                  <Switch
                    checked={userData.notifications.sms_notifications}
                    onCheckedChange={(checked) =>
                      setUserData({
                        ...userData,
                        notifications: {
                          ...userData.notifications,
                          sms_notifications: checked,
                        },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Seguridad
                </CardTitle>
                <CardDescription>
                  Configure your account security options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Autenticación de Dos Factores</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={userData.security.two_factor_enabled}
                      onCheckedChange={(checked) =>
                        setUserData({
                          ...userData,
                          security: {
                            ...userData.security,
                            two_factor_enabled: checked,
                          },
                        })
                      }
                    />
                    {userData.security.two_factor_enabled && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificaciones de Login</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Receive notifications when someone accesses your account
                    </p>
                  </div>
                  <Switch
                    checked={userData.security.login_notifications}
                    onCheckedChange={(checked) =>
                      setUserData({
                        ...userData,
                        security: {
                          ...userData.security,
                          login_notifications: checked,
                        },
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Cambiar Contraseña</Label>
                  <Button variant="outline">
                    <Lock className="w-4 h-4 mr-2" />
                    Actualizar Contraseña
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
