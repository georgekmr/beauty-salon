import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PersonaProtectedRoute from './components/PersonaProtectedRoute'
import Layout from './components/layout/Layout'
import LoginForm from './components/auth/LoginForm'
import SignupForm from './components/auth/SignupForm'
import Dashboard from './pages/Dashboard'
import PersonaManagement from './pages/PersonaManagement'
import PlaceholderPage from './pages/PlaceholderPage'
import ServicesManagement from './pages/ServicesManagement'
import ProductsManagement from './pages/ProductsManagement'
import StaffManagement from './pages/StaffManagement'
import ClientsPage from './pages/ClientsPage'
import ClientProfilePage from './pages/ClientProfilePage'
import CalendarPage from './pages/Calendar'
import {
  ShoppingCart,
  Users,
  History,
  DollarSign,
  Archive,
  TrendingUp
} from 'lucide-react'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />

          <Route path="/persona-management" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <PersonaManagement />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />

          <Route path="/calendar" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <CalendarPage />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />

          <Route path="/pos" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <PlaceholderPage
                    title="Point of Sale"
                    description="Process sales and payments."
                    icon={ShoppingCart}
                  />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />

          <Route path="/clients" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <ClientsPage />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />

          <Route path="/clients/:clientId" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <ClientProfilePage />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />

          <Route path="/sales-history" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <PlaceholderPage
                    title="Sales History"
                    description="View past sales and transactions."
                    icon={History}
                  />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />

          <Route path="/management/services" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <ServicesManagement />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />

          <Route path="/management/products" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <ProductsManagement />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />

          <Route path="/management/staff" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <StaffManagement />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />

          <Route path="/reports/sales" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <PlaceholderPage
                    title="Sales Reports"
                    description="View detailed sales analytics and reports."
                    icon={DollarSign}
                  />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />

          <Route path="/reports/inventory" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <PlaceholderPage
                    title="Inventory Reports"
                    description="Track product inventory and stock levels."
                    icon={Archive}
                  />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />

          <Route path="/reports/clients" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <PlaceholderPage
                    title="Client Reports"
                    description="Analyze client behavior and trends."
                    icon={Users}
                  />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />

          <Route path="/reports/staff-performance" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <PlaceholderPage
                    title="Staff Performance Reports"
                    description="Track staff performance and productivity."
                    icon={TrendingUp}
                  />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
