import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { hardReloadOnce, isAdminLikePath, resolveAdminPath } from "@/lib/emergency-route-recovery";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    const resolvedPath = resolveAdminPath(location.pathname);

    if (isAdminLikePath(resolvedPath)) {
      void hardReloadOnce("not-found-admin", resolvedPath, location.search, location.hash);
      return;
    }

    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.hash, location.pathname, location.search]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
