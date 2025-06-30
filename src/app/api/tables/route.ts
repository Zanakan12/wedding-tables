import { NextResponse } from 'next/server'
import { getTables } from '@/lib/services'

export async function GET() {
  try {
    console.log('API Tables: Début de la requête')
    const tables = await getTables()
    console.log('API Tables: Données récupérées', tables.length, 'tables')
    return NextResponse.json(tables)
  } catch (error) {
    console.error('Erreur API Tables:', error)
    // Retourner un détail de l'erreur pour le debugging
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des tables',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
