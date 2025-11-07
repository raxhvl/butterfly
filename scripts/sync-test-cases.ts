#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { Test as TestCase } from '../src/types';
import { getForkName, getTestableEIPs } from '../src/lib/tests';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fetchMarkdown(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
      
    }).on('error', (err) => {
      reject(err);
    });
  });
}

interface TablePosition {
  headerIndex: number;
  separatorIndex: number;
}

function validateMarkdown(content: string): TablePosition {
  const lines = content.split('\n');
  
  // Find table header
  const headerIndex = lines.findIndex(line => 
    line.includes('Function Name') && 
    line.includes('Goal') && 
    line.includes('Setup') && 
    line.includes('Expectation') && 
    line.includes('Status')
  );
  
  if (headerIndex === -1) {
    throw new Error('Table header with required columns not found');
  }
  
  // Validate table structure
  const separatorIndex = headerIndex + 1;
  if (separatorIndex >= lines.length || !lines[separatorIndex].includes('---')) {
    throw new Error('Invalid table separator');
  }
  
  return { headerIndex, separatorIndex };
}


function parseMarkdownTable(content: string): TestCase[] {
  const { headerIndex, separatorIndex } = validateMarkdown(content);
  const lines = content.split('\n');
  
  const testCases = [];
  
  // Parse table rows
  for (let i = separatorIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();

    // Stop if we hit an empty line or non-table content
    if (!line || !line.startsWith('|')) {
      break;
    }

    // Replace escaped pipes with placeholder before splitting
    const processedLine = line.replace(/\\\|/g, '<!PIPE!>');
    const cells = processedLine.split('|').map(cell => cell.trim().replace(/<!PIPE!>/g, '|')).filter(cell => cell);
    
    if (cells.length >= 5) {
      const [functionName, goal, setup, expectation, status] = cells;
      
      // Validate required fields
      if (!functionName || !goal || !setup || !expectation || !status) {
        console.warn(`Skipping row with empty cells: ${line}`);
        continue;
      }
      
      // Clean up status
      const cleanStatus: 'completed' | 'planned' = status.toLowerCase().includes('completed') || status.includes('✅') ? 'completed' : 'planned';

      // Only include completed tests
      if (cleanStatus === 'completed') {
        testCases.push({
          id: functionName.replace(/`/g, ''),
          description: goal,
          setup,
          expectation,
          status: cleanStatus,
          variants: []
        });
      }
    }
  }
  
  return testCases;
}

interface TestResults {
  spec: string;
  lastUpdated: string;
  tests: TestCase[];
}

function mergeTestResults(existingData: TestResults, newTestCases: TestCase[]): TestResults {
  return {
    ...existingData,
    lastUpdated: new Date().toISOString(),
    tests: newTestCases
  };
}

async function main() {
  try {
    const forkName = getForkName();
    console.log(`🔄 Syncing test cases for fork: ${forkName}`);

    const testableEIPs = getTestableEIPs(forkName);

    if (testableEIPs.length === 0) {
      console.log('⚠️  No testable EIPs found');
      return;
    }

    console.log(`📋 Found ${testableEIPs.length} testable EIP(s)\n`);

    for (const eip of testableEIPs) {
      console.log(`\n🔄 Processing EIP-${eip.eipNumber}...`);

      if (!eip.eipMetadata.testCases) {
        console.log(`⚠️  No testCases URL for EIP-${eip.eipNumber}, skipping`);
        continue;
      }

      // Convert GitHub URL to raw URL
      const testCasesUrl = eip.eipMetadata.testCases
        .replace('github.com', 'raw.githubusercontent.com')
        .replace('/blob', '');

      console.log(`   Fetching from: ${testCasesUrl}`);
      const markdown = await fetchMarkdown(testCasesUrl);

      console.log('   Parsing test cases...');
      const testCases = parseMarkdownTable(markdown);
      console.log(`   ✅ Parsed ${testCases.length} test cases`);

      // Read existing data or create new structure
      let existingData;
      if (fs.existsSync(eip.paths.resultsPath)) {
        console.log('   Reading existing test results...');
        existingData = JSON.parse(fs.readFileSync(eip.paths.resultsPath, 'utf8'));
      } else {
        console.log('   Creating new test results file...');
        existingData = {
          spec: `${eip.eipMetadata.title} - EIP-${eip.eipNumber}`,
          lastUpdated: new Date().toISOString(),
          tests: []
        };
        // Ensure directory exists
        fs.mkdirSync(path.dirname(eip.paths.resultsPath), { recursive: true });
      }

      console.log('   Merging test cases...');
      const mergedData = mergeTestResults(existingData, testCases);

      console.log('   Writing updated test results...');
      fs.writeFileSync(eip.paths.resultsPath, JSON.stringify(mergedData, null, 2));

      console.log(`   ✅ EIP-${eip.eipNumber}: ${mergedData.tests.length} tests synced`);
    }

    console.log('\n🎉 All test cases synced successfully!');

  } catch (error) {
    console.error('❌ Error syncing test cases:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { fetchMarkdown, parseMarkdownTable, mergeTestResults };