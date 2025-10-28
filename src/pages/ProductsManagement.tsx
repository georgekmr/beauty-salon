import React, { useState, useEffect } from 'react'
import { productsService, Product, ProductInput } from '../services/productsService'
import { Plus, Edit2, Trash2, X, Package } from 'lucide-react'

const ProductsManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null)
  const [stockAdjustment, setStockAdjustment] = useState(0)
  const [formData, setFormData] = useState<ProductInput>({
    product_name: '',
    brand: '',
    description: '',
    price: 0,
    stock_quantity: 0
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await productsService.getAllProducts()
      setProducts(data)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setEditingProduct(null)
    setFormData({
      product_name: '',
      brand: '',
      description: '',
      price: 0,
      stock_quantity: 0
    })
    setShowModal(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      product_name: product.product_name,
      brand: product.brand || '',
      description: product.description || '',
      price: product.price,
      stock_quantity: product.stock_quantity
    })
    setShowModal(true)
  }

  const handleAdjustStock = (product: Product) => {
    setAdjustingProduct(product)
    setStockAdjustment(0)
    setShowStockModal(true)
  }

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adjustingProduct) return

    try {
      await productsService.adjustStock(adjustingProduct.product_id, stockAdjustment)
      setShowStockModal(false)
      await loadProducts()
    } catch (error) {
      alert('Error adjusting stock.')
    }
  }

  const handleDelete = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await productsService.deleteProduct(productId)
      await loadProducts()
    } catch (error) {
      alert('Error deleting product. It may be associated with existing sales.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingProduct) {
        await productsService.updateProduct(editingProduct.product_id, formData)
      } else {
        await productsService.createProduct(formData)
      }
      setShowModal(false)
      await loadProducts()
    } catch (error) {
      alert('Error saving product.')
    }
  }

  const getStockColor = (quantity: number) => {
    if (quantity === 0) return 'text-red-600 bg-red-50'
    if (quantity < 10) return 'text-orange-600 bg-orange-50'
    return 'text-green-600 bg-green-50'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products & Inventory Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage product inventory and pricing</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Product
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No products found. Add your first product to get started.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.product_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.product_name}</div>
                      {product.description && (
                        <div className="text-xs text-gray-500 mt-1">{product.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.brand || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStockColor(product.stock_quantity)}`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleAdjustStock(product)}
                        className="inline-flex items-center text-green-600 hover:text-green-900"
                      >
                        <Package className="h-4 w-4 mr-1" />
                        Adjust Stock
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.product_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStockModal && adjustingProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Adjust Stock</h3>
              <button onClick={() => setShowStockModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleStockSubmit} className="px-6 py-4 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700">{adjustingProduct.product_name}</p>
                <p className="text-xs text-gray-500 mt-1">Current Stock: {adjustingProduct.stock_quantity}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adjustment Amount
                </label>
                <input
                  type="number"
                  required
                  value={stockAdjustment}
                  onChange={(e) => setStockAdjustment(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter positive to add, negative to subtract"
                />
                <p className="text-xs text-gray-500 mt-1">
                  New Stock: {adjustingProduct.stock_quantity + stockAdjustment}
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Adjust Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductsManagement
