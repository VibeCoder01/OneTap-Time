
// A simple, browser-based test runner inspired by Jest/Vitest.
// This is not a replacement for a full testing framework, but allows for basic unit tests.

export interface TestResult {
  suiteName: string;
  tests: {
    description: string;
    passed: boolean;
    error?: string;
  }[];
}

type TestFunction = () => void | Promise<void>;

const testState = {
  currentSuite: '',
  tests: [] as { description: string; fn: TestFunction }[],
};

// --- Test Definition Globals ---

export function describe(suiteName: string, fn: () => void) {
  testState.currentSuite = suiteName;
  fn();
}

export function it(description: string, fn: TestFunction) {
  testState.tests.push({ description, fn });
}

// --- Assertion Library ---

const expect = (actual: any) => ({
  toBe: (expected: any) => {
    if (actual !== expected) {
      throw new Error(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
    }
  },
  toEqual: (expected: any) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
    }
  },
  toBeDefined: () => {
    if (actual === undefined || actual === null) {
      throw new Error(`Expected value to be defined, but it was ${actual}`);
    }
  },
  toBeTruthy: () => {
    if (!actual) {
        throw new Error(`Expected ${actual} to be truthy.`);
    }
  },
  toBeFalsy: () => {
    if (actual) {
        throw new Error(`Expected ${actual} to be falsy.`);
    }
  },
  toHaveLength: (expected: number) => {
    if (!Array.isArray(actual) || actual.length !== expected) {
      throw new Error(`Expected array to have length ${expected}, but got ${Array.isArray(actual) ? actual.length : typeof actual}`);
    }
  },
});

(globalThis as any).expect = expect;


// --- Test Execution ---

export async function runTests(
  suiteName: string,
  testSetupFunction: () => void
): Promise<TestResult[]> {
  // Clear previous state
  testState.tests = [];
  testState.currentSuite = '';

  // Collect tests
  testSetupFunction();

  const results: TestResult = {
    suiteName: testState.currentSuite || suiteName,
    tests: [],
  };

  for (const test of testState.tests) {
    try {
      await test.fn();
      results.tests.push({
        description: test.description,
        passed: true,
      });
    } catch (e: any) {
      results.tests.push({
        description: test.description,
        passed: false,
        error: e.message || 'Unknown error',
      });
    }
  }

  return [results];
}
