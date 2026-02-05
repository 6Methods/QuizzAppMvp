"use client";

import { useState } from "react";
import { cn } from "@/src/lib/utils";
import { Button } from "./Button";

interface Option {
  id: string;
  text: string;
}

interface QuestionCardProps {
  prompt: string;
  imageUrl?: string | null;
  options: Option[];
  isMulti: boolean;
  onSubmit: (selectedIds: string[]) => void;
  disabled?: boolean;
  revealedCorrectIds?: string[];
  selectedIds?: string[];
}

export function QuestionCard({
  prompt,
  imageUrl,
  options,
  isMulti,
  onSubmit,
  disabled,
  revealedCorrectIds,
  selectedIds: initialSelectedIds,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<string[]>(initialSelectedIds || []);
  const isRevealed = !!revealedCorrectIds;

  const toggleOption = (id: string) => {
    if (disabled || isRevealed) return;

    if (isMulti) {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setSelected([id]);
    }
  };

  const handleSubmit = () => {
    if (selected.length > 0 && !disabled && !isRevealed) {
      onSubmit(selected);
    }
  };

  const getOptionStyle = (optionId: string) => {
    const isSelected = selected.includes(optionId);
    const isCorrect = revealedCorrectIds?.includes(optionId);

    if (isRevealed) {
      if (isCorrect) {
        return "border-green-500 bg-green-50 text-green-800";
      }
      if (isSelected && !isCorrect) {
        return "border-red-500 bg-red-50 text-red-800";
      }
      return "border-gray-200 bg-gray-50 text-gray-500";
    }

    if (isSelected) {
      return "border-primary-500 bg-primary-50 text-primary-800";
    }

    return "border-gray-200 hover:border-primary-300 hover:bg-primary-50";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{prompt}</h2>

      {imageUrl && (
        <div className="mb-4 flex justify-center">
          <img
            src={imageUrl}
            alt="Question"
            className="max-h-64 rounded-lg object-contain"
          />
        </div>
      )}

      {isMulti && !isRevealed && (
        <p className="text-sm text-gray-500 mb-3">Select all that apply</p>
      )}

      <div className="space-y-3 mb-6">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => toggleOption(option.id)}
            disabled={disabled || isRevealed}
            className={cn(
              "w-full p-4 text-left border-2 rounded-lg transition-all",
              getOptionStyle(option.id),
              !disabled && !isRevealed && "cursor-pointer"
            )}
          >
            <span className="font-medium">{option.text}</span>
            {isRevealed && revealedCorrectIds?.includes(option.id) && (
              <span className="ml-2">✓</span>
            )}
          </button>
        ))}
      </div>

      {!isRevealed && (
        <Button
          onClick={handleSubmit}
          disabled={selected.length === 0 || disabled}
          className="w-full"
        >
          Submit Answer
        </Button>
      )}
    </div>
  );
}
