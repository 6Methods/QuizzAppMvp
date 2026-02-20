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

const ANSWER_KEYS = ["A", "B", "C", "D", "E", "F", "G", "H"];

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
        return "border-success bg-success-soft text-green-800";
      }
      if (isSelected && !isCorrect) {
        return "border-error bg-error-soft text-red-800";
      }
      return "border-transparent bg-page text-ink-light";
    }

    if (isSelected) {
      return "border-primary-500 bg-primary-500 text-white shadow-float";
    }

    return "border-transparent bg-page hover:bg-white hover:border-primary-500 hover:-translate-y-0.5 hover:shadow-md";
  };

  return (
    <div className="bg-white rounded-3xl shadow-card p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-ink text-center mb-8">
        {prompt}
      </h2>

      {imageUrl && (
        <div className="mb-6 flex justify-center">
          <img
            src={imageUrl}
            alt="Question"
            className="max-h-64 rounded-2xl object-contain"
          />
        </div>
      )}

      {isMulti && !isRevealed && (
        <p className="text-sm text-ink-light mb-4 text-center">
          Select all that apply
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {options.map((option, idx) => (
          <button
            key={option.id}
            onClick={() => toggleOption(option.id)}
            disabled={disabled || isRevealed}
            className={cn(
              "p-4 text-left border-2 rounded-2xl transition-all duration-200 flex items-center font-medium",
              getOptionStyle(option.id),
              !disabled && !isRevealed && "cursor-pointer"
            )}
          >
            <span
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center mr-4 text-xs font-bold shrink-0",
                selected.includes(option.id) && !isRevealed
                  ? "bg-white/20 text-white"
                  : "bg-black/5"
              )}
            >
              {ANSWER_KEYS[idx] || idx + 1}
            </span>
            {option.text}
            {isRevealed && revealedCorrectIds?.includes(option.id) && (
              <span className="ml-auto">✓</span>
            )}
          </button>
        ))}
      </div>

      {!isRevealed && (
        <Button
          onClick={handleSubmit}
          disabled={selected.length === 0 || disabled}
          className="w-full"
          size="lg"
        >
          Submit Answer
        </Button>
      )}
    </div>
  );
}
