import { NextRequest, NextResponse } from 'next/server'
import { getTables } from '@/lib/services'
import { prisma } from '@/lib/db'

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

export async function POST(request: NextRequest) {
  try {
    const { name, capacity, x, y } = await request.json()
    
    if (!name || !capacity) {
      return NextResponse.json(
        { error: 'Nom et capacité requis' },
        { status: 400 }
      )
    }

    const table = await prisma.table.create({
      data: {
        name,
        capacity: parseInt(capacity),
        x: x || 0,
        y: y || 0
      }
    })

    return NextResponse.json(table, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de la table:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création de la table',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
