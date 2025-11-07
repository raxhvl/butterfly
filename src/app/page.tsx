"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DotGrid from "../components/DotGrid";
import CountUp from "../components/ui/CountUp";
import ProgressBanner from "../components/ProgressBanner";
import Logo from "../components/Logo";
import { getForkManifest } from "../lib/manifest";
import { EIPMetadata } from "../types";
import { config } from "../config/app";
import { buildForkAdoptionData } from "../lib/utils";
import clientsData from "../data/clients.json";

export default function Home() {
  const [manifest, setManifest] = useState<{
    name: string;
    description: string;
    banner: string;
    eips: EIPMetadata[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [forkProgress, setForkProgress] = useState(0);
  const [eipProgresses, setEipProgresses] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const data = getForkManifest(config.currentFork);
      setManifest(data);

      // Calculate fork progress using shared utility
      const { eipAdoptions, summary } = buildForkAdoptionData(
        config.currentFork,
        data.eips,
        clientsData
      );
      setForkProgress(Math.round(summary.averageScore));

      // Store individual EIP progress scores
      const progresses: Record<string, number> = {};
      eipAdoptions.forEach((eip) => {
        progresses[eip.eip] = Math.round(eip.summary.overallScore);
      });
      setEipProgresses(progresses);

      setLoading(false);
    } catch (error) {
      console.error("Failed to load fork manifest:", error);
      setLoading(false);
    }
  }, []);

  if (loading || !manifest) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-lime-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-mono relative overflow-hidden">
      {/* Background */}
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

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center pt-2">
          <Logo size="large" />
        </div>

        {/* Hero Section - City Silhouette */}
        <div className="rounded-2xl border border-white/30 dark:border-gray-500/40 bg-white/5 dark:bg-gray-900/10 backdrop-blur-xl shadow-2xl p-6 sm:p-8 md:p-12 overflow-hidden">
          {/* Fork Title */}
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold">
              <span className="text-gray-900 dark:text-gray-100">
                {manifest.name}
              </span>
            </h2>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-600 mt-3 italic">
              🚧 Work in progress
            </p>
          </div>

          {/* City Silhouette Progress - Split View */}
          <div className="mb-6 md:mb-8">
            <ProgressBanner
              src={manifest.banner}
              alt={`${manifest.name} Banner`}
              progress={forkProgress}
              className="h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg"
              animationDuration={config.animations.duration}
              animationDelay={config.animations.delay}
            />
          </div>

          {/* Conversational Summary */}
          <div className="text-center pt-6 border-t border-white/20 dark:border-gray-500/30">
            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              The {manifest.name} fork includes{" "}
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-lime-500/15 border border-lime-500/30 text-lime-600 dark:text-lime-400 font-bold">
                <CountUp
                  from={0}
                  to={manifest.eips.length}
                  duration={config.animations.duration}
                  delay={config.animations.delay - 0.2}
                />
              </span>{" "}
              {manifest.eips.length === 1 ? "EIP" : "EIPs"} and is currently{" "}
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-lime-500/15 border border-lime-500/30 text-lime-600 dark:text-lime-400 font-bold min-w-[3ch]">
                <CountUp from={0} to={forkProgress} duration={config.animations.duration} delay={config.animations.delay} />%
              </span>{" "}
              complete across 5 clients.
            </p>
          </div>
        </div>

        {/* EIP List Table */}
        <div className="rounded-2xl border border-white/30 dark:border-gray-500/40 bg-white/5 dark:bg-gray-900/10 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/20 dark:border-gray-500/30">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              EIPs
            </h2>
          </div>
          <div className="divide-y divide-white/20 dark:divide-gray-500/30">
            {manifest.eips.map((eip) => (
              <Link
                key={eip.number}
                href={`/${config.currentFork}/${eip.number}`}
                className="group block hover:bg-white/10 dark:hover:bg-gray-900/20 transition-colors duration-200"
              >
                <div className="px-6 py-5 flex items-center gap-6">
                  {/* EIP Badge */}
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-lime-500/20 border border-lime-500/40 text-lime-600 dark:text-lime-400 font-bold text-sm">
                      EIP-{eip.number}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-lime-500 transition-colors">
                      {eip.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                      {eip.description}
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="flex-shrink-0 w-32 hidden sm:block">
                    {(() => {
                      const progress = eipProgresses[eip.number] || 0;
                      return (
                        <>
                          <div className="text-xs text-gray-500 dark:text-gray-500 mb-1 text-right">
                            {progress}%
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-lime-500 rounded-full transition-all duration-1000"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0">
                    <span className="text-gray-400 group-hover:text-lime-500 transition-colors">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
