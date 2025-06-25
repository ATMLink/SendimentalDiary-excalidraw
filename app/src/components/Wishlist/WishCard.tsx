// src/components/Wishlist/WishCard.tsx
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Wish } from '../../api/wishes';

interface WishCardProps {
  wish: Wish;
  index: number;
}

const WishCard: React.FC<WishCardProps> = ({ wish, index }) => {
  const isFulfilled = wish.status === 'fulfilled';

  return (
    <Draggable draggableId={wish._id} index={index} isDragDisabled={isFulfilled}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-4 rounded-md shadow-md mb-4 transition-all duration-200
            ${snapshot.isDragging ? 'ring-2 ring-zeldaYellow scale-105 shadow-lg' : ''}
            ${isFulfilled ? 'bg-gray-700/40 opacity-70' : 'bg-zeldaGreen/30'}`}
          style={{
            ...provided.draggableProps.style,
            borderLeft: `5px solid ${
              isFulfilled
                ? wish.fulfilledBy?.color ?? '#FFFFFF'
                : wish.createdBy.color
            }`,
          }}
        >
          <p className={`text-lg ${isFulfilled ? 'text-gray-400 line-through' : 'text-zeldaGold'}`}>
            {wish.content}
          </p>
          {wish.note && <p className="text-sm text-gray-400 mt-1">备注: {wish.note}</p>}
          <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-600/50">
            <p>许愿人: {wish.createdBy.username}</p>
            {isFulfilled && wish.fulfilledBy && <p>实现人: {wish.fulfilledBy.username}</p>}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default WishCard;
