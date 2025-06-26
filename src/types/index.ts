// types/index.ts
export interface Guest {
  id: number;
  name: string;
  tableId: number;
}

export interface Table {
  id: number;
  name: string;
  x: number;
  y: number;
}
