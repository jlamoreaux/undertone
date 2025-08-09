// Error monitoring utility to capture and log runtime errors
interface ErrorLog {
  timestamp: string;
  type: 'console-error' | 'unhandled-rejection' | 'network-error' | 'react-error';
  message: string;
  stack?: string;
  url?: string;
  status?: number;
  details?: any;
}

class ErrorMonitor {
  private errors: ErrorLog[] = [];
  private originalConsoleError: typeof console.error;
  private originalFetch: typeof fetch | undefined;

  constructor() {
    this.originalConsoleError = console.error;
    // Only access window.fetch in browser environment
    if (typeof window !== 'undefined') {
      this.originalFetch = window.fetch;
    }
  }

  start() {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Intercept console.error
    console.error = (...args) => {
      const error = args[0];
      const errorLog: ErrorLog = {
        timestamp: new Date().toISOString(),
        type: 'console-error',
        message: typeof error === 'string' ? error : error?.message || 'Unknown error',
        stack: error?.stack,
        details: args.length > 1 ? args.slice(1) : undefined
      };

      // Check for specific error patterns
      const errorString = JSON.stringify(args);
      if (errorString.includes('supabase') || errorString.includes('Supabase')) {
        console.warn('🚨 SUPABASE ERROR DETECTED:', errorLog);
        this.errors.push(errorLog);
      } else if (errorString.includes('context') || errorString.includes('Context')) {
        console.warn('🚨 REACT CONTEXT ERROR DETECTED:', errorLog);
        this.errors.push(errorLog);
      } else {
        this.errors.push(errorLog);
      }

      // Call original console.error
      this.originalConsoleError.apply(console, args);
    };

    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const errorLog: ErrorLog = {
        timestamp: new Date().toISOString(),
        type: 'unhandled-rejection',
        message: event.reason?.message || event.reason || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        details: event.reason
      };
      
      console.warn('🚨 UNHANDLED PROMISE REJECTION:', errorLog);
      this.errors.push(errorLog);
    });

    // Intercept fetch to monitor network errors
    if (this.originalFetch) {
      window.fetch = async (...args) => {
        const [url, options] = args;
        const urlString = typeof url === 'string' ? url : url.toString();
        
        try {
          const response = await this.originalFetch!.apply(window, args);
          
          // Check for Supabase-related requests
          if (urlString.includes('supabase.co')) {
            // Check for CORS or auth errors
            if (response.status === 401 || response.status === 403) {
              const errorLog: ErrorLog = {
                timestamp: new Date().toISOString(),
                type: 'network-error',
                message: `Auth error on Supabase request: ${response.status} ${response.statusText}`,
                url: urlString,
                status: response.status
              };
              console.warn(`🚨 SUPABASE ${response.status} ERROR:`, errorLog);
              this.errors.push(errorLog);
            }
            
            // Log successful Supabase requests for debugging
            if (response.ok) {
              console.log(`✅ Supabase request successful: ${urlString}`);
            }
          }
          
          return response;
        } catch (error) {
          // Check if it's a CORS error
          if (urlString.includes('supabase.co')) {
            const errorLog: ErrorLog = {
              timestamp: new Date().toISOString(),
              type: 'network-error',
              message: `Network/CORS error on Supabase request: ${error}`,
              url: urlString,
              stack: (error as Error)?.stack,
              details: error
            };
            console.warn('🚨 SUPABASE NETWORK/CORS ERROR:', errorLog);
            this.errors.push(errorLog);
          }
          throw error;
        }
      };
    }

    console.log('🔍 Error monitoring started. Watching for Supabase, React Context, and network errors...');
  }

  getErrors(): ErrorLog[] {
    return this.errors;
  }

  getErrorSummary(): string {
    if (this.errors.length === 0) {
      return 'No errors detected';
    }

    const summary: string[] = ['=== ERROR SUMMARY ==='];
    const supabaseErrors = this.errors.filter(e => 
      e.message.toLowerCase().includes('supabase') || e.url?.includes('supabase.co')
    );
    const contextErrors = this.errors.filter(e => 
      e.message.toLowerCase().includes('context')
    );
    const unhandledRejections = this.errors.filter(e => 
      e.type === 'unhandled-rejection'
    );
    const corsErrors = this.errors.filter(e => 
      e.message.toLowerCase().includes('cors')
    );
    const authErrors = this.errors.filter(e => 
      e.status === 401 || e.status === 403
    );

    if (supabaseErrors.length > 0) {
      summary.push(`\n📍 Supabase Errors (${supabaseErrors.length}):`);
      supabaseErrors.forEach(e => {
        summary.push(`  - ${e.message}`);
        if (e.stack) summary.push(`    Stack: ${e.stack.split('\n')[1]?.trim()}`);
      });
    }

    if (contextErrors.length > 0) {
      summary.push(`\n📍 React Context Errors (${contextErrors.length}):`);
      contextErrors.forEach(e => {
        summary.push(`  - ${e.message}`);
        if (e.stack) summary.push(`    Stack: ${e.stack.split('\n')[1]?.trim()}`);
      });
    }

    if (unhandledRejections.length > 0) {
      summary.push(`\n📍 Unhandled Promise Rejections (${unhandledRejections.length}):`);
      unhandledRejections.forEach(e => {
        summary.push(`  - ${e.message}`);
        if (e.stack) summary.push(`    Stack: ${e.stack.split('\n')[1]?.trim()}`);
      });
    }

    if (corsErrors.length > 0) {
      summary.push(`\n📍 CORS Errors (${corsErrors.length}):`);
      corsErrors.forEach(e => {
        summary.push(`  - ${e.url}: ${e.message}`);
      });
    }

    if (authErrors.length > 0) {
      summary.push(`\n📍 401/403 Auth Errors (${authErrors.length}):`);
      authErrors.forEach(e => {
        summary.push(`  - ${e.url}: ${e.message}`);
      });
    }

    summary.push('\n=== END ERROR SUMMARY ===');
    return summary.join('\n');
  }

  exportErrors(): void {
    const blob = new Blob([JSON.stringify(this.errors, null, 2)], 
      { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-log-${new Date().toISOString()}.json`;
    a.click();
  }
}

// Create and export a singleton instance
export const errorMonitor = new ErrorMonitor();

// Add to window for easy access in browser console
if (typeof window !== 'undefined') {
  (window as any).errorMonitor = errorMonitor;
  (window as any).getErrorSummary = () => {
    console.log(errorMonitor.getErrorSummary());
    return errorMonitor.getErrors();
  };
}
