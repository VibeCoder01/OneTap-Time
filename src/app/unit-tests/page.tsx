"use client";

import React, { useState, useEffect } from 'react';
import { runTests, TestResult } from '@/lib/test-runner';
import { runAppContextTests } from '@/tests/context.test';
import { runUtilsTests } from '@/tests/utils.test';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Header from '@/components/header';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function UnitTestsPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isTesting, setIsTesting] = useState(true);

  useEffect(() => {
    const run = async () => {
      setIsTesting(true);
      // Run all test suites here
      const appContextResults = await runTests('App Context Logic', runAppContextTests);
      const utilsResults = await runTests('Utils Library', runUtilsTests);
      setResults([...appContextResults, ...utilsResults]);
      setIsTesting(false);
    };
    run();
  }, []);

  const totalTests = results.reduce((acc, suite) => acc + suite.tests.length, 0);
  const passedTests = results.reduce((acc, suite) => acc + suite.tests.filter(t => t.passed).length, 0);
  const failedTests = totalTests - passedTests;

  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-6 lg:p-8 space-y-8">
       <div className="w-full max-w-4xl">
        <Header />
        <Button asChild variant="link" className="p-0 h-auto mt-2">
            <Link href="/">&larr; Back to App</Link>
        </Button>
      </div>

      <main className="w-full max-w-4xl mx-auto space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Unit Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {isTesting ? (
              <p>Running tests...</p>
            ) : (
              <>
                <div className="flex gap-8 mb-6 p-4 bg-muted/50 rounded-lg">
                    <div><span className="font-bold">Total Suites:</span> {results.length}</div>
                    <div><span className="font-bold">Total Tests:</span> {totalTests}</div>
                    <div className="text-green-600"><span className="font-bold">Passed:</span> {passedTests}</div>
                    <div className="text-red-600"><span className="font-bold">Failed:</span> {failedTests}</div>
                </div>

                <div className="space-y-6">
                  {results.map((suite, i) => (
                    <div key={i}>
                      <h3 className="text-xl font-semibold mb-2">{suite.suiteName}</h3>
                      <div className="space-y-2 border-l-2 pl-4">
                        {suite.tests.map((test, j) => (
                          <div key={j} className="flex items-start gap-3">
                            {test.passed ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                            )}
                            <div className='flex-grow'>
                                <p className={cn("font-medium", { 'text-destructive': !test.passed })}>{test.description}</p>
                                {!test.passed && (
                                    <div className="mt-1 p-2 bg-red-50 border border-red-200 text-destructive text-sm rounded-md">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0"/>
                                            <pre className="whitespace-pre-wrap font-mono text-xs">{test.error}</pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
