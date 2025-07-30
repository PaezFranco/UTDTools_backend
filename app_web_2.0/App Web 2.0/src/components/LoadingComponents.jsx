// components/LoadingComponents.jsx
import React from 'react';
import { RefreshCw } from 'lucide-react';

export const TableSkeleton = () => {
  return (
    <div className="w-full">
      <div className="rounded-md border">
        <div className="border-b bg-muted/50 p-4">
          <div className="flex space-x-4">
            <div className="h-4 bg-muted-foreground/20 rounded w-20 animate-pulse"></div>
            <div className="h-4 bg-muted-foreground/20 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-muted-foreground/20 rounded w-24 animate-pulse"></div>
            <div className="h-4 bg-muted-foreground/20 rounded w-28 animate-pulse"></div>
            <div className="h-4 bg-muted-foreground/20 rounded w-16 animate-pulse"></div>
          </div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b p-4">
            <div className="flex space-x-4">
              <div className="h-4 bg-muted-foreground/10 rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-muted-foreground/10 rounded w-32 animate-pulse"></div>
              <div className="h-4 bg-muted-foreground/10 rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-muted-foreground/10 rounded w-28 animate-pulse"></div>
              <div className="h-4 bg-muted-foreground/10 rounded w-16 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LoadingSpinner = ({ message = "Cargando..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-2">
      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};

export const ButtonLoadingSpinner = ({ size = 4 }) => {
  return (
    <RefreshCw className={`h-${size} w-${size} animate-spin`} />
  );
};