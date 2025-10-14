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

  // Clear all data
  async clearAllData() {
    console.log('🧹 Clearing all data from Supabase...')
    
    const tables = ['follow_up_reminders', 'onboarding_checklist', 'leads', 'customers', 'waitlist_users', 'account', 'user']
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
