import { NextRequest, NextResponse } from 'next/server'
import { findGuestByName } from '@/lib/services'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')

  if (!name) {
    return NextResponse.json(
      { error: 'Le paramètre name est requis' },
      { status: 400 }
    )
  }

  try {
    const guest = await findGuestByName(name)
    return NextResponse.json(guest)
  } catch (error) {
    console.error('Erreur lors de la recherche de l\'invité:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recherche de l\'invité' },
      { status: 500 }
    )
  }
}
