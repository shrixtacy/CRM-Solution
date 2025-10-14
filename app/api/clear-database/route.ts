import { NextResponse } from 'next/server'
import { db } from '@/db/supabase-direct'

export async function POST() {
  try {
    console.log('🧹 Starting database cleanup...')
    
    const results = await db.clearAllData()
    
    console.log('✅ Database cleanup completed!')
    
    return NextResponse.json({
      message: 'Database cleared successfully',
      results
    })
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error)
    return NextResponse.json({
      error: 'Failed to clear database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
