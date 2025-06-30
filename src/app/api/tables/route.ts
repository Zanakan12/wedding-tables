import { NextResponse } from 'next/server'
import { getTables } from '@/lib/services'

export async function GET() {
  try {
    const tables = await getTables()
    return NextResponse.json(tables)
  } catch (error) {
    console.error('Erreur lors de la récupération des tables:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des tables' },
      { status: 500 }
    )
  }
}
