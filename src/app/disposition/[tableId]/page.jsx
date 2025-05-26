'use client';

import TableDispositionWrapper from './wrapper';

export default function Page({ params }) {
  const tableId = parseInt(params.tableId, 10);
  return <TableDispositionWrapper tableId={tableId} />;
}
