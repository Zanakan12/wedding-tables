import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  console.log('📥 Requête POST reçue');

  try {
    const body = await req.json();
    console.log('📦 Corps reçu:', body);

    const { id, x, y } = body;

    if (typeof id !== 'number' || typeof x !== 'number' || typeof y !== 'number') {
      console.error('❌ Données invalides:', body);
      return new NextResponse('Invalid data', { status: 400 });
    }

    const updated = await prisma.table.update({
      where: { id },
      data: { x, y },
    });

    console.log('✅ Position mise à jour :', updated);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[API ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
