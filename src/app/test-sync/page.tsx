"use client";

import { useState, useEffect } from "react";
import { testSyncService } from "@/test-sync-service";
import { supabase } from "@/lib/supabase";

export default function TestSyncPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication status
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    setIsAuthenticated(!!user);
  };

  const runTest = async () => {
    setIsRunning(true);
    setLogs([]);

    // Capture console.log output
    // eslint-disable-next-line no-console
    const originalLog = console.log;
    const logMessages: string[] = [];

    // eslint-disable-next-line no-console, @typescript-eslint/no-explicit-any
    console.log = (...args: any[]) => {
      const message = args.map(arg =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(" ");
      logMessages.push(message);
      setLogs([...logMessages]);
      originalLog(...args);
    };

    try {
      await testSyncService();
    } catch (error) {

    } finally {
      // Restore original console.log
      // eslint-disable-next-line no-console
      console.log = originalLog;
      setIsRunning(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>SyncService Integration Test</h1>

      {isAuthenticated === null && (
        <p>Checking authentication...</p>
      )}

      {isAuthenticated === false && (
        <div style={{
          padding: "20px",
          backgroundColor: "#ffebcd",
          borderRadius: "5px",
          marginBottom: "20px"
        }}>
          <p>⚠️ You need to be logged in to run this test.</p>
          <p>Please log in first and then refresh this page.</p>
        </div>
      )}

      {isAuthenticated === true && (
        <>
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={runTest}
              disabled={isRunning}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: isRunning ? "#ccc" : "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: isRunning ? "not-allowed" : "pointer"
              }}
            >
              {isRunning ? "Running Test..." : "Run SyncService Test"}
            </button>
          </div>

          <div style={{
            backgroundColor: "#1e1e1e",
            color: "#d4d4d4",
            padding: "20px",
            borderRadius: "5px",
            maxHeight: "600px",
            overflowY: "auto",
            whiteSpace: "pre-wrap",
            fontSize: "14px"
          }}>
            {logs.length === 0 ? (
              <p style={{ color: "#666" }}>Test output will appear here...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} style={{ marginBottom: "5px" }}>
                  {log}
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
            <p>This test will:</p>
            <ul>
              <li>Check authentication status</li>
              <li>Seed local storage with test data</li>
              <li>Call performTwoWaySync() method</li>
              <li>Query and log Supabase reading_progress data</li>
              <li>Test upsert operations</li>
              <li>Verify sync completion</li>
            </ul>
            <p>After running, check your Supabase dashboard to verify the data.</p>
          </div>
        </>
      )}
    </div>
  );
}
