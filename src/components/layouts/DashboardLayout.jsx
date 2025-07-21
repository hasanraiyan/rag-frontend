import React, { useEffect, useCallback, useRef, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setSidebarOpen, toggleSidebar, setSidebarCollapsed } from '../../store/slices/uiSlice'
import NavigationMenu from '../ui/NavigationMenu'
import NotificationDropdown from '../ui/NotificationDropdown'
import UserProfileDropdown from '../ui/UserProfileDropdown'
import { Menu, X, Search, ChevronLeft, ChevronRight, Bell } from 'lucide-react'
import DashboardHome from '../../pages/dashboard/DashboardHome'
import ChatbotsPage from '../../pages/dashboard/ChatbotsPage'
import CreateChatbotPage from '../../pages/dashboard/CreateChatbotPage'
import EditChatbotPage from '../../pages/dashboard/EditChatbotPage'
import TestChatPage from '../../pages/dashboard/TestChatPage'
import CompanyPage from '../../pages/dashboard/CompanyPage'
import AccountSettingsPage from '../../pages/dashboard/AccountSettingsPage'
import SubscriptionPage from '../../pages/dashboard/SubscriptionPage'
import DocumentList from '../documents/DocumentList'
import DocumentUpload from '../documents/DocumentUpload'
import DocumentDetailsPage from '../documents/DocumentDetailsPage'
import { SidebarProvider } from '../ui/sidebar'
import { useIsMobile } from '../../hooks/use-mobile'

function DashboardLayout() {
    const dispatch = useDispatch()
    const { sidebarOpen, theme, sidebarCollapsed } = useSelector((s) => s.ui)
    const location = useLocation()
    const sidebarRef = useRef(null)
    const isMobile = useIsMobile();
    const [searchFocused, setSearchFocused] = useState(false)

    // Close mobile sidebar on route change
    useEffect(() => {
        if (isMobile && sidebarOpen) {
            dispatch(setSidebarOpen(false))
        }
    }, [location.pathname, isMobile, sidebarOpen, dispatch])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event) => {
            // ESC to close sidebar
            if (event.key === 'Escape' && sidebarOpen) {
                dispatch(setSidebarOpen(false))
            }
            
            // Cmd/Ctrl + K for search (future enhancement)
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault()
                // Focus search input
                const searchInput = document.getElementById('global-search')
                if (searchInput) searchInput.focus()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [sidebarOpen, dispatch])

    // Focus management for accessibility
    useEffect(() => {
        if (sidebarOpen && sidebarRef.current && isMobile) {
            const firstFocusable = sidebarRef.current.querySelector(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
            setTimeout(() => firstFocusable?.focus(), 100)
        }
    }, [sidebarOpen, isMobile])

    const handleSidebarToggle = useCallback(() => {
        if (isMobile) {
            dispatch(setSidebarOpen(true))
        } else {
            dispatch(toggleSidebar())
        }
    }, [dispatch, isMobile])

    const handleSidebarClose = useCallback(() => {
        dispatch(setSidebarOpen(false))
    }, [dispatch])

    const handleSidebarCollapse = useCallback(() => {
        dispatch(setSidebarCollapsed(!sidebarCollapsed))
    }, [dispatch, sidebarCollapsed])

    // Theme classes - simplified
    const isDark = theme === 'dark'
    
    return (
        <SidebarProvider>
            <div className={`flex h-screen w-full ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                
                {/* Backdrop overlay for mobile */}
                {sidebarOpen && isMobile && (
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                        onClick={handleSidebarClose}
                        aria-hidden="true"
                    />
                )}

                {/* Sidebar */}
                <aside
                    ref={sidebarRef}
                    className={`
                        fixed lg:static inset-y-0 left-0 z-50 flex flex-col
                        ${sidebarCollapsed && !isMobile ? 'w-16' : 'w-64'}
                        ${sidebarOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'}
                        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                        border-r transition-all duration-300 ease-in-out
                        ${isMobile ? 'shadow-2xl' : 'shadow-sm'}
                    `}
                >
                    {/* Sidebar Header */}
                    <div className={`
                        h-16 flex items-center justify-between px-4 border-b
                        ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}
                    `}>
                        {!sidebarCollapsed && (
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">AI</span>
                                </div>
                                <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Axion
                                </span>
                            </div>
                        )}
                        
                        {/* Sidebar controls */}
                        <div className="flex items-center space-x-1">
                            {!isMobile && (
                                <button
                                    onClick={handleSidebarCollapse}
                                    className={`
                                        p-2 rounded-lg transition-colors
                                        ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}
                                    `}
                                    title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                                >
                                    {sidebarCollapsed ? 
                                        <ChevronRight className="w-4 h-4" /> : 
                                        <ChevronLeft className="w-4 h-4" />
                                    }
                                </button>
                            )}
                            
                            {isMobile && (
                                <button
                                    onClick={handleSidebarClose}
                                    className={`
                                        p-2 rounded-lg transition-colors
                                        ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}
                                    `}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-4">
                        <NavigationMenu
                            collapsed={sidebarCollapsed && !isMobile}
                            onNavigate={isMobile ? handleSidebarClose : undefined}
                        />
                    </div>

                    {/* Sidebar Footer
                    {!sidebarCollapsed && (
                        <div className={`
                            p-4 border-t text-xs text-center
                            ${isDark ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400'}
                        `}>
                            <p>© 2025 Axion</p>
                            <p>Made with ❤️</p>
                        </div>
                    )} */}
                </aside>

                {/* Main Content */}
                <div className="flex flex-1 flex-col min-w-0">
                    {/* Header */}
                    <header className={`
                        flex items-center justify-between h-16 px-4 lg:px-6 border-b backdrop-blur-sm
                        ${isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'}
                        sticky top-0 z-30
                    `}>
                        <div className="flex items-center space-x-4">
                            {/* Mobile menu button */}
                            <button
                                onClick={handleSidebarToggle}
                                className={`
                                    lg:hidden p-2 rounded-lg transition-colors
                                    ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}
                                `}
                                aria-label="Toggle sidebar"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            {/* Search */}
                            <div className="relative hidden sm:block">
                                <div className={`
                                    relative flex items-center
                                    ${searchFocused ? 'w-80' : 'w-64'} transition-all duration-200
                                `}>
                                    <Search className={`
                                        absolute left-3 w-4 h-4 transition-colors
                                        ${searchFocused ? 'text-blue-500' : isDark ? 'text-gray-400' : 'text-gray-500'}
                                    `} />
                                    <input
                                        id="global-search"
                                        type="search"
                                        placeholder="Search... (⌘K)"
                                        onFocus={() => setSearchFocused(true)}
                                        onBlur={() => setSearchFocused(false)}
                                        className={`
                                            w-full pl-10 pr-4 py-2.5 rounded-xl border transition-all
                                            ${searchFocused 
                                                ? 'ring-2 ring-blue-500/20 border-blue-300' 
                                                : isDark 
                                                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                                    : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500'
                                            }
                                            focus:outline-none focus:bg-white dark:focus:bg-gray-600
                                        `}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Header Right */}
                        <div className="flex items-center space-x-3">
                            {/* Mobile search button */}
                            <button className={`
                                sm:hidden p-2 rounded-lg transition-colors
                                ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}
                            `}>
                                <Search className="w-5 h-5" />
                            </button>
                            
                            <NotificationDropdown />
                            <UserProfileDropdown />
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className={`
                        flex-1 overflow-y-auto
                        ${isDark ? 'bg-gray-900' : 'bg-gray-50'}
                    `}>
                        <div className="container mx-auto px-4 lg:px-6 py-6">
                            <Routes location={location}>
                                <Route path="/" element={<DashboardHome />} />
                                <Route
                                    path="/documents"
                                    element={
                                        <div className="space-y-6">
                                            <DocumentUpload />
                                            <DocumentList />
                                        </div>
                                    }
                                />
                                <Route path="/documents/:id" element={<DocumentDetailsPage />} />
                                <Route path="/chatbots" element={<ChatbotsPage />} />
                                <Route path="/chatbots/create" element={<CreateChatbotPage />} />
                                <Route path="/chatbots/:id/edit" element={<EditChatbotPage />} />
                                <Route path="/chatbots/:id/chat" element={<TestChatPage />} />
                                <Route path="/company" element={<CompanyPage />} />
                                <Route path="/settings" element={<AccountSettingsPage />} />
                                <Route path="/subscription" element={<SubscriptionPage />} />
                                <Route
                                    path="/analytics"
                                    element={
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                                                <span className="text-2xl">📊</span>
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                                            <p className="text-gray-500 mb-4">Advanced analytics and insights coming soon</p>
                                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="w-3/4 h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                                            </div>
                                        </div>
                                    }
                                />
                            </Routes>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}

export default DashboardLayout