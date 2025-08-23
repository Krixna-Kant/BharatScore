import type { FC } from "react";

interface ButtonProps {
  label: string;
  onClick?: () => void;
}

export const Button: FC<ButtonProps> = ({ label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 rounded-2xl bg-primary text-black font-semibold shadow-md hover:shadow-lg transition"
    >
      {label}
    </button>
  );
};
