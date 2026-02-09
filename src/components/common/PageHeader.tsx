import { useAuth } from "@/hooks/useAuth";
import React from "react";

// PageHeader component with action support
interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  children,
  action,
}) => {
  const { isViewer } = useAuth();
  return (
    <div className="flex text-primary flex-col gap-4 sm:pb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {!isViewer && (action || children) && (
          <div className="flex items-center gap-2">
            {action}
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
