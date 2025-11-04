import { useEffect } from "react";

export function useAdminTitle(pageName: string) {
  useEffect(() => {
    document.title = `Admin - ${pageName}`;
    
    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = "Admin";
    };
  }, [pageName]);
}

