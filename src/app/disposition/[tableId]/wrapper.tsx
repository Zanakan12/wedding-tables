'use client';

import TableDisposition from './TableDisposition';
import { Table, Guest } from '@prisma/client';

interface Props {
  tableId: number;
  tables: (Table & { guests: Guest[] })[];
}

export default function TableDispositionWrapper({ tableId, tables }: Props) {
  return <TableDisposition tableId={tableId} tables={tables} />;
}
