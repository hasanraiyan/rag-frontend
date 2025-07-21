// src/pages/dashboard/SubscriptionPage.jsx

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCurrentCompany } from '../../store/slices/companySlice'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { Crown, Star, Shield, CheckCircle } from 'lucide-react'
import AuthService from '../../services/authService'     // hypothetical service call
import { toast } from 'react-toastify'                  // optional for feedback

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: '0',
    period: '/month',
    features: [
      '5 users',
      '10 documents',
      '1 GB storage',
      'Basic support'
    ],
    icon: Crown
  },
  {
    key: 'premium',
    name: 'Premium',
    price: '49',
    period: '/month',
    features: [
      '50 users',
      '100 documents',
      '10 GB storage',
      'Priority email support',
      'Analytics dashboard'
    ],
    icon: Star
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: [
      'Unlimited users',
      'Unlimited docs',
      '100+ GB storage',
      'Dedicated support',
      'SLA & compliance'
    ],
    icon: Shield
  }
]

function SubscriptionPage() {
  const dispatch = useDispatch()
  const { company, isLoading } = useSelector((s) => s.company)
  const [changing, setChanging] = useState(false)

  useEffect(() => {
    dispatch(fetchCurrentCompany())
  }, [dispatch])

  const handleUpgrade = async (planKey) => {
    if (!company) return
    setChanging(true)
    try {
      // hypothetical API call:
      await AuthService.changeSubscription(company.id, planKey)
      toast.success(`Switched to ${planKey} plan.`)
      dispatch(fetchCurrentCompany())  // refresh company info
    } catch (err) {
      toast.error(err.message || 'Failed to change plan.')
    } finally {
      setChanging(false)
    }
  }

  if (isLoading || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  const currentPlanKey = company.subscription_plan || 'free'

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Subscription & Billing</h1>
        <p className="mt-2 text-gray-600">
          Manage your plan, view limits and upgrade when you’re ready.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon
          const isCurrent = plan.key === currentPlanKey

          return (
            <div
              key={plan.key}
              className={`border-2 rounded-xl p-6 flex flex-col justify-between
                ${isCurrent 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-200 hover:shadow-lg hover:border-gray-300'}
                transition-all`}
            >
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-2 rounded-md ${isCurrent ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Icon className={`w-6 h-6 ${isCurrent ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">{plan.name}</h2>
                  {isCurrent && (
                    <span className="ml-auto inline-flex items-center px-2 py-0.5 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Current Plan
                    </span>
                  )}
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>

                <ul className="mb-6 space-y-2 text-gray-700">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleUpgrade(plan.key)}
                disabled={isCurrent || changing}
                className={`w-full py-2 rounded-lg text-white font-medium transition-colors
                  ${isCurrent 
                     ? 'bg-gray-300 cursor-not-allowed' 
                     : 'bg-blue-600 hover:bg-blue-700'}
                  ${changing && 'opacity-60 cursor-wait'}`}
              >
                {isCurrent
                  ? 'Current'
                  : changing
                  ? 'Saving…'
                  : plan.key === 'enterprise'
                  ? 'Contact Sales'
                  : 'Upgrade'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Optional Billing Info */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Billing History</h3>
        <p className="text-gray-600">Coming soon…</p>
      </div>
    </div>
  )
}

export default SubscriptionPage