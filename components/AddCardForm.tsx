// file: components/AddCardForm.tsx
import React from 'react';

interface AddCardFormProps {
  onAddCard: (front: string, back: string) => void;
}

const AddCardForm: React.FC<AddCardFormProps> = ({ onAddCard }) => {
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        const frontInput = e.currentTarget.front as HTMLInputElement;
        const backInput = e.currentTarget.back as HTMLInputElement;
        onAddCard(frontInput.value, backInput.value);
        frontInput.value = '';
        backInput.value = '';
      }}
      className="mb-4"
    >
      <h3 className="text-lg font-bold mb-2">Add New Card</h3>
      <input name="front" placeholder="Front" className="p-2 border rounded mr-2" />
      <input name="back" placeholder="Back" className="p-2 border rounded mr-2" />
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
