import { ForkManifest, EIPMetadata, TestResults } from '../types';

export function getForkManifest(forkName: string): ForkManifest {
  try {
    const manifest = require(`../data/forks/${forkName}/manifest.json`);
    return manifest as ForkManifest;
  } catch (error) {
    throw new Error(`Fork ${forkName} not found`);
  }
}

export function getEIPMetadata(forkName: string, eipNumber: string): EIPMetadata | null {
  const manifest = getForkManifest(forkName);
  return manifest.eips.find(eip => eip.number === eipNumber) || null;
}

export function getEIPTestResults(forkName: string, eipNumber: string): TestResults {
  try {
    const results = require(`../data/forks/${forkName}/${eipNumber}/results.json`);
    return results as TestResults;
  } catch {
    throw new Error(`Test results not found for EIP ${eipNumber} in fork ${forkName}`);
  }
}

export function getAllEIPs(forkName: string): EIPMetadata[] {
  const manifest = getForkManifest(forkName);
  return manifest.eips;
}
