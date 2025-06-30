import { prisma } from '@/lib/db'

export async function getTables() {
  return await prisma.table.findMany({
    include: {
      guests: true
    },
    orderBy: {
      id: 'asc'
    }
  })
}

export async function getGuests() {
  return await prisma.guest.findMany({
    include: {
      table: true
    },
    orderBy: {
      id: 'asc'
    }
  })
}

export async function findGuestByName(name: string) {
  return await prisma.guest.findFirst({
    where: {
      name: {
        contains: name,
        mode: 'insensitive'
      }
    },
    include: {
      table: true
    }
  })
}
