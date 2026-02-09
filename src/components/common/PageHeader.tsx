import { getCookie } from "@/lib/getCookie";
import React, { useMemo } from "react";

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
  const isViewer = useMemo(() => {
    try {
      const cookie = getCookie("userData");
      if (!cookie) return false;

      const user = JSON.parse(cookie);
      return user?.role === "viewer";
    } catch (err) {
      console.error("Failed to parse userData cookie", err);
      return false;
    }
  }, []);

  console.log("is Viewer: ", isViewer);

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
