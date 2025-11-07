# Butterfly

A web application that tracks EIP adoption and implementation status across Ethereum network upgrade forks. It provides visual dashboards showing which test cases pass, fail, or are pending for each Ethereum execution client implementation.

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Build Tool**: Next.js built-in bundler
- **Deployment**: Static site generation ready

## Quick Start

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start development server**:

   ```bash
   npm run dev
   ```

3. **Build for production**:

   ```bash
   npm run build
   ```

## Architecture

### Fork-Based Structure

Butterfly organizes EIPs by network upgrade forks:

```
src/data/forks/
└── glamsterdam/          # Fork name
    ├── manifest.json     # Fork metadata with EIP list
    ├── 7928/            # EIP-specific data
    │   ├── results.json # Test results
    │   └── clients.yml  # Hive client config
    └── 7805/
        ├── results.json
        └── clients.yml
```

### Adding a New Fork

1. Create fork directory: `src/data/forks/{fork-name}/`
2. Create `manifest.json` with fork metadata and EIP list
3. For each EIP, create `{eip-number}/results.json` and `clients.yml`

### Adding a New EIP to a Fork

Update the fork's `manifest.json`:

```json
{
  "eips": [
    {
      "number": "7928",
      "title": "Block Access Lists",
      "description": "EIP description",
      "spec": "https://eips.ethereum.org/EIPS/eip-7928",
      "testCases": "https://github.com/.../test_cases.md",
      "skip": false,
      "hive": {
        "buildArgs": {
          "fixtures": "bal@v1.3.0",
          "branch": "eips/amsterdam/eip-7928"
        },
        "testFilter": "id:tests/amsterdam/eip7928_block_level_access_lists"
      }
    }
  ]
}
```

## Test Management

### Syncing Test Cases

Sync test cases from the Ethereum Execution Spec Tests repository:

```bash
# Sync current fork (glamsterdam)
npm run test:sync

# Sync specific fork
npm run test:sync otherfork
```

This fetches the latest test specifications and updates `results.json` for each EIP.

### Running Integration Tests

Run Hive integration tests across all clients:

```bash
# Run tests for current fork
npm run test:run

# Run tests for specific fork
npm run test:run otherfork
```

### Complete Test Suite

```bash
# Sync + Run tests
npm test
```

## Configuration

Application settings in `src/config/app.ts`:

- **currentFork**: Default fork to use
- **hive.parallelism**: Number of parallel Hive tests
- **api.cache**: API caching settings

## Project Structure

```
src/
├── app/                      # Next.js app router
│   ├── page.tsx             # Homepage (fork overview)
│   ├── [fork]/[eip]/        # EIP detail pages
│   └── api/                 # API routes
├── components/              # React components
├── config/                  # Configuration
├── data/
│   ├── clients.json        # Shared client metadata
│   └── forks/              # Fork-specific data
│       └── glamsterdam/
│           ├── manifest.json
│           └── {eip}/
│               ├── results.json
│               └── clients.yml
├── lib/                     # Utilities
│   ├── manifest.ts         # Fork/EIP loaders
│   ├── tests.ts            # Test utilities
│   └── utils.ts            # General utilities
└── types/                   # TypeScript types

scripts/
├── sync-test-cases.ts       # Sync test specs
├── run-integration-tests.ts # Run Hive tests
└── parse-hive-results.ts    # Process Hive output
```

## Development

### Adding New Clients

1. Update `src/data/clients.json` with client metadata
2. Add client logo to `public/img/logos/`
3. Add client to EIP-specific `clients.yml` files

## Contributing

1. **Test Cases**: Contribute new test cases via the [Ethereum Execution Spec Tests repository](https://github.com/ethereum/execution-spec-tests)
2. **Implementation Results**: Update client implementation status by modifying test results
3. **Features**: Submit pull requests for new features or improvements

## Attributions

- Amsterdam skyline by [Freepik](https://www.freepik.com/free-vector/panorama-city-skyscrapers-bridge-sky-background-day-night_11332526.htm)
- Pixel loading effect by [Codrops](https://github.com/codrops/ImagePixelLoading)
