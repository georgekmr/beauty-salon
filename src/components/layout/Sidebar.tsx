import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard,
  Calendar,
  X,
  Shield,
  ShoppingCart,
  Users,
  History,
  ChevronDown,
  ChevronRight,
  Settings,
  Package,
  UserCog,
  BarChart3,
  DollarSign,
  Archive,
  TrendingUp
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  name: string
  href?: string
  icon: React.ElementType
  children?: NavItem[]
}

const adminNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Persona Management', href: '/persona-management', icon: Shield },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'POS', href: '/pos', icon: ShoppingCart },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Sales History', href: '/sales-history', icon: History },
  {
    name: 'Management',
    icon: Settings,
    children: [
      { name: 'Services', href: '/management/services', icon: Settings },
      { name: 'Products', href: '/management/products', icon: Package },
      { name: 'Staff and Schedules', href: '/management/staff', icon: UserCog },
    ]
  },
  {
    name: 'Reports',
    icon: BarChart3,
    children: [
      { name: 'Sales Reports', href: '/reports/sales', icon: DollarSign },
      { name: 'Inventory Reports', href: '/reports/inventory', icon: Archive },
      { name: 'Client Reports', href: '/reports/clients', icon: Users },
      { name: 'Staff Performance Reports', href: '/reports/staff-performance', icon: TrendingUp },
    ]
  },
]

const staffNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'POS', href: '/pos', icon: ShoppingCart },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Sales History', href: '/sales-history', icon: History },
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation()
  const { persona } = useAuth()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const navigation = persona?.type === 'admin' ? adminNavigation : staffNavigation

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const isItemActive = (item: NavItem): boolean => {
    if (item.href) {
      return location.pathname === item.href
    }
    if (item.children) {
      return item.children.some(child => child.href === location.pathname)
    }
    return false
  }

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const Icon = item.icon
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.name)
    const isActive = isItemActive(item)

    if (hasChildren) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleExpanded(item.name)}
            className={`
              w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
              ${isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
            style={{ paddingLeft: `${0.75 + depth * 1}rem` }}
          >
            <div className="flex items-center">
              <Icon className={`h-5 w-5 mr-3 flex-shrink-0 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
              {item.name}
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.children?.map(child => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    const isChildActive = location.pathname === item.href

    return (
      <Link
        key={item.name}
        to={item.href || '#'}
        onClick={onClose}
        className={`
          flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
          ${isChildActive
            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
          }
        `}
        style={{ paddingLeft: `${0.75 + depth * 1}rem` }}
      >
        <Icon className={`h-5 w-5 mr-3 flex-shrink-0 ${isChildActive ? 'text-blue-700' : 'text-gray-400'}`} />
        {item.name}
      </Link>
    )
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Beauty Salon</h1>
              {persona && (
                <p className="text-xs text-gray-500">
                  {persona.type === 'admin' ? 'Admin' : (persona.personName || persona.loginName || 'Staff')} Portal
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => renderNavItem(item))}
          </nav>
        </div>
      </div>
    </>
  )
}

export default Sidebar
