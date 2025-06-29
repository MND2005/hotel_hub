
'use client';

import { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

type FeatureInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

export function FeatureInput({ value = [], onChange }: FeatureInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAddFeature = () => {
    const newFeature = inputValue.trim();
    if (newFeature && !value.includes(newFeature)) {
      onChange([...value, newFeature]);
      setInputValue('');
    }
  };

  const handleRemoveFeature = (featureToRemove: string) => {
    onChange(value.filter(feature => feature !== featureToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddFeature();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="e.g., AC, Beach View"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button type="button" onClick={handleAddFeature}>Add</Button>
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        {value.map((feature, index) => (
          <Badge key={index} variant="secondary" className="pl-3 pr-1 py-1 text-sm font-medium">
            {feature}
            <button
              type="button"
              onClick={() => handleRemoveFeature(feature)}
              className="ml-1.5 rounded-full p-0.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
              aria-label={`Remove ${feature}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
