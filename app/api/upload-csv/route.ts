import { NextRequest, NextResponse } from 'next/server'
import { parse } from 'csv-parse/sync'
import { db } from '@/db/supabase-direct'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const csvContent = await file.text()

    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    })

    console.log('Parsed CSV Records:', records)

    for (const record of records) {
      try {
        console.log('Inserting record:', record)
        
        const rawCustomerData = {
          id: uuidv4(),
          name: (record.Name || record.name || '') as string,
          email: (record.Email || record.email || '') as string,
          gender: (record.Gender || record.gender || '') as string,
          phone: (record.Phone || record.phone || '') as string,
          city: (record.City || record.city || '') as string,
          state: (record.State || record.state || '') as string,
          purchase_history: (record.PurchaseHistory || record.purchaseHistory || '') as string,
          age: parseInt(record.Age || record.age || '0'),
          business_expenses: parseInt(record.BusinessExpenses || record.businessExpenses || '0'),
          business_growth_rate: parseFloat(record.BusinessGrowthRate || record.businessGrowthRate || '0'),
          customer_satisfaction_score: parseInt(record.CustomerSatisfactionScore || record.customerSatisfactionScore || '0'),
          loyalty_points: parseInt(record.LoyaltyPoints || record.loyaltyPoints || '0'),
          average_order_value: parseInt(record.AverageOrderValue || record.averageOrderValue || '0'),
          created_at: new Date(),
          updated_at: new Date()
        }

        // Handle missing or invalid data more gracefully
        const customerData = {
          ...rawCustomerData,
          business_expenses: isNaN(Number(rawCustomerData.business_expenses)) ? 0 : Number(rawCustomerData.business_expenses),
          business_growth_rate: isNaN(Number(rawCustomerData.business_growth_rate)) ? 0 : Number(rawCustomerData.business_growth_rate),
          customer_satisfaction_score: isNaN(Number(rawCustomerData.customer_satisfaction_score)) ? 5 : Number(rawCustomerData.customer_satisfaction_score),
          loyalty_points: isNaN(Number(rawCustomerData.loyalty_points)) ? 0 : Number(rawCustomerData.loyalty_points),
          average_order_value: isNaN(Number(rawCustomerData.average_order_value)) ? 0 : Number(rawCustomerData.average_order_value),
          age: isNaN(Number(rawCustomerData.age)) ? 25 : Number(rawCustomerData.age)
        };
        // More flexible validation - allow records with some missing numerical values
        if (customerData.business_expenses < 0 || 
            customerData.business_growth_rate < 0 || 
            customerData.customer_satisfaction_score < 0 ||
            customerData.loyalty_points < 0 ||
            customerData.average_order_value < 0 ||
            customerData.age < 0) {
          throw new Error('Invalid numerical values in CSV - negative values not allowed');
        }

        await db.upsertCustomer(customerData)
      } catch (dbError) {
        console.error('Database error:', dbError)
        return NextResponse.json({ 
          error: 'Failed to process CSV record',
          details: dbError instanceof Error ? dbError.message : 'Unknown error',
          record: record
        }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      message: 'CSV data processed successfully',
      recordCount: records.length 
    })

  } catch (error) {
    console.error('Error processing CSV:', error)
    return NextResponse.json({ 
      error: 'Failed to process CSV data',
      details: error 
    }, { status: 500 })
  }
}
