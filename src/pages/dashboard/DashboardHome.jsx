// src/pages/dashboard/DashboardHome.jsx

import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchCurrentCompany } from '../../store/slices/companySlice'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import {
  Zap,
  Clock,
  ArrowRight,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Crown,
  Sparkles,
  UploadCloud,
  Plus,
  UserPlus,
  TrendingUp
} from 'lucide-react'

function DashboardHome() {
  const dispatch = useDispatch()
  const { company, isLoading } = useSelector((state) => state.company)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(fetchCurrentCompany())
  }, [dispatch])

  // Quick Stats
  const quickStats = [
    {
      name: 'Team Members',
      value: company?.stats?.user_count || 0,
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      link: '/dashboard/company',
    },
    {
      name: 'Documents',
      value: company?.stats?.document_count || 0,
      icon: FileText,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      link: '/dashboard/documents',
    },
    {
      name: 'Chatbots',
      value: company?.stats?.chatbot_count || 0,
      icon: MessageSquare,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      link: '/dashboard/chatbots',
    },
    {
      name: 'Chat Sessions',
      value: company?.stats?.session_count || 0,
      icon: BarChart3,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      link: '/dashboard/analytics',
    },
  ]

  // Quick Actions with proper icons
  const quickActions = [
    {
      name: 'Upload Document',
      description: 'Add new documents to your knowledge base',
      icon: UploadCloud,
      bgColor: 'from-blue-600 to-blue-700',
      link: '/dashboard/documents',
    },
    {
      name: 'Create Chatbot',
      description: 'Configure a new AI assistant',
      icon: Plus,
      bgColor: 'from-purple-600 to-purple-700',
      link: '/dashboard/chatbots',
    },
    {
      name: 'Invite Team',
      description: 'Add colleagues to collaborate',
      icon: UserPlus,
      bgColor: 'from-green-600 to-green-700',
      link: '/dashboard/company',
    },
    {
      name: 'View Analytics',
      description: 'Track usage and performance',
      icon: TrendingUp,
      bgColor: 'from-orange-600 to-orange-700',
      link: '/dashboard/analytics',
    },
  ]

  // Recent Activity (mock data)
  const recentActivity = [
    {
      id: 1,
      action: 'Document uploaded',
      item: 'Q4 Report.pdf',
      time: '2 hours ago',
      icon: FileText,
    },
    {
      id: 2,
      action: 'Chatbot created',
      item: 'Support Bot',
      time: '4 hours ago',
      icon: MessageSquare,
    },
    {
      id: 3,
      action: 'Team member joined',
      item: 'John Smith',
      time: '1 day ago',
      icon: Users,
    },
    {
      id: 4,
      action: 'Analytics report generated',
      item: 'Weekly Summary',
      time: '2 days ago',
      icon: BarChart3,
    },
  ]

  if (isLoading && !company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.fullName?.split(' ')[0] || 'User'}!
        </h1>
        <p className="mt-1 text-gray-600">
          Here's what's happening with{' '}
          <span className="font-medium text-gray-900">
            {company?.name || 'your company'}
          </span>{' '}
          today.
        </p>
      </header>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {quickStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.name}
              to={stat.link}
              className="flex items-center p-5 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className={`p-3 ${stat.bgColor} rounded-lg flex-shrink-0`}>
                <Icon className={`${stat.iconColor} w-6 h-6`} />
              </div>
              <div className="ml-4">
                <div className="text-lg font-bold text-gray-900">
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">{stat.name}</div>
              </div>
            </Link>
          )
        })}
      </section>

      {/* Quick Actions & Recent Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="flex items-center text-xl font-semibold text-gray-900 mb-4">
            <Zap className="w-5 h-5 text-blue-600 mr-2" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.name}
                  to={action.link}
                  className="relative flex h-32 overflow-hidden rounded-lg shadow-sm transition-transform hover:scale-[1.02] hover:shadow-lg group"
                >
                  {/* Gradient background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${action.bgColor} opacity-90 group-hover:opacity-100 transition-opacity`}
                  />
                  {/* Content */}
                  <div className="relative z-10 flex flex-col justify-between p-6 text-white">
                    <div className="flex items-center mb-2">
                      <div className=" bg-opacity-20 p-2 rounded-md group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="ml-3 text-lg font-semibold">
                        {action.name}
                      </h3>
                    </div>
                    <p className="text-sm opacity-90">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="absolute bottom-4 right-4 w-5 h-5 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="flex items-center text-xl font-semibold text-gray-900 mb-4">
            <Clock className="w-5 h-5 text-blue-600 mr-2" />
            Recent Activity
          </h2>
          <div className="bg-white rounded-lg shadow divide-y divide-gray-100 overflow-hidden">
            {recentActivity.map((act) => {
              const Icon = act.icon
              return (
                <div
                  key={act.id}
                  className="flex items-start p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 bg-gray-100 p-2 rounded-lg">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {act.action}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {act.item}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 whitespace-nowrap">
                    {act.time}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Subscription Plan */}
      <section className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6 flex flex-col lg:flex-row items-center gap-6">
        <div className="flex-1 flex items-center gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Crown className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Free Plan
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                Active
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" /> 5 users
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" /> 10 docs
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> 1 GB storage
              </span>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <span className="block">Usage this month:</span>
              <span className="font-medium">2/5</span> users &nbsp;&nbsp;
              <span className="font-medium">1/10</span> docs
            </div>
          </div>
        </div>
        <div>
          <Link
            to="/dashboard/subscription"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md transition-colors"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Upgrade Plan
          </Link>
          <p className="mt-2 text-sm text-gray-500 text-center lg:text-right">
            Get more features
          </p>
        </div>
      </section>
    </div>
  )
}

export default DashboardHome