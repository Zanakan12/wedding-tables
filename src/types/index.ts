// types/index.ts
export interface Guest {
  id: number;
  name: string;
  tableId: number;
}

// types.ts
export interface Table {
  id: number;
  name: string;
  x: number;
  y: number;
}

