import { Simulation } from "../config/app";

export type Status = "pass" | "fail" | "pending";

export interface Result {
  simulation: Simulation;
  status: Status;
}

export interface TestVariant {
  parameters?: string[];
  results: Record<string, Result[]>;
}

export interface Test {
  id: string;
  description: string;
  setup: string;
  expectation: string;
  status: "completed" | "planned";
  variants: TestVariant[];
}

export interface Client {
  id: string;
  name: string;
  hiveName: string;
  language: string;
  website: string;
  logo?: string;
  repo?: string;
  version: string;
  githubRepo?: string;
}

export interface TestResults {
  spec: string;
  lastUpdated: string;
  tests: Test[];
}

export type Clients = Client[];

export interface HiveConfig {
  buildArgs: {
    fixtures: string;
    branch: string;
  };
  testFilter: string;
}

export interface EIPMetadata {
  number: string;
  title: string;
  description: string;
  spec: string;
  testCases: string;
  skip: boolean;
  hive: HiveConfig;
}

export interface ForkManifest {
  name: string;
  description: string;
  banner: string;
  eips: EIPMetadata[];
}

// Adoption Data Types
export interface ClientAdoptionResult {
  passed: number;
  failed: number;
  pending: number;
  total: number;
  score: number;
}

export interface ClientAdoption {
  name: string;
  version: string;
  githubRepo?: string;
  result: ClientAdoptionResult;
}

export interface AdoptionSummary {
  totalClients: number;
  activeClients: number;
  totalTests: number;
  totalVariants: number;
  overallScore: number;
}

export interface EIPAdoption {
  eip: string;
  spec: string;
  lastUpdated: string;
  summary: AdoptionSummary;
  clients: ClientAdoption[];
}

export interface ForkAdoptionSummary {
  totalEIPs: number;
  averageScore: number;
}

export interface ForkAdoption {
  name: string;
  description: string;
  summary: ForkAdoptionSummary;
  eips: EIPAdoption[];
}

// Test Utilities Types
export interface TestableEIP {
  fork: string;
  eipNumber: string;
  eipMetadata: EIPMetadata;
  paths: {
    resultsPath: string;
    clientsPath: string;
  };
}