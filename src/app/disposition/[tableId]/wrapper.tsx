'use client';

import TableDisposition from './TableDisposition';

export default function TableDispositionWrapper({ tableId }: { tableId: number }) {
  return <TableDisposition tableId={tableId} />;
}
