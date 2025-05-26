import TableDisposition from '../[tableId]/TableDisposition';

export default function Page({ params }: { params: { tableId: string } }) {
  return <TableDisposition tableId={parseInt(params.tableId, 10)} />;
}
