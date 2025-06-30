// types/index.ts
export interface Guest {
  id: number;
  name: string;
  tableId: number;
  table?: Table;
}

export interface Table {
  id: number;
  name: string;
  capacity: number;
  x: number;
  y: number;
  guests?: Guest[];
}
