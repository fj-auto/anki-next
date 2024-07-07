// file: components/AddCardForm.tsx
import React, { useState } from 'react';

interface AddCardFormProps {
  onAddCard: (front: string, back: string) => void;
}

const AddCardForm: React.FC<AddCardFormProps> = ({ onAddCard }) => {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (front.trim() && back.trim()) {
      onAddCard(front, back);
      setFront('');
      setBack('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <h3 className="text-lg font-bold mb-2">Add New Card</h3>
      <input
        value={front}
        onChange={e => setFront(e.target.value)}
        placeholder="Front"
        className="p-2 border rounded mr-2"
      />
      <input
        value={back}
        onChange={e => setBack(e.target.value)}
        placeholder="Back"
        className="p-2 border rounded mr-2"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
      >
        Add Card
      </button>
    </form>
  );
};

export default AddCardForm;
