// src/data/tables.ts
import { Table } from '@/types';

export const tables: Table[] = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  name: `Table ${i + 1}`,
  x: (i % 5) * 120 + 50,     // 5 tables par ligne
  y: Math.floor(i / 5) * 120 + 50, // maintenant 5 lignes pour 24 tables
}));
