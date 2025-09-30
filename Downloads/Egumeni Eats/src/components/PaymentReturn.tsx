import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { api } from '../utils/api'
import { toast } from 'sonner'

interface PaymentReturnProps {
  onComplete: () => void
}

export default function PaymentReturn({ onComplete }: PaymentReturnProps) {
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing')
  const [orderDetails, setOrderDetails] = useState<any>(null)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const orderId = urlParams.get('orderId')
    const token = urlParams.get('token')
    const PayerID = urlParams.get('PayerID')
    
    if (orderId && token && PayerID) {
      handlePaymentCapture(orderId, token)
    } else {
      setStatus('failed')
    }
  }, [])

  const handlePaymentCapture = async (orderId: string, token: string) => {
    try {
      const response = await api.request(`/payment/capture/${orderId}`, {
        method: 'POST',
        body: JSON.stringify({ paypalOrderId: token })
      })

      if (response.success) {
        setStatus('success')
        setOrderDetails(response.order)
        toast.success('Payment completed successfully!')
        
        // Clear URL parameters
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname
        window.history.replaceState({}, document.title, newUrl)
        
        // Auto-redirect after success
        setTimeout(() => {
          onComplete()
        }, 3000)
      } else {
        setStatus('failed')
        toast.error('Payment capture failed')
      }
    } catch (error) {
      console.error('Payment capture error:', error)
      setStatus('failed')
      toast.error('Payment verification failed')
    }
  }

  if (status === 'processing') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="text-center py-8">
          <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium mb-2">Processing Payment</h3>
          <p className="text-gray-600">Please wait while we verify your payment...</p>
        </CardContent>
      </Card>
    )
  }

  if (status === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <CardTitle className="text-green-800">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">
            Your payment has been processed successfully.
          </p>
          {orderDetails && (
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-green-800">
                <strong>Order ID:</strong> #{orderDetails.id.slice(-8)}
              </p>
              <p className="text-sm text-green-800">
                <strong>Total:</strong> R{orderDetails.totalAmount.toFixed(2)}
              </p>
            </div>
          )}
          <p className="text-sm text-gray-500 mb-4">
            Your order is now being prepared. You'll be redirected shortly.
          </p>
          <Button onClick={onComplete} className="w-full">
            Continue to Orders
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <CardTitle className="text-red-800">Payment Failed</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-gray-600 mb-4">
          There was an issue processing your payment. Please try again.
        </p>
        <Button onClick={onComplete} variant="outline" className="w-full">
          Back to Cart
        </Button>
      </CardContent>
    </Card>
  )
}