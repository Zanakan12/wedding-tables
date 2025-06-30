import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const guestId = parseInt(id)
    const { name, tableId } = await request.json()
    
    if (!name || !tableId) {
      return NextResponse.json(
        { error: 'Nom et numéro de table requis' },
        { status: 400 }
      )
    }

    const guest = await prisma.guest.update({
      where: { id: guestId },
      data: {
        name,
        tableId: parseInt(tableId)
      }
    })

    return NextResponse.json(guest)
  } catch (error) {
    console.error('Erreur lors de la modification de l\'invité:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la modification de l\'invité',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const guestId = parseInt(id)
    
    await prisma.guest.delete({
      where: { id: guestId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'invité:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la suppression de l\'invité',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
