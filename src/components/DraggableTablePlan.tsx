'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { Table, Guest } from '@/types';

interface Props {
  tables: Table[];
  guests: Guest[];
  highlightId?: number;
  onTableClick?: (tableId: number) => void;
  onGuestMove?: (guestId: number, fromTableId: number, toTableId: number) => void;
}

interface DraggedGuest {
  id: number;
  name: string;
  fromTableId: number;
}

export default function DraggableTablePlan({ 
  tables, 
  guests, 
  highlightId, 
  onTableClick,
  onGuestMove 
}: Props) {
  const [draggedGuest, setDraggedGuest] = useState<DraggedGuest | null>(null);
  const [dragOverTableId, setDragOverTableId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const guestId = Number(active.id);
    const guest = guests.find(g => g.id === guestId);
    
    if (guest) {
      setDraggedGuest({
        id: guest.id,
        name: guest.name,
        fromTableId: guest.tableId
      });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over && over.id.toString().startsWith('table-')) {
      const tableId = Number(over.id.toString().replace('table-', ''));
      setDragOverTableId(tableId);
    } else {
      setDragOverTableId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;
    
    if (over && over.id.toString().startsWith('table-') && draggedGuest) {
      const toTableId = Number(over.id.toString().replace('table-', ''));
      const fromTableId = draggedGuest.fromTableId;
      
      if (toTableId !== fromTableId) {
        onGuestMove?.(draggedGuest.id, fromTableId, toTableId);
      }
    }
    
    setDraggedGuest(null);
    setDragOverTableId(null);
  };

  const handleTableClick = (tableId: number, event: React.MouseEvent) => {
    // Ne pas déclencher le clic sur la table si on clique sur un invité
    if ((event.target as HTMLElement).closest('.guest-item')) {
      return;
    }
    onTableClick?.(tableId);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full grid
                      grid-cols-1
                      sm:grid-cols-2
                      md:grid-cols-3
                      lg:grid-cols-4
                      xl:grid-cols-5
                      gap-4 p-4
                      bg-white-200
                      rounded shadow overflow-auto">
        {tables.map(table => {
          const people = guests.filter((g: Guest) => g.tableId === table.id);
          
          return (
            <DroppableTable
              key={table.id}
              table={table}
              guests={people}
              isHighlighted={highlightId === table.id}
              isDragOver={dragOverTableId === table.id}
              draggedGuest={draggedGuest}
              onTableClick={handleTableClick}
            />
          );
        })}
      </div>
      
      {/* Indicateur de drag global */}
      {draggedGuest && (
        <div className="fixed top-4 left-4 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg z-50 pointer-events-none">
          🤏 Déplacement de {draggedGuest.name}
        </div>
      )}
    </DndContext>
  );
}

// Composant pour les tables droppables
interface DroppableTableProps {
  table: Table;
  guests: Guest[];
  isHighlighted: boolean;
  isDragOver: boolean;
  draggedGuest: DraggedGuest | null;
  onTableClick: (tableId: number, event: React.MouseEvent) => void;
}

function DroppableTable({ 
  table, 
  guests, 
  isHighlighted, 
  isDragOver, 
  draggedGuest,
  onTableClick 
}: DroppableTableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `table-${table.id}`,
  });

  const capacity = table.capacity || 8;
  const occupancy = guests.length;
  const isOverCapacity = occupancy > capacity;
  const isFull = occupancy === capacity;

  return (
    <div
      ref={setNodeRef}
      onClick={(e) => onTableClick(table.id, e)}
      className={`
        w-full h-48 p-3 rounded-lg flex flex-col items-center text-sm
        transition-all duration-200 ease-in-out relative
        cursor-pointer hover:shadow-lg
        ${isHighlighted
          ? 'bg-blue-200 border-2 border-blue-500 text-black'
          : isDragOver || isOver
            ? 'bg-purple-200 border-2 border-purple-500 scale-105 shadow-xl'
            : isOverCapacity 
              ? 'bg-red-100 border-2 border-red-300'
              : isFull
                ? 'bg-yellow-100 border-2 border-yellow-300'
                : 'bg-green-100 border-2 border-green-300'}
        shadow
      `}
    >
      <div className="font-bold mb-2 text-base text-center">{table.name}</div>
      <div className={`text-xs mb-2 px-2 py-1 rounded-full ${
        isOverCapacity 
          ? 'bg-red-200 text-red-800'
          : isFull
            ? 'bg-yellow-200 text-yellow-800'
            : 'bg-green-200 text-green-800'
      }`}>
        {occupancy}/{capacity} places
      </div>
      
      {/* Zone de drop visible pendant le drag */}
      {draggedGuest && (isDragOver || isOver) && (
        <div className="absolute inset-0 bg-purple-300 bg-opacity-50 rounded-lg flex items-center justify-center z-10">
          <div className="text-lg font-bold text-purple-800">
            📍 Déposer ici
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-auto w-full relative">
        {guests.map((guest: Guest) => (
          <DraggableGuest
            key={guest.id}
            guest={guest}
            isDragging={draggedGuest?.id === guest.id}
          />
        ))}
      </div>
    </div>
  );
}

// Composant pour les invités draggables
interface DraggableGuestProps {
  guest: Guest;
  isDragging: boolean;
}

function DraggableGuest({ guest, isDragging }: DraggableGuestProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging: dndIsDragging } = useDraggable({
    id: guest.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 1000,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        guest-item text-xs text-center truncate mb-1 p-2 rounded
        cursor-grab active:cursor-grabbing
        transition-all duration-200
        select-none
        ${isDragging || dndIsDragging 
          ? 'bg-blue-500 text-white shadow-lg scale-110 z-50 opacity-80' 
          : 'bg-white bg-opacity-70 hover:bg-opacity-90 hover:shadow-sm border border-gray-200'
        }
      `}
    >
      <div className="pointer-events-none">
        {isDragging || dndIsDragging ? '🤏 ' : ''}
        {guest.name}
      </div>
    </div>
  );
}
