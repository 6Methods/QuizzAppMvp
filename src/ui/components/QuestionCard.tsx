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
  const [selected, setSelected] = useState<string[]>(
    initialSelectedIds || []
  );
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
      if (isCorrect) return "border-green-bold bg-green-soft text-green-bold";
      if (isSelected && !isCorrect)
        return "border-coral-bold bg-coral-soft text-coral-bold";
      return "border-transparent bg-app-bg opacity-60";
    }

    if (isSelected) return "border-primary bg-primary-light";
    return "border-transparent bg-app-bg hover:bg-white hover:-translate-y-1 hover:shadow-hover";
  };

  const optionLetters = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className="bg-white rounded-q-xl shadow-soft p-8 flex flex-col">
      <h2 className="text-xl md:text-2xl font-semibold text-body-text mb-8 leading-snug">
        {prompt}
      </h2>

      {imageUrl && (
        <div className="mb-6 flex justify-center">
          <img
            src={imageUrl}
            alt="Question"
            className="max-h-64 rounded-q-md object-contain"
          />
        </div>
      )}

      {isMulti && !isRevealed && (
        <p className="text-sm text-body-muted mb-4 font-medium">
          Select all that apply
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {options.map((option, idx) => (
          <button
            key={option.id}
            onClick={() => toggleOption(option.id)}
            disabled={disabled || isRevealed}
            className={cn(
              "p-6 text-left border-2 rounded-q-md transition-all duration-300 ease-quiz flex items-center justify-between",
              getOptionStyle(option.id),
              !disabled && !isRevealed ? "cursor-pointer" : "cursor-default"
            )}
          >
            <span className="font-medium text-base">{option.text}</span>
            {isRevealed && revealedCorrectIds?.includes(option.id) ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              !isRevealed && (
                <span className="text-xs font-semibold text-body-muted opacity-50">
                  {optionLetters[idx]}
                </span>
              )
            )}
          </button>
        ))}
      </div>

      {!isRevealed && (
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={selected.length === 0 || disabled}
            size="lg"
          >
            Submit Answer
            <svg
              className="ml-3 w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
}
