import { PrismaClient } from '@prisma/client';
import { use } from 'react';
import TableDispositionWrapper from './wrapper';

const prisma = new PrismaClient();

export default function Page({ params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = use(params);
  const tableIdNumber = parseInt(tableId, 10);

  const tables = use(
    prisma.table.findMany({
      include: { guests: true },
    })
  );

  return <TableDispositionWrapper tableId={tableIdNumber} tables={tables} />;
}
