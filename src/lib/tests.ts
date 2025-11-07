import path from 'path';
import { config } from '../config/app';
import { getForkManifest } from './manifest';
import { TestableEIP } from '../types';

/**
 * Get fork name from CLI arguments or default to current fork
 */
export function getForkName(): string {
  const args = process.argv.slice(2);
  const forkArg = args.find(arg => !arg.startsWith('--'));
  return forkArg || config.currentFork;
}

/**
 * Get list of testable EIPs (filtering out skipped ones) with computed paths
 */
export function getTestableEIPs(forkName: string): TestableEIP[] {
  const manifest = getForkManifest(forkName);
  const projectRoot = path.resolve(process.cwd());

  return manifest.eips
    .filter(eip => {
      if (eip.skip) {
        console.log(`⏭️  Skipping EIP-${eip.number} (marked as skip)`);
      }
      return !eip.skip;
    })
    .map(eip => ({
      fork: forkName,
      eipNumber: eip.number,
      eipMetadata: eip,
      paths: {
        resultsPath: path.join(projectRoot, 'src', 'data', 'forks', forkName, eip.number, 'results.json'),
        clientsPath: path.join(projectRoot, 'src', 'data', 'forks', forkName, eip.number, 'clients.yml'),
      }
    }));
}
