import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Camera, CameraOff, CheckCircle2, X } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'

export default function QRScanner() {
  const [scanning, setScanning] = useState(false)
  const [scannedOrder, setScannedOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [completing, setCompleting] = useState(false)
  const scannerRef = useRef(null)
  const scannerDivRef = useRef(null)

  const startScanner = () => {
    if (scannerRef.current) return
    setScanning(true)

    requestAnimationFrame(() => {
      try {
        const scanner = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        )

        scanner.render(
          async (decodedText) => {
            scanner.clear()
            scannerRef.current = null
            setScanning(false)

            // Extract orderId from URL
            let orderId = decodedText
            try {
              const url = new URL(decodedText)
              const parts = url.pathname.split('/')
              orderId = parts[parts.length - 1]
            } catch {}

            try {
              setLoading(true)
              const { data } = await axios.get(`/api/order/${orderId}`)
              setScannedOrder(data)
            } catch {
              toast.error('Order not found for this QR code')
            } finally {
              setLoading(false)
            }
          },
          (err) => {
            // Scan error (usually camera not ready), ignore
          }
        )

        scannerRef.current = scanner
      } catch (err) {
        toast.error('Could not start camera. Check permissions.')
        setScanning(false)
      }
    })
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {})
      scannerRef.current = null
    }
    setScanning(false)
  }

  const handleComplete = async () => {
    if (!scannedOrder) return
    try {
      setCompleting(true)
      const { data } = await axios.patch(`/api/order/${scannedOrder._id}`, { status: 'completed' })
      setScannedOrder(data)
      toast.success('Order marked as completed! ✅')
    } catch {
      toast.error('Could not complete order')
    } finally {
      setCompleting(false)
    }
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-cafe to-yellow-dark px-4 pt-12 pb-6 text-white">
        <h1 className="text-2xl font-black">QR Scanner</h1>
        <p className="text-sm opacity-80">Scan customer order QR codes</p>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Scanner area */}
        {!scannedOrder && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-cafe-dark">Scan Order QR</h3>
              {scanning && (
                <button
                  onClick={stopScanner}
                  className="text-xs text-red-400 font-medium flex items-center gap-1"
                >
                  <X size={14} /> Stop
                </button>
              )}
            </div>

            {!scanning ? (
              <div className="flex flex-col items-center py-8 gap-4">
                <div className="w-24 h-24 rounded-2xl bg-yellow-light flex items-center justify-center">
                  <Camera size={40} className="text-orange-cafe" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-cafe-dark">Ready to scan</p>
                  <p className="text-sm text-cafe-gray mt-1">Point camera at customer's QR code</p>
                </div>
                <button onClick={startScanner} className="btn-primary flex items-center gap-2">
                  <Camera size={18} />
                  Start Camera
                </button>
              </div>
            ) : (
              <div>
                <div id="qr-reader" ref={scannerDivRef} className="rounded-xl overflow-hidden" />
                <p className="text-xs text-cafe-gray text-center mt-3">
                  Align QR code within the frame
                </p>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="card flex flex-col items-center py-10 gap-3">
            <div className="w-12 h-12 border-4 border-yellow-cafe border-t-orange-cafe rounded-full animate-spin" />
            <p className="text-cafe-gray font-medium">Fetching order...</p>
          </div>
        )}

        {/* Scanned order details */}
        {scannedOrder && !loading && (
          <div className="flex flex-col gap-3 animate-fade-in">
            <div className={`rounded-3xl p-5 text-center ${
              scannedOrder.status === 'completed'
                ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
                : 'bg-gradient-to-br from-orange-cafe to-yellow-dark text-white'
            }`}>
              <p className="text-sm opacity-80 mb-1">Token</p>
              <p className="text-6xl font-black">#{scannedOrder.tokenNumber}</p>
              <p className="text-sm opacity-80 mt-2">{scannedOrder.customerName} · {scannedOrder.tableNumber}</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-cafe-dark">Order Details</h3>
                <StatusBadge status={scannedOrder.status} />
              </div>
              {scannedOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span className="text-cafe-dark">{item.name} ×{item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t border-yellow-cafe/20 mt-2 pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-orange-cafe">₹{scannedOrder.totalAmount}</span>
              </div>
            </div>

            {/* Action buttons */}
            {scannedOrder.status !== 'completed' ? (
              <button
                onClick={handleComplete}
                disabled={completing}
                className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
              >
                {completing ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    Mark as Completed
                  </>
                )}
              </button>
            ) : (
              <div className="card flex items-center justify-center gap-2 py-4 text-green-600">
                <CheckCircle2 size={20} />
                <span className="font-bold">Order Completed!</span>
              </div>
            )}

            <button
              onClick={() => { setScannedOrder(null) }}
              className="btn-ghost w-full flex items-center justify-center gap-2"
            >
              <Camera size={18} />
              Scan Another
            </button>
          </div>
        )}

        {/* Instructions */}
        {!scanning && !scannedOrder && !loading && (
          <div className="bg-yellow-light rounded-2xl p-4">
            <p className="font-semibold text-cafe-brown mb-2">📋 How to use</p>
            <ol className="text-xs space-y-1.5 list-decimal list-inside text-cafe-brown/80">
              <li>Tap "Start Camera" above</li>
              <li>Ask customer to show their order QR</li>
              <li>Point camera at the QR code</li>
              <li>Order details will appear</li>
              <li>Tap "Mark as Completed" after serving</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
