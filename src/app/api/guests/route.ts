import { NextResponse } from 'next/server'
import { getGuests } from '@/lib/services'

export async function GET() {
  try {
    console.log('API Guests: Début de la requête')
    const guests = await getGuests()
    console.log('API Guests: Données récupérées', guests.length, 'invités')
    return NextResponse.json(guests)
  } catch (error) {
    console.error('Erreur API Guests:', error)
    // Retourner un détail de l'erreur pour le debugging
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
