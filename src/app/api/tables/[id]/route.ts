import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tableId = parseInt(params.id)
    const { name, capacity, x, y } = await request.json()
    
    if (!name || !capacity) {
      return NextResponse.json(
        { error: 'Nom et capacité requis' },
        { status: 400 }
      )
    }

    const table = await prisma.table.update({
      where: { id: tableId },
      data: {
        name,
        capacity: parseInt(capacity),
        x: x || 0,
        y: y || 0
      }
    })

    return NextResponse.json(table)
  } catch (error) {
    console.error('Erreur lors de la modification de la table:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la modification de la table',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tableId = parseInt(params.id)
    
    // Vérifier s'il y a des invités assignés à cette table
    const guestsCount = await prisma.guest.count({
      where: { tableId: tableId }
    })
    
    if (guestsCount > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer cette table, ${guestsCount} invité(s) y sont assigné(s)` },
        { status: 400 }
      )
    }
    
    await prisma.table.delete({
      where: { id: tableId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression de la table:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la suppression de la table',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
