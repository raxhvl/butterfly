"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import DotGrid from "../../../components/DotGrid";
import TestResultsTable from "../../../components/TestResultsTable";
import TestCaseDetailModal from "../../../components/TestCaseDetailModal";
import Legend from "../../../components/Legend";
import AdoptionSummary from "../../../components/AdoptionSummary";
import { TestResults, Clients, Test, EIPMetadata } from "../../../types";
import { getEIPTestResults, getEIPMetadata } from "../../../lib/manifest";
import clientsData from "../../../data/clients.json";
import { Github } from "lucide-react";
import { config } from "../../../config/app";

function EIPContent() {
  const params = useParams();
  const fork = params.fork as string;
  const eip = params.eip as string;

  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [eipMetadata, setEipMetadata] = useState<EIPMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const clients = clientsData as Clients;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Load test results and metadata for this EIP
  useEffect(() => {
    try {
      const results = getEIPTestResults(fork, eip);
      const metadata = getEIPMetadata(fork, eip);
      setTestResults(results);
      setEipMetadata(metadata);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load test results:", error);
      setLoading(false);
    }
  }, [fork, eip]);

  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Open modal from URL parameter on mount
  useEffect(() => {
    if (!testResults) return;

    const testId = searchParams.get("test");
    if (testId) {
      const test = testResults.tests.find((t) => t.id === testId);
      if (test) {
        setSelectedTest(test);
        setIsModalOpen(true);
      }
    }
  }, [searchParams, testResults]);

  const handleTestClick = (test: Test) => {
    setSelectedTest(test);
    setIsModalOpen(true);
    // Update URL with test ID
    router.replace(`?test=${test.id}`, { scroll: false });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTest(null);
    // Remove test parameter from URL
    router.replace(`/${fork}/${eip}`, { scroll: false });
  };

  if (loading || !testResults) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-lime-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-mono relative">
      <div className="fixed inset-0 z-0">
        <DotGrid
          dotSize={5}
          gap={18}
          baseColor="#271E37"
          activeColor="#84cc16"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
          className="w-full h-full"
        />
      </div>
      {/* Content overlay */}
      <div className="relative z-10 max-w-7xl mx-auto p-4 space-y-6">
        <AdoptionSummary
          tests={testResults.tests}
          clients={clients}
          lastUpdated={testResults.lastUpdated}
          eipMetadata={eipMetadata || undefined}
        />

        <Legend />

        <TestResultsTable
          tests={testResults.tests}
          clients={clients}
          onTestClick={handleTestClick}
        />

        <TestCaseDetailModal
          test={selectedTest}
          clients={clients}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
        {/* Contribute link */}
        {eipMetadata?.testCases && (
          <div className="flex justify-center m-6">
            <a
              href={eipMetadata.testCases}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 dark:bg-gray-800/20 border border-white/30 dark:border-gray-500/40 text-lime-500 hover:text-lime-400 hover:bg-white/15 dark:hover:bg-gray-800/30 transition-all duration-200 backdrop-blur-md group"
            >
              <Github
                size={16}
                className="group-hover:scale-110 transition-transform duration-200"
              />
              <span className="font-mono text-sm">Propose more test cases</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EIPPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-white dark:bg-gray-950" />}
    >
      <EIPContent />
    </Suspense>
  );
}
