#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { exec, spawn } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { config } from "../src/config/app";
import { parseHiveResults } from "./parse-hive-results";
import { Simulation } from "../src/config/app";
import { getForkName, getTestableEIPs } from "../src/lib/tests";
import { TestableEIP } from "../src/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execAsync = promisify(exec);
const HIVE_REPO_PATH = process.env.HIVE_REPO_PATH || "/tmp/hive";

/**
 * Verifies that Hive CLI is installed and accessible
 */
async function verifyHiveInstallation() {
	try {
		await execAsync("./hive --cleanup", { cwd: HIVE_REPO_PATH });
	} catch (error: any) {
		throw new Error(
			`❌ Hive CLI not found. Please install Hive first [error: ${error.message}]`,
		);
	}
}

/**
 * Clears the .hive directory to ensure clean test runs
 */
async function clearHiveDirectory(eipNumber?: string) {
	const hiveResultsPath = path.resolve(__dirname, `../${config.hive.outputDir}`);

	if (eipNumber) {
		console.log(`🧹 Clearing hive results for EIP-${eipNumber}...`);
		const eipPath = path.join(hiveResultsPath, eipNumber);
		if (fs.existsSync(eipPath)) {
			fs.rmSync(eipPath, { recursive: true, force: true });
		}
	} else {
		console.log("🧹 Clearing hive results directory...");
		if (fs.existsSync(hiveResultsPath)) {
			fs.rmSync(hiveResultsPath, { recursive: true, force: true });
		}
		fs.mkdirSync(hiveResultsPath, { recursive: true });
	}
}

/**
 * Runs a single Hive simulation with configured clients and test filters
 * Results are output to the .hive directory in the web folder
 */
async function runHiveSimulation(
	simulation: Simulation,
	eipNumber: string,
	clientsPath: string,
	hiveConfig: { buildArgs: { fixtures: string; branch: string }; testFilter: string }
) {
	const hiveResultsPath = path.resolve(__dirname, `../${config.hive.outputDir}`, eipNumber, simulation);

	// Create simulation-specific directory
	fs.mkdirSync(hiveResultsPath, { recursive: true });

	const hiveArgs = [
		"--sim", simulation,
		`--client-file=${clientsPath}`,
		"--sim.buildarg", `fixtures=${hiveConfig.buildArgs.fixtures}`,
		"--sim.buildarg", `branch=${hiveConfig.buildArgs.branch}`,
		"--docker.output",
		"--results-root", hiveResultsPath,
		"--sim.limit", hiveConfig.testFilter,
		"--sim.parallelism", config.hive.parallelism.toString(),
	];

	console.log(`   🚀 Running Hive simulation: ${simulation}`);
	console.log(`   Command: ./hive ${hiveArgs.join(" ")}`);

	return new Promise<void>((resolve) => {
		const child = spawn("./hive", hiveArgs, {
			cwd: HIVE_REPO_PATH,
			stdio: ['ignore', 'pipe', 'pipe'],
		});

		// Ring buffer to keep last 50 lines
		const ringBuffer: string[] = [];
		const BUFFER_SIZE = 50;

		const addLine = (line: string) => {
			if (line.trim()) {
				ringBuffer.push(line);
				if (ringBuffer.length > BUFFER_SIZE) {
					ringBuffer.shift();
				}
			}
		};

		child.stdout?.on('data', (data) => {
			data.toString().split('\n').forEach(addLine);
		});

		child.stderr?.on('data', (data) => {
			data.toString().split('\n').forEach(addLine);
		});

		child.on('error', (error) => {
			console.error(`❌ Error running Hive Simulation ${simulation}: ${error.message}`);
			if (ringBuffer.length > 0) {
				console.error(`Last ${ringBuffer.length} lines of output:`);
				console.error(ringBuffer.join('\n'));
			}
			resolve(); // Continue execution
		});

		child.on('close', (code) => {
			if (code !== 0) {
				console.error(`❌ Hive Simulation ${simulation} exited with code ${code}`);
				if (ringBuffer.length > 0) {
					console.error(`Last ${ringBuffer.length} lines of output:`);
					console.error(ringBuffer.join('\n'));
				}
			}
			resolve(); // Continue execution regardless of exit code
		});
	});
}

/**
 * Runs all configured Hive simulations sequentially and parses results after each
 */
async function runAllSimulations(forkName: string, testableEIPs: TestableEIP[]) {
	await clearHiveDirectory();

	for (const eip of testableEIPs) {
		console.log(`\n📦 Processing EIP-${eip.eipNumber}...`);

		for (const simulation of Object.values(Simulation)) {
			try {
				console.log(`\n   🔄 Starting simulation: ${simulation}`);
				await runHiveSimulation(
					simulation,
					eip.eipNumber,
					eip.paths.clientsPath,
					eip.eipMetadata.hive
				);
				await parseHiveResults(simulation, forkName, eip.eipNumber);
				console.log(`   ✅ Completed simulation: ${simulation}`);
			} catch (error) {
				console.error(`   ❌ Failed to run simulation ${simulation}:`, error);
				throw error;
			}
		}

		console.log(`\n✅ Completed all simulations for EIP-${eip.eipNumber}`);
	}
}

/**
 * Main execution function - verifies Hive installation and runs all simulations
 */
async function main() {
	try {
		const forkName = getForkName();
		console.log(`🔄 Starting Hive integration test runner for fork: ${forkName}`);

		const testableEIPs = getTestableEIPs(forkName);

		if (testableEIPs.length === 0) {
			console.log('⚠️  No testable EIPs found');
			return;
		}

		console.log(`📋 Found ${testableEIPs.length} testable EIP(s)`);

		await verifyHiveInstallation();
		await runAllSimulations(forkName, testableEIPs);
		console.log("\n✅ Integration test runner completed successfully");
	} catch (error: any) {
		console.error(error.message);
		process.exit(1);
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}
