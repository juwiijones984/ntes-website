import React from 'react'
import { Alert, AlertDescription } from './ui/alert'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  CheckCircle, 
  AlertTriangle, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  X,
  Database,
  Shield
} from 'lucide-react'
import { api } from '../utils/api'

interface StatusNotificationProps {
  isOnline: boolean
  error: string
  loading: boolean
  onRetry: () => void
  onDismiss: () => void
}

export default function StatusNotification({ 
  isOnline, 
  error, 
  loading, 
  onRetry, 
  onDismiss 
}: StatusNotificationProps) {
  const isInFallbackMode = api.isInFallbackMode()
  
  // Don't show anything if everything is working fine and not in fallback mode
  if (isOnline && !error && !loading && !isInFallbackMode) {
    return null
  }

  return (
    <div className="space-y-2">
      {/* Offline Status */}
      {!isOnline && (
        <Alert className="border-red-200 bg-red-50">
          <WifiOff className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-700 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>You're currently offline</span>
              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                No Connection
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading Status */}
      {loading && (
        <Alert className="border-blue-200 bg-blue-50">
          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
          <AlertDescription className="text-blue-700">
            <div className="flex items-center space-x-2">
              <span>Loading data...</span>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                Please wait
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Status */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-700">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <span>{error}</span>
                {!isOnline && (
                  <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                    Check connection
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRetry}
                  disabled={loading}
                  className="bg-white hover:bg-red-50"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Retry
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onDismiss}
                  className="text-red-600 hover:bg-red-100"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Fallback Mode */}
      {isInFallbackMode && !loading && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-700">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <span>Unable to connect to server. Please check your internet connection.</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  api.resetFallbackMode()
                  onRetry()
                }}
                className="bg-white hover:bg-red-50"
              >
                <Wifi className="w-3 h-3 mr-1" />
                Try Server
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Restored */}
      {isOnline && !error && !loading && !isInFallbackMode && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-700">
            <div className="flex items-center space-x-2">
              <span>Connection restored</span>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                <Wifi className="w-3 h-3 mr-1" />
                Online
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}