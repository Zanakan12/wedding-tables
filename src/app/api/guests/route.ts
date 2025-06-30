import { NextResponse } from 'next/server'
import { getGuests } from '@/lib/services'

export async function GET() {
  try {
    const guests = await getGuests()
    return NextResponse.json(guests)
  } catch (error) {
    console.error('Erreur lors de la récupération des invités:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des invités' },
      { status: 500 }
    )
  }
}
