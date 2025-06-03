
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-2">
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            Built with <Heart className="h-4 w-4 text-red-500 fill-current animate-pulse" /> by{" "}
            <a 
              href="https://twitter.com/xtestnet" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium transition-colors underline underline-offset-2"
            >
              @xtestnet
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            © 2025 Drosera Trap Simulator. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
