import { ReactNode } from "react";

interface LoadingScreenProps {
  message?: string;
  children?: ReactNode;
}

function LoadingScreen({ message = "应用正在加载中...", children }: LoadingScreenProps) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-background to-secondary/20">
      <div className="text-center p-8 glass-effect rounded-lg shadow-lg max-w-sm animate-fade-in">
        <h1 className="text-3xl font-bold mb-6 gradient-text">Daily Record</h1>
        <p className="text-muted-foreground mb-4 text-lg">{message}</p>
        <div className="w-12 h-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
        {children}
      </div>
    </div>
  );
}

export default LoadingScreen;