'use client';

import { UploadCloud, X } from 'lucide-react';
import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

type ImageUploaderProps = {
  value: (string | File)[];
  onChange: (files: (string | File)[]) => void;
  maxFiles?: number;
  className?: string;
  label?: string;
};

export function ImageUploader({ value, onChange, maxFiles = 1, className, label = 'Upload Images' }: ImageUploaderProps) {
  const { toast } = useToast();
  const [previews, setPreviews] = useState<(string)[]>([]);

  useEffect(() => {
    const newPreviews: string[] = [];
    if (value) {
        value.forEach(item => {
            if (typeof item === 'string') {
                newPreviews.push(item);
            } else if (item instanceof File) {
                newPreviews.push(URL.createObjectURL(item));
            }
        });
    }
    setPreviews(newPreviews);

    return () => {
      newPreviews.forEach(preview => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [value]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        fileRejections.forEach(({ errors }) => {
          errors.forEach(error => {
            toast({
              title: 'Upload Error',
              description: error.message,
              variant: 'destructive',
            });
          });
        });
        return;
      }
      
      const currentFiles = value || [];
      const newFiles = acceptedFiles.slice(0, maxFiles - currentFiles.length);
      onChange([...currentFiles, ...newFiles]);
    },
    [value, onChange, maxFiles, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.gif', '.jpg', '.webp'] },
    maxFiles,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: value && value.length >= maxFiles,
  });

  const removeFile = (index: number) => {
    const newFiles = [...(value || [])];
    newFiles.splice(index, 1);
    onChange(newFiles);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square w-full">
              <Image
                src={preview}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover rounded-md"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 rounded-full"
                onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index)
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove image</span>
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {(!value || value.length < maxFiles) && (
        <div
          {...getRootProps()}
          className={cn(
            'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-accent/50 transition-colors',
            isDragActive ? 'border-primary' : 'border-input'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              {label} (Max {maxFiles})
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
