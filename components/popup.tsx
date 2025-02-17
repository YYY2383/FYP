// components/PopUp.tsx
import React from "react";

interface PopUpProps {
  ingredient: {
    name: string;
    explanation: string;
    vegan: string;
    vegetarian: string;
  };
  onClose: () => void;
}

const PopUp: React.FC<PopUpProps> = ({ ingredient, onClose }) => {
  if (!ingredient) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>{ingredient.name}</h3>
        <p><strong>Explanation:</strong> {ingredient.explanation}</p>
        <p><strong>Vegan:</strong> {ingredient.vegan}</p>
        <p><strong>Vegetarian:</strong> {ingredient.vegetarian}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default PopUp;