import { NextRequest, NextResponse } from 'next/server'
import { getGuests } from '@/lib/services'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    console.log('API Guests: Début de la requête')
    const guests = await getGuests()
    console.log('API Guests: Données récupérées', guests.length, 'invités')
    return NextResponse.json(guests)
  } catch (error) {
    console.error('Erreur API Guests:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des invités',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, tableId } = await request.json()
    
    if (!name || !tableId) {
      return NextResponse.json(
        { error: 'Nom et numéro de table requis' },
        { status: 400 }
      )
    }

    const guest = await prisma.guest.create({
      data: {
        name,
        tableId: parseInt(tableId)
      }
    })

    return NextResponse.json(guest, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de l\'invité:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création de l\'invité',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
