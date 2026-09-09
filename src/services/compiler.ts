import type { CompileResult, ExerciseMode } from '../types/exercise';

const PLAYGROUND_URL = 'https://play.rust-lang.org/execute';

export async function executeRustCode(code: string, mode: ExerciseMode): Promise<CompileResult> {
  const startTime = performance.now();
  const isTestMode = mode === 'test' || code.includes('#[test]');

  // Check if running in local dev environment with local compiler plugin
  const isLocalHost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (isLocalHost) {
    try {
      const localResp = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, isTest: isTestMode }),
      });

      if (localResp.ok) {
        const data = await localResp.json();
        const duration = Math.round(performance.now() - startTime);
        let passed = Boolean(data.success);

        if (isTestMode) {
          const combined = `${data.stdout || ''} ${data.stderr || ''}`;
          if (combined.includes('FAILED') || (combined.includes('0 passed; 0 failed') && code.includes('#[test]'))) {
            passed = false;
          }
          if (combined.includes('test result: ok')) {
            passed = true;
          }
        }

        return {
          success: passed,
          stdout: data.stdout || '',
          stderr: data.stderr || '',
          exitDetail: data.exitDetail || (passed ? 'Exited with code 0' : 'Execution failed'),
          executionTimeMs: duration,
        };
      }
    } catch {
      // If local compiler endpoint is unreachable or in preview/production mode, fallback to playground API
    }
  }

  // Fallback to official Rust Playground API
  try {
    const response = await fetch(PLAYGROUND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: 'stable',
        mode: 'debug',
        edition: '2024',
        crateType: 'bin',
        tests: isTestMode,
        code: code,
        backtrace: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Compiler server returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const duration = Math.round(performance.now() - startTime);

    let passed = Boolean(data.success);
    if (isTestMode) {
      const combined = `${data.stdout || ''} ${data.stderr || ''}`;
      if (combined.includes('FAILED')) {
        passed = false;
      }
      if (combined.includes('0 passed; 0 failed') && code.includes('#[test]')) {
        passed = false;
      }
      if (combined.includes('test result: ok')) {
        passed = true;
      }
    }

    return {
      success: passed,
      stdout: data.stdout || '',
      stderr: data.stderr || '',
      exitDetail: data.exitDetail || (passed ? 'Exited with code 0' : 'Compilation / Test failed'),
      executionTimeMs: duration,
    };
  } catch (err: any) {
    const duration = Math.round(performance.now() - startTime);
    return {
      success: false,
      stdout: '',
      stderr: `Network or Server Error: ${err?.message || 'Failed to connect to Rust Playground compiler.'}\nCheck your internet connection.`,
      exitDetail: 'Connection Failed',
      executionTimeMs: duration,
    };
  }
}
