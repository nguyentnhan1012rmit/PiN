import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { toast } from 'react-hot-toast'
import { CreditCard, Lock, CheckCircle, Shield, Calendar, User } from 'lucide-react'

/**
 * STRIPE INTEGRATION NOTES:
 * =========================
 * To enable real Stripe payments:
 * 
 * 1. Install Stripe packages:
 *    npm install @stripe/stripe-js @stripe/react-stripe-js
 * 
 * 2. Create .env file with:
 *    VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
 * 
 * 3. Create Stripe backend endpoint (Supabase Edge Function):
 *    - create-payment-intent: Creates PaymentIntent
 *    - stripe-webhook: Handles successful payments
 * 
 * 4. Replace the mock form below with Stripe Elements:
 *    - CardElement from @stripe/react-stripe-js
 *    - Use confirmPayment() on form submit
 * 
 * Current implementation: Mock payment for development/demo
 */

// Mock Stripe key check - replace with real key
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

export default function PaymentPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const [loading, setLoading] = useState(false)
    const [paymentSuccess, setPaymentSuccess] = useState(false)
    const [bookingDetails] = useState(location.state?.booking || null)

    useEffect(() => {
        if (!bookingDetails) {
            toast.error("No booking found")
            navigate('/photographers')
        }
    }, [bookingDetails, navigate])

    const handlePayment = async (e) => {
        e.preventDefault()
        setLoading(true)

        // In production with Stripe:
        // 1. Call backend to create PaymentIntent
        // 2. Use stripe.confirmPayment() with CardElement
        // 3. Handle success/error from Stripe
        // 4. Backend webhook updates booking status

        // Mock payment simulation
        await new Promise(resolve => setTimeout(resolve, 2000))

        try {
            if (bookingDetails?.id) {
                // Update existing pending booking
                const { error } = await supabase
                    .from('bookings')
                    .update({ status: 'confirmed' })
                    .eq('id', bookingDetails.id)

                if (error) throw error
            } else {
                // Create new confirmed booking
                const { error } = await supabase
                    .from('bookings')
                    .insert({
                        ...bookingDetails,
                        status: 'confirmed'
                    })

                if (error) throw error
            }

            setPaymentSuccess(true)
            toast.success("Payment Successful!")

            setTimeout(() => {
                navigate('/my-bookings')
            }, 2000)
        } catch (error) {
            console.error(error)
            toast.error("Payment failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (!bookingDetails) return null

    if (paymentSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
                <div className="card w-full max-w-md bg-base-100 shadow-xl text-center p-8">
                    <div className="w-20 h-20 mx-auto mb-4 bg-success/20 rounded-full flex items-center justify-center">
                        <CheckCircle size={48} className="text-success" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                    <p className="text-base-content/70">Your booking has been confirmed.</p>
                    <p className="text-sm text-base-content/50 mt-4">Redirecting to your bookings...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 to-base-300 p-4">
            <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300">
                <div className="card-body">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="card-title text-2xl flex items-center gap-2">
                            <Lock size={20} className="text-success" /> Checkout
                        </h2>
                        <div className="flex items-center gap-1 text-xs text-base-content/50">
                            <Shield size={12} /> Secure
                        </div>
                    </div>

                    {/* Booking Summary */}
                    <div className="bg-base-200/50 p-4 rounded-xl mb-6 space-y-3 border border-base-300">
                        <div className="flex justify-between items-center">
                            <span className="text-sm opacity-70">Service</span>
                            <span className="font-medium">{bookingDetails.serviceTitle}</span>
                        </div>
                        {bookingDetails.date && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm opacity-70 flex items-center gap-1">
                                    <Calendar size={12} /> Date
                                </span>
                                <span className="font-medium">
                                    {new Date(bookingDetails.date).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                        <div className="divider my-2"></div>
                        <div className="flex justify-between items-center text-lg">
                            <span className="font-bold">Total</span>
                            <span className="font-bold text-primary">${bookingDetails.price}</span>
                        </div>
                    </div>

                    {/* Demo Notice */}
                    {!STRIPE_KEY && (
                        <div className="alert alert-info text-xs mb-4">
                            <span>🧪 Demo mode - No real charges will be made</span>
                        </div>
                    )}

                    {/* Payment Form */}
                    <form onSubmit={handlePayment} className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-xs font-medium">Card Number</span>
                            </label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={18} />
                                <input
                                    type="text"
                                    className="input input-bordered w-full pl-10 font-mono"
                                    placeholder="0000 0000 0000 0000"
                                    required
                                    defaultValue="4242 4242 4242 4242"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="form-control flex-1">
                                <label className="label">
                                    <span className="label-text text-xs font-medium">Expiry</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full font-mono"
                                    placeholder="MM/YY"
                                    required
                                    defaultValue="12/28"
                                />
                            </div>
                            <div className="form-control flex-1">
                                <label className="label">
                                    <span className="label-text text-xs font-medium">CVC</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full font-mono"
                                    placeholder="123"
                                    required
                                    defaultValue="123"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full mt-6 gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Lock size={16} />
                                    Pay ${bookingDetails.price}
                                </>
                            )}
                        </button>

                        <p className="text-xs text-center text-base-content/40 mt-2">
                            Your card will be charged ${bookingDetails.price}
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}
