import { Test, Client, EIPMetadata } from "../types";
import { buildEIPAdoptionData, formatDate } from "../lib/utils";
import { config } from "../config/app";
import CountUp from "./ui/CountUp";
import Logo from "./Logo";

interface AdoptionSummaryProps {
  tests: Test[];
  clients: Client[];
  lastUpdated: string;
  eipMetadata?: EIPMetadata;
}

export default function AdoptionSummary({
  tests,
  clients,
  lastUpdated,
  eipMetadata,
}: AdoptionSummaryProps) {
  // Use shared utility function for consistency
  const adoptionData = buildEIPAdoptionData(
    eipMetadata?.number || "",
    eipMetadata?.spec || "",
    tests,
    lastUpdated,
    clients
  );

  // Extract version from EIP metadata's hive config
  const testVersion = eipMetadata?.hive?.buildArgs?.fixtures?.split("@")[1] || "unknown";

  return (
    <div className="rounded-2xl border border-white/30 dark:border-gray-500/40 bg-white/5 dark:bg-gray-900/10 backdrop-blur-xl shadow-2xl p-8">
      {/* Title Section */}
      <div className="text-center mb-6">
        <Logo size="large" />
        {eipMetadata && (
          <p className="text-base text-gray-700 dark:text-gray-300 mt-4">
            <a
              href={eipMetadata.spec}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lime-500 hover:text-lime-400 underline underline-offset-2"
            >
              EIP-{eipMetadata.number} {eipMetadata.title}
            </a>{" "}
            adoption tracker
          </p>
        )}
      </div>

      {/* Summary Statement */}
      <div className="text-center pt-6 border-t border-white/20 dark:border-gray-500/30">
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
          <span className="w-2 h-2 bg-lime-500 rounded-full animate-pulse shadow-sm"></span>
          As of {formatDate(lastUpdated)}, BAL is adopted by{" "}
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-lime-500/15 border border-lime-500/30 text-lime-600 dark:text-lime-400 font-bold min-w-[2ch]">
            <CountUp
              from={0}
              to={adoptionData.summary.activeClients}
              className="font-bold text-lime-600 dark:text-lime-400"
              duration={config.animations.duration}
              delay={config.animations.delay - 0.3}
            />
          </span>{" "}
          of{" "}
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-lime-500/15 border border-lime-500/30 text-lime-600 dark:text-lime-400 font-bold min-w-[2ch]">
            <CountUp
              from={0}
              to={adoptionData.summary.totalClients}
              className="font-bold text-lime-600 dark:text-lime-400"
              duration={config.animations.duration}
              delay={config.animations.delay - 0.1}
            />
          </span>{" "}
          clients. For test version{" "}
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-lime-500/15 border border-lime-500/30 text-lime-600 dark:text-lime-400 font-bold">
            {testVersion}
          </span>
          , the average pass rate is{" "}
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-lime-500/15 border border-lime-500/30 text-lime-600 dark:text-lime-400 font-bold min-w-[3ch]">
            <CountUp
              from={0}
              to={Math.round(adoptionData.summary.overallScore)}
              className="font-bold text-lime-600 dark:text-lime-400"
              duration={config.animations.duration}
              delay={config.animations.delay + 0.1}
            />
            %
          </span>
          .
        </p>
      </div>
    </div>
  );
}
