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
  onGuestDelete?: (guestId: number) => Promise<void>;
}

interface DraggedGuest {
  id: number;
  name: string;
  tableId: number;
}

// Composant pour les invités draggables avec suppression
function DraggableGuest({ guest, isDragging, onDelete }: {
  guest: Guest;
  isDragging: boolean;
  onDelete: (guestId: number, event: React.MouseEvent) => Promise<void>;
}) {
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
        select-none relative group
        ${isDragging || dndIsDragging 
          ? 'bg-blue-500 text-white shadow-lg scale-110 z-50 opacity-80' 
          : 'bg-white bg-opacity-70 hover:bg-opacity-90 hover:shadow-sm border border-gray-200'
        }
      `}
    >
      <div className="pointer-events-none flex items-center justify-between">
        <span className="flex-1 truncate">
          {isDragging || dndIsDragging ? '🤏 ' : ''}
          {guest.name}
        </span>
        
        {/* Bouton de suppression */}
        {!isDragging && !dndIsDragging && (
          <button
            onClick={(e) => onDelete(guest.id, e)}
            className="
              pointer-events-auto ml-1 w-4 h-4 flex items-center justify-center
              text-red-500 hover:text-white hover:bg-red-500 
              rounded-full text-xs font-bold
              opacity-0 group-hover:opacity-100
              transition-all duration-200
              flex-shrink-0
            "
            title="Supprimer cet invité"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

// Composant pour les tables droppables
function DroppableTable({ 
  table, 
  guests, 
  isHighlighted, 
  isDragOver, 
  draggedGuest,
  onTableClick,
  onGuestDelete
}: {
  table: Table;
  guests: Guest[];
  isHighlighted: boolean;
  isDragOver: boolean;
  draggedGuest: DraggedGuest | null;
  onTableClick: (tableId: number) => void;
  onGuestDelete: (guestId: number, event: React.MouseEvent) => Promise<void>;
}) {
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
      onClick={() => onTableClick(table.id)}
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
            onDelete={onGuestDelete}
          />
        ))}
      </div>
    </div>
  );
}

const DraggableTablePlanWithDelete = ({ 
  tables, 
  guests, 
  highlightId, 
  onTableClick, 
  onGuestMove,
  onGuestDelete
}: Props) => {
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
    const guestId = Number(event.active.id);
    const guest = guests.find(g => g.id === guestId);
    if (guest) {
      setDraggedGuest(guest);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id;
    if (overId && typeof overId === 'string' && overId.startsWith('table-')) {
      const tableId = Number(overId.replace('table-', ''));
      setDragOverTableId(tableId);
    } else {
      setDragOverTableId(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { over } = event;
    
    setDraggedGuest(null);
    setDragOverTableId(null);

    if (!over || !draggedGuest) return;

    const overId = over.id;
    if (typeof overId === 'string' && overId.startsWith('table-')) {
      const newTableId = Number(overId.replace('table-', ''));
      
      if (newTableId !== draggedGuest.tableId && onGuestMove) {
        try {
          await onGuestMove(draggedGuest.id, draggedGuest.tableId, newTableId);
        } catch (error) {
          console.error('Erreur lors du déplacement de l\'invité:', error);
        }
      }
    }
  };

  const handleTableClick = (tableId: number) => {
    if (onTableClick) {
      onTableClick(tableId);
    }
  };

  const handleGuestDelete = async (guestId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    if (onGuestDelete) {
      try {
        await onGuestDelete(guestId);
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'invité:', error);
      }
    }
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
              onGuestDelete={handleGuestDelete}
            />
          );
        })}
      </div>
    </DndContext>
  );
};

export default DraggableTablePlanWithDelete;
