import { supabase } from '../lib/supabase'

export interface Product {
  product_id: number
  product_name: string
  brand: string | null
  description: string | null
  price: number
  stock_quantity: number
}

export interface ProductInput {
  product_name: string
  brand?: string
  description?: string
  price: number
  stock_quantity: number
}

export const productsService = {
  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('bs_products')
      .select('*')
      .order('product_name', { ascending: true })

    if (error) {
      console.error('Error fetching products:', error)
      throw error
    }

    return data || []
  },

  async createProduct(product: ProductInput): Promise<Product | null> {
    const { data, error } = await supabase
      .from('bs_products')
      .insert([product])
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      throw error
    }

    return data
  },

  async updateProduct(productId: number, product: Partial<ProductInput>): Promise<Product | null> {
    const { data, error } = await supabase
      .from('bs_products')
      .update(product)
      .eq('product_id', productId)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      throw error
    }

    return data
  },

  async adjustStock(productId: number, adjustment: number): Promise<Product | null> {
    const { data: product } = await supabase
      .from('bs_products')
      .select('stock_quantity')
      .eq('product_id', productId)
      .single()

    if (!product) return null

    const newQuantity = product.stock_quantity + adjustment

    const { data, error } = await supabase
      .from('bs_products')
      .update({ stock_quantity: newQuantity })
      .eq('product_id', productId)
      .select()
      .single()

    if (error) {
      console.error('Error adjusting stock:', error)
      throw error
    }

    return data
  },

  async deleteProduct(productId: number): Promise<void> {
    const { error } = await supabase
      .from('bs_products')
      .delete()
      .eq('product_id', productId)

    if (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }
}
