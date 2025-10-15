// Direct Supabase connection for better reliability
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://cekhahbluzicilrtkyvz.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNla2hhaGJsdXppY2lscnRreXZ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI3NDk5MSwiZXhwIjoyMDc1ODUwOTkxfQ.Bh_Z1r5iFZICmSfnWYwYVyIFniebejg12oy_7HIQ1gE'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Direct database operations
export const db = {
  // Get all customers
  async getCustomers() {
    console.log('🔍 Fetching customers from Supabase...')
    const { data, error } = await supabase.from('customers').select('*')
    if (error) {
      console.error('❌ Error fetching customers:', error)
      return []
    }
    console.log(`✅ Found ${data?.length || 0} customers`)
    return data || []
  },

  // Insert customer
  async insertCustomer(customerData: any) {
    console.log('📝 Inserting customer:', customerData)
    const { data, error } = await supabase.from('customers').insert(customerData).select()
    if (error) {
      console.error('❌ Error inserting customer:', error)
      throw error
    }
    console.log('✅ Customer inserted successfully')
    return data
  },

  // Upsert customer (insert or update on conflict)
  async upsertCustomer(customerData: any) {
    console.log('🔄 Upserting customer:', customerData)
    const { data, error } = await supabase.from('customers').upsert(customerData, { 
      onConflict: 'email' 
    }).select()
    if (error) {
      console.error('❌ Error upserting customer:', error)
      throw error
    }
    console.log('✅ Customer upserted successfully')
    return data
  },

  // Get all leads
  async getLeads() {
    console.log('🔍 Fetching leads from Supabase...')
    const { data, error } = await supabase.from('leads').select('*')
    if (error) {
      console.error('❌ Error fetching leads:', error)
      return []
    }
    console.log(`✅ Found ${data?.length || 0} leads`)
    return data || []
  },

  // Insert lead
  async insertLead(leadData: any) {
    console.log('📝 Inserting lead:', leadData)
    const { data, error } = await supabase.from('leads').insert(leadData).select()
    if (error) {
      console.error('❌ Error inserting lead:', error)
      throw error
    }
    console.log('✅ Lead inserted successfully')
    return data
  },

  // Update lead
  async updateLead(leadId: string, leadData: any) {
    console.log('🔄 Updating lead:', leadId, leadData)
    const { data, error } = await supabase.from('leads').update(leadData).eq('id', leadId).select()
    if (error) {
      console.error('❌ Error updating lead:', error)
      throw error
    }
    console.log('✅ Lead updated successfully')
    return data
  },

  // Delete lead
  async deleteLead(leadId: string) {
    console.log('🗑️ Deleting lead:', leadId)
    const { data, error } = await supabase.from('leads').delete().eq('id', leadId).select()
    if (error) {
      console.error('❌ Error deleting lead:', error)
      throw error
    }
    console.log('✅ Lead deleted successfully')
    return data
  },

  // ===== INVENTORY OPERATIONS =====
  
  // Get all products
  async getProducts() {
    console.log('🔍 Fetching products from Supabase...')
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (error) {
      console.error('❌ Error fetching products:', error)
      return []
    }
    console.log(`✅ Found ${data?.length || 0} products`)
    return data || []
  },

  // Insert product
  async insertProduct(productData: any) {
    console.log('📝 Inserting product:', productData)
    const { data, error } = await supabase.from('products').insert(productData).select()
    if (error) {
      console.error('❌ Error inserting product:', error)
      throw error
    }
    console.log('✅ Product inserted successfully')
    return data
  },

  // Update product
  async updateProduct(productId: string, productData: any) {
    console.log('🔄 Updating product:', productId, productData)
    const { data, error } = await supabase.from('products').update(productData).eq('id', productId).select()
    if (error) {
      console.error('❌ Error updating product:', error)
      throw error
    }
    console.log('✅ Product updated successfully')
    return data
  },

  // Delete product
  async deleteProduct(productId: string) {
    console.log('🗑️ Deleting product:', productId)
    const { data, error } = await supabase.from('products').delete().eq('id', productId).select()
    if (error) {
      console.error('❌ Error deleting product:', error)
      throw error
    }
    console.log('✅ Product deleted successfully')
    return data
  },

  // Update product stock
  async updateProductStock(productId: string, newStock: number) {
    console.log('📦 Updating product stock:', productId, newStock)
    const { data, error } = await supabase.from('products').update({ stock: newStock }).eq('id', productId).select()
    if (error) {
      console.error('❌ Error updating product stock:', error)
      throw error
    }
    console.log('✅ Product stock updated successfully')
    return data
  },

  // Get stock movements
  async getStockMovements() {
    console.log('🔍 Fetching stock movements from Supabase...')
    const { data, error } = await supabase.from('stock_movements').select('*').order('created_at', { ascending: false })
    if (error) {
      console.error('❌ Error fetching stock movements:', error)
      return []
    }
    console.log(`✅ Found ${data?.length || 0} stock movements`)
    return data || []
  },

  // Insert stock movement
  async insertStockMovement(movementData: any) {
    console.log('📝 Inserting stock movement:', movementData)
    const { data, error } = await supabase.from('stock_movements').insert(movementData).select()
    if (error) {
      console.error('❌ Error inserting stock movement:', error)
      throw error
    }
    console.log('✅ Stock movement inserted successfully')
    return data
  },

  // Get invoices
  async getInvoices() {
    console.log('🔍 Fetching invoices from Supabase...')
    const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false })
    if (error) {
      console.error('❌ Error fetching invoices:', error)
      return []
    }
    console.log(`✅ Found ${data?.length || 0} invoices`)
    return data || []
  },

  // Insert invoice
  async insertInvoice(invoiceData: any) {
    console.log('📝 Inserting invoice:', invoiceData)
    const { data, error } = await supabase.from('invoices').insert(invoiceData).select()
    if (error) {
      console.error('❌ Error inserting invoice:', error)
      throw error
    }
    console.log('✅ Invoice inserted successfully')
    return data
  },

  // Get invoice items
  async getInvoiceItems(invoiceId: string) {
    console.log('🔍 Fetching invoice items for:', invoiceId)
    const { data, error } = await supabase.from('invoice_items').select('*').eq('invoice_id', invoiceId)
    if (error) {
      console.error('❌ Error fetching invoice items:', error)
      return []
    }
    console.log(`✅ Found ${data?.length || 0} invoice items`)
    return data || []
  },

  // Get all invoice items
  async getAllInvoiceItems() {
    console.log('🔍 Fetching all invoice items from Supabase...')
    const { data, error } = await supabase.from('invoice_items').select('*').order('created_at', { ascending: false })
    if (error) {
      console.error('❌ Error fetching all invoice items:', error)
      return []
    }
    console.log(`✅ Found ${data?.length || 0} invoice items`)
    return data || []
  },

  // Insert invoice items
  async insertInvoiceItems(itemsData: any[]) {
    console.log('📝 Inserting invoice items:', itemsData.length, 'items')
    const { data, error } = await supabase.from('invoice_items').insert(itemsData).select()
    if (error) {
      console.error('❌ Error inserting invoice items:', error)
      throw error
    }
    console.log('✅ Invoice items inserted successfully')
    return data
  },

  // Update all invoices to paid status
  async updateAllInvoicesToPaid() {
    console.log('💰 Updating all invoices to paid status...')
    const { data, error } = await supabase.from('invoices').update({ status: 'paid' }).neq('id', '')
    if (error) {
      console.error('❌ Error updating invoices to paid:', error)
      return { success: false, error: error.message }
    }
    console.log('✅ All invoices updated to paid status')
    return { success: true, data }
  },

  // Clear all data
  async clearAllData() {
    console.log('🧹 Clearing all data from Supabase...')
    
    const tables = ['invoice_items', 'stock_movements', 'invoices', 'products', 'follow_up_reminders', 'onboarding_checklist', 'leads', 'customers', 'waitlist_users', 'account', 'user']
    const results = []
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).delete().neq('id', '')
        if (error) {
          console.error(`❌ Error clearing ${table}:`, error)
          results.push({ table, status: 'error', error: error.message })
        } else {
          console.log(`✅ Cleared ${table}`)
          results.push({ table, status: 'success' })
        }
      } catch (err) {
        console.error(`❌ Exception clearing ${table}:`, err)
        results.push({ table, status: 'error', error: String(err) })
      }
    }
    
    return results
  }
}

console.log('✅ Direct Supabase connection established!')
