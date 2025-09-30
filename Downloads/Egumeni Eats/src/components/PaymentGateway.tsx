import React, { useState, useEffect, useCallback } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { toast } from 'sonner'
import { api } from '../utils/api'
import { 
  CreditCard, 
  Smartphone, 
  QrCode, 
  Banknote,
  Shield,
  Lock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Zap
} from 'lucide-react'

declare global {
  interface Window {
    payfast_do_onsite_payment: (data: any, callback: (result: any) => void) => void;
  }
}

interface PaymentGatewayProps {
  totalAmount: number
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  specialInstructions: string
  deliveryOption?: string
  roomNumber?: string
  customerInfo: any
  onPaymentSuccess: () => void
  onPaymentError: (error: string) => void
  loading?: boolean
}

export default function PaymentGateway({ 
  totalAmount, 
  items, 
  specialInstructions, 
  deliveryOption, 
  roomNumber, 
  customerInfo, 
  onPaymentSuccess, 
  onPaymentError, 
  loading = false 
}: PaymentGatewayProps) {
  const [selectedMethod, setSelectedMethod] = useState(
    deliveryOption === 'collect' ? 'cash-on-collection' : 'payfast-onsite'
  )
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  })
  const [processing, setProcessing] = useState(false)
  const [paymentToken, setPaymentToken] = useState('')
  const [currentOrderId, setCurrentOrderId] = useState('')
  const [payfastScriptLoaded, setPayfastScriptLoaded] = useState(false)

  const paymentMethods = [
    {
      id: 'payfast-onsite',
      name: 'Secure Card Payment',
      description: 'Visa, Mastercard, American Express (PayFast)',
      icon: CreditCard,
      color: 'text-ump-navy',
      bgColor: 'bg-ump-navy/5 hover:bg-ump-navy/10',
      borderColor: 'border-ump-navy/20',
      featured: true
    },
    {
      id: 'payfast-redirect',
      name: 'PayFast Checkout',
      description: 'Complete payment on PayFast page',
      icon: ExternalLink,
      color: 'text-ump-orange',
      bgColor: 'bg-ump-orange/5 hover:bg-ump-orange/10',
      borderColor: 'border-ump-orange/20'
    },
    {
      id: 'eft',
      name: 'Instant EFT',
      description: 'Direct bank transfer',
      icon: Banknote,
      color: 'text-ump-green',
      bgColor: 'bg-ump-green/5 hover:bg-ump-green/10',
      borderColor: 'border-ump-green/20'
    },
    {
      id: 'qr',
      name: 'Mobile Payment',
      description: 'SnapScan, Zapper, ScanToPay',
      icon: Smartphone,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      borderColor: 'border-purple-200'
    },
    // Only show cash on collection for collect orders
    ...(deliveryOption === 'collect' ? [{
      id: 'cash-on-collection',
      name: 'Cash on Collection',
      description: 'Pay cash when you collect your order',
      icon: Banknote,
      color: 'text-ump-green',
      bgColor: 'bg-ump-green/5 hover:bg-ump-green/10',
      borderColor: 'border-ump-green/20',
      featured: false
    }] : [])
  ]

  // Load PayFast onsite script
  useEffect(() => {
    const loadPayFastScript = () => {
      if (document.getElementById('payfast-onsite-script')) {
        setPayfastScriptLoaded(true)
        return
      }

      const script = document.createElement('script')
      script.id = 'payfast-onsite-script'
      script.src = 'https://sandbox.payfast.co.za/onsite/engine.js' // Use live URL for production
      script.async = true
      script.onload = () => {
        console.log('PayFast onsite script loaded')
        setPayfastScriptLoaded(true)
      }
      script.onerror = () => {
        console.error('Failed to load PayFast onsite script')
        toast.error('Payment system initialization failed')
      }
      document.body.appendChild(script)
    }

    loadPayFastScript()

    return () => {
      const script = document.getElementById('payfast-onsite-script')
      if (script) {
        script.remove()
      }
    }
  }, [])

  // Check for payment success/failure in URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const orderId = urlParams.get('orderId')
    const paymentStatus = urlParams.get('payment_status')
    
    if (orderId && paymentStatus) {
      handlePaymentReturn(orderId, paymentStatus)
    }
  }, [])

  const handlePaymentReturn = async (orderId: string, paymentStatus: string) => {
    setProcessing(true)
    try {
      if (paymentStatus === 'COMPLETE') {
        toast.success('Payment completed successfully!')
        
        // Clear URL parameters
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname
        window.history.replaceState({}, document.title, newUrl)
        
        onPaymentSuccess()
      } else {
        toast.error('Payment was not completed')
        onPaymentError('Payment was not completed')
      }
    } catch (error) {
      console.error('Payment return handling error:', error)
      toast.error('Payment verification failed')
      onPaymentError('Payment verification failed')
    } finally {
      setProcessing(false)
    }
  }

  const handlePayFastOnsitePayment = useCallback(async () => {
    if (!payfastScriptLoaded) {
      toast.error('Payment system not ready. Please try again.')
      return
    }

    if (!window.payfast_do_onsite_payment) {
      toast.error('PayFast payment engine not available')
      return
    }

    setProcessing(true)
    try {
      // Generate payment token from backend
      const response = await api.request('/payment/payfast/generate-token', {
        method: 'POST',
        body: JSON.stringify({
          items,
          totalAmount,
          specialInstructions,
          customerInfo,
          paymentMethod: 'payfast-onsite'
        })
      })

      if (!response.success || !response.uuid) {
        throw new Error(response.error || 'Failed to generate payment token')
      }

      setPaymentToken(response.uuid)
      setCurrentOrderId(response.order.id)

      // Prepare PayFast onsite payment data
      const paymentData = {
        uuid: response.uuid,
        return_url: `${window.location.origin}${window.location.pathname}?orderId=${response.order.id}&payment_status=COMPLETE`,
        cancel_url: `${window.location.origin}${window.location.pathname}?orderId=${response.order.id}&payment_status=CANCELLED`
      }

      console.log('Initiating PayFast onsite payment with:', paymentData)

      // Call PayFast onsite payment
      window.payfast_do_onsite_payment(paymentData, (result: any) => {
        console.log('PayFast onsite payment result:', result)
        
        if (result.status === 'COMPLETE') {
          toast.success('Payment completed successfully!')
          onPaymentSuccess()
        } else if (result.status === 'CANCELLED') {
          toast.error('Payment was cancelled')
          onPaymentError('Payment was cancelled')
        } else {
          toast.error('Payment failed')
          onPaymentError('Payment failed')
        }
        
        setProcessing(false)
      })

    } catch (error) {
      console.error('PayFast onsite payment failed:', error)
      toast.error('Payment failed', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
      onPaymentError(error instanceof Error ? error.message : 'Payment failed')
      setProcessing(false)
    }
  }, [payfastScriptLoaded, items, totalAmount, specialInstructions, customerInfo, onPaymentSuccess, onPaymentError])

  const handlePayFastRedirectPayment = async () => {
    setProcessing(true)
    try {
      const response = await api.request('/payment/payfast/create-payment', {
        method: 'POST',
        body: JSON.stringify({
          items,
          totalAmount,
          specialInstructions,
          customerInfo,
          paymentMethod: 'payfast-redirect'
        })
      })

      if (!response.success || !response.paymentData) {
        throw new Error(response.error || 'Failed to create payment')
      }

      setCurrentOrderId(response.order.id)

      // Create form and submit to PayFast
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = 'https://sandbox.payfast.co.za/eng/process' // Use live URL for production
      form.style.display = 'none'

      Object.entries(response.paymentData).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value as string
        form.appendChild(input)
      })

      document.body.appendChild(form)

      toast.success('Redirecting to PayFast...', {
        description: 'You will be redirected to complete your payment',
        duration: 3000
      })

      setTimeout(() => {
        form.submit()
      }, 1500)

    } catch (error) {
      console.error('PayFast redirect payment failed:', error)
      toast.error('Payment failed', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
      onPaymentError(error instanceof Error ? error.message : 'Payment failed')
      setProcessing(false)
    }
  }

  const handleCashOnCollectionOrder = async () => {
    setProcessing(true)
    try {
      console.log('Creating cash on collection order with data:', {
        items,
        totalAmount,
        specialInstructions,
        customerInfo: {
          ...customerInfo,
          deliveryOption,
          roomNumber
        },
        paymentMethod: 'cash-on-collection'
      })

      const response = await api.request('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items,
          totalAmount,
          specialInstructions,
          customerInfo: {
            ...customerInfo,
            deliveryOption,
            roomNumber
          },
          paymentMethod: 'cash-on-collection'
        })
      })

      console.log('Cash on collection order response:', response)

      if (response.error) {
        throw new Error(response.error)
      }

      if (!response.success && !response.order) {
        throw new Error('Invalid response from server')
      }

      toast.success('Order placed successfully!', {
        description: `Order ID: ${response.order?.id?.slice(-8)}. Please pay cash when you collect your order.`
      })
      
      console.log('Cash on collection order created successfully:', response.order?.id)
      onPaymentSuccess()
    } catch (error) {
      console.error('Cash on collection order failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order'
      
      toast.error('Failed to place order', {
        description: errorMessage.includes('connection') 
          ? 'Please check your internet connection and try again'
          : errorMessage
      })
      onPaymentError(errorMessage)
    } finally {
      setProcessing(false)
    }
  }

  const handlePayment = async () => {
    if (!selectedMethod) return

    if (selectedMethod === 'payfast-onsite') {
      await handlePayFastOnsitePayment()
    } else if (selectedMethod === 'payfast-redirect') {
      await handlePayFastRedirectPayment()
    } else if (selectedMethod === 'cash-on-collection') {
      await handleCashOnCollectionOrder()
    } else if (selectedMethod === 'eft') {
      // Simulate EFT redirect
      setProcessing(true)
      toast.success('Redirecting to bank...', {
        description: 'Processing EFT payment...',
        duration: 3000
      })
      
      setTimeout(() => {
        toast.success('EFT payment completed!')
        onPaymentSuccess()
        setProcessing(false)
      }, 3000)
    } else if (selectedMethod === 'qr') {
      // Simulate QR code payment
      setProcessing(true)
      toast.success('QR Code generated!', {
        description: 'Scan with your payment app to complete payment',
        duration: 3000
      })
      
      setTimeout(() => {
        toast.success('Mobile payment completed!')
        onPaymentSuccess()
        setProcessing(false)
      }, 3000)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-ump-green" />
          <Badge variant="secondary" className="bg-ump-green/10 text-ump-green border-ump-green/20">
            Secure Payment
          </Badge>
        </div>
        <CardTitle className="text-2xl text-ump-navy">Payment Details</CardTitle>
        <div className="bg-ump-light-gray rounded-lg p-4 mt-4 border border-ump-navy/10">
          <div className="flex justify-between items-center">
            <span className="text-lg text-ump-navy">Total Amount:</span>
            <span className="text-3xl font-bold text-ump-orange">
              R{totalAmount.toFixed(2)}
            </span>
          </div>
          {deliveryOption === 'collect' && (
            <div className="mt-2 text-sm text-ump-gray">
              Collection from Tfokomala Hotel Restaurant
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Payment Method Selection */}
        <div>
          <Label className="text-base mb-4 block">Choose Payment Method</Label>
          <RadioGroup 
            value={selectedMethod} 
            onValueChange={setSelectedMethod}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {paymentMethods.map((method) => {
              const IconComponent = method.icon
              return (
                <div key={method.id} className="relative">
                  <RadioGroupItem 
                    value={method.id} 
                    id={method.id} 
                    className="sr-only peer" 
                  />
                  <Label
                    htmlFor={method.id}
                    className={`
                      flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer
                      transition-all duration-200 peer-checked:border-ump-orange 
                      peer-checked:bg-ump-orange/10 ${method.bgColor} ${method.borderColor}
                      hover:shadow-md ${method.featured ? 'ring-2 ring-ump-navy/20' : ''}
                    `}
                  >
                    <div className={`p-2 rounded-full bg-white shadow-sm`}>
                      <IconComponent className={`w-6 h-6 ${method.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{method.name}</span>
                        {method.featured && (
                          <Badge variant="secondary" className="text-xs bg-ump-navy/10 text-ump-navy border-ump-navy/20">
                            <Zap className="w-3 h-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{method.description}</div>
                    </div>
                    {selectedMethod === method.id && (
                      <CheckCircle className="w-5 h-5 text-ump-orange" />
                    )}
                  </Label>
                </div>
              )
            })}
          </RadioGroup>
        </div>

        {/* PayFast Onsite Payment Notice */}
        {selectedMethod === 'payfast-onsite' && (
          <div className="p-4 bg-ump-navy/5 rounded-lg border border-ump-navy/20">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-ump-navy mt-0.5" />
              <div>
                <h4 className="font-medium text-ump-navy mb-2">Secure Onsite Payment</h4>
                <p className="text-sm text-ump-navy/80 mb-3">
                  Your card details are processed securely by PayFast without leaving this page. 
                  PCI DSS compliant and 3D Secure enabled.
                </p>
                <div className="text-xs text-ump-navy/70">
                  ✓ Instant payment • ✓ No redirect • ✓ Bank-level security • ✓ 3D Secure
                </div>
                {!payfastScriptLoaded && (
                  <div className="mt-2 text-xs text-ump-navy/70">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 border-2 border-ump-navy border-t-transparent rounded-full animate-spin"></div>
                      Loading secure payment engine...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PayFast Redirect Instructions */}
        {selectedMethod === 'payfast-redirect' && (
          <div className="p-4 bg-ump-orange/10 rounded-lg border border-ump-orange/20">
            <div className="flex items-start gap-3">
              <ExternalLink className="w-5 h-5 text-ump-orange mt-0.5" />
              <div>
                <h4 className="font-medium text-ump-orange mb-2">PayFast Checkout</h4>
                <p className="text-sm text-ump-orange/80 mb-3">
                  You'll be redirected to PayFast's secure payment page to complete your transaction.
                </p>
                <div className="text-xs text-ump-orange/80">
                  ✓ Multiple payment options • ✓ PayFast Buyer Protection • ✓ Secure checkout
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EFT Instructions */}
        {selectedMethod === 'eft' && (
          <div className="p-4 bg-ump-green/10 rounded-lg border border-ump-green/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-ump-green mt-0.5" />
              <div>
                <h4 className="font-medium text-ump-green mb-2">Instant EFT Payment</h4>
                <p className="text-sm text-ump-green/80 mb-3">
                  You'll be redirected to your bank's secure payment portal to complete the transaction.
                </p>
                <div className="text-xs text-ump-green/80">
                  ✓ Bank-level security • ✓ Real-time verification • ✓ No additional fees
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Payment Instructions */}
        {selectedMethod === 'qr' && (
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-800 mb-2">Mobile Payment</h4>
                <p className="text-sm text-purple-700 mb-3">
                  Use your preferred mobile payment app to scan and pay instantly.
                </p>
                <div className="text-xs text-purple-600">
                  ✓ SnapScan • ✓ Zapper • ✓ ScanToPay • ✓ Bank Apps
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cash on Collection Instructions */}
        {selectedMethod === 'cash-on-collection' && (
          <div className="p-4 bg-ump-green/10 rounded-lg border border-ump-green/20">
            <div className="flex items-start gap-3">
              <Banknote className="w-5 h-5 text-ump-green mt-0.5" />
              <div>
                <h4 className="font-medium text-ump-green mb-2">Cash on Collection</h4>
                <p className="text-sm text-ump-green/80 mb-3">
                  Your order will be prepared and ready for collection. Pay with cash when you collect your order from Tfokomala Hotel restaurant.
                </p>
                <div className="text-xs text-ump-green/80">
                  ✓ No online payment required • ✓ Exact change appreciated • ✓ Receipt provided
                </div>
                <div className="mt-3 p-2 bg-ump-green/5 rounded border border-ump-green/10">
                  <p className="text-xs text-ump-green/80">
                    <strong>Collection Location:</strong> Egumeni Restaurant, Tfokomala Hotel<br />
                    <strong>Note:</strong> Please have the exact amount ready or close to it for faster service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="flex items-center gap-2 p-3 bg-ump-light-gray rounded-lg border border-ump-navy/10">
          <Shield className="w-4 h-4 text-ump-navy" />
          <span className="text-sm text-ump-navy">
            {selectedMethod === 'cash-on-collection' 
              ? 'Order confirmed - pay cash when collecting' 
              : 'PayFast certified payments with 256-bit SSL encryption'}
          </span>
        </div>

        {/* Pay Now Button */}
        <Button
          onClick={handlePayment}
          disabled={!selectedMethod || loading || processing || (selectedMethod === 'payfast-onsite' && !payfastScriptLoaded)}
          className="w-full h-14 text-lg bg-ump-orange hover:bg-ump-orange/90"
          size="lg"
        >
          {processing ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {selectedMethod === 'cash-on-collection' ? 'Placing Order...' : 
               selectedMethod === 'payfast-onsite' ? 'Processing Payment...' : 'Redirecting...'}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {selectedMethod === 'cash-on-collection' ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Place Order (Pay R{totalAmount.toFixed(2)} on Collection)
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Pay R{totalAmount.toFixed(2)} Now
                </>
              )}
            </div>
          )}
        </Button>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-ump-navy/10">
          {selectedMethod === 'cash-on-collection' ? (
            <>
              <div className="flex items-center gap-1 text-xs text-ump-gray">
                <CheckCircle className="w-3 h-3" />
                <span>Order Confirmed</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-ump-gray">
                <Banknote className="w-3 h-3" />
                <span>Cash Payment</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-ump-gray">
                <Shield className="w-3 h-3" />
                <span>Secure Processing</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1 text-xs text-ump-gray">
                <Shield className="w-3 h-3" />
                <span>PayFast Certified</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-ump-gray">
                <Lock className="w-3 h-3" />
                <span>PCI DSS Compliant</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-ump-gray">
                <CheckCircle className="w-3 h-3" />
                <span>3D Secure</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}