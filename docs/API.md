# Butterfly API Documentation

## Overview

The Butterfly API provides adoption statistics and test results for EIPs across Ethereum network upgrade forks.

## Base URL

```sh
BASE_URL=https://example.com/api
```

## Endpoints

### Get Fork Adoption Statistics

Returns adoption statistics for all EIPs within a network upgrade fork.

**Endpoint:** `GET /adoption/fork/:fork`

**Parameters:**

| Parameter | Type   | Description                   | Example        |
|-----------|--------|-------------------------------|----------------|
| `fork`    | string | Fork name                     | `glamsterdam`  |

**Example Requests:**

```bash
curl $BASE_URL/adoption/fork/glamsterdam
```

**Success Response (200 OK):**

```json
{
  "name": "Glamsterdam",
  "description": "Glamsterdam network upgrade fork",
  "summary": {
    "totalEIPs": 1,
    "averageScore": 85.5
  },
  "eips": [
    {
      "eip": "7928",
      "spec": "https://eips.ethereum.org/EIPS/eip-7928",
      "lastUpdated": "2025-10-21T09:48:37.869Z",
      "summary": {
        "totalClients": 5,
        "activeClients": 4,
        "totalTests": 46,
        "totalVariants": 120,
        "overallScore": 85.5
      },
      "clients": [
        {
          "name": "Geth",
          "version": "Geth/v1.16.6-unstable-0de169fd-20251017/linux-amd64/go1.24.9",
          "githubRepo": "https://github.com/ethereum/go-ethereum/tree/bal-devnet-0",
          "result": {
            "passed": 102,
            "failed": 5,
            "pending": 13,
            "total": 120,
            "score": 85.0
          }
        },
        ...
      ]
    }
  ]
}
```

**Error Response (404 Not Found):**

```json
{
  "error": "Fork not found",
  "fork": "unknown-fork"
}
```

**Response Headers:**

```sh
Content-Type: application/json
Cache-Control: public, max-age=300, s-maxage=3600
Access-Control-Allow-Origin: *
```

## Response Schema

### EIP Adoption Response

**Endpoint:** `/adoption/:eip`

| Field         | Type   | Description                                    |
|---------------|--------|------------------------------------------------|
| `eip`         | string | EIP number                                     |
| `spec`        | string | URL to EIP specification                       |
| `lastUpdated` | string | ISO 8601 timestamp of last update             |
| `summary`     | object | Overall statistics across all clients         |
| `clients`     | array  | Array of client implementations with results  |

### Fork Adoption Response

**Endpoint:** `/adoption/fork/:fork`

| Field         | Type   | Description                                    |
|---------------|--------|------------------------------------------------|
| `name`        | string | Human-readable fork name                       |
| `description` | string | Fork description                               |
| `summary`     | object | Fork-level statistics                          |
| `eips`        | array  | Array of EIP adoption data (same as EIP endpoint) |

### Fork Summary Object

| Field            | Type   | Description                                       |
|------------------|--------|---------------------------------------------------|
| `totalEIPs`      | number | Total number of EIPs in this fork                 |
| `averageScore`   | number | Average pass rate across all EIPs (0-100, EIPs without tests = 0%) |

### Summary Object

| Field            | Type   | Description                                       |
|------------------|--------|---------------------------------------------------|
| `totalClients`   | number | Total number of clients being tested             |
| `activeClients`  | number | Number of clients with test results              |
| `totalTests`     | number | Total number of test cases                       |
| `totalVariants`  | number | Total number of test variants across all tests   |
| `overallScore`   | number | Average pass rate across all clients (0-100)     |

### Client Object

| Field        | Type   | Description                                    |
|--------------|--------|------------------------------------------------|
| `name`       | string | Client implementation name                     |
| `version`    | string | Client version string                          |
| `githubRepo` | string | GitHub repository URL (optional)               |
| `result`     | object | Test results for this client                   |

### Result Object

| Field     | Type   | Description                                       |
|-----------|--------|---------------------------------------------------|
| `passed`  | number | Number of test variants that passed              |
| `failed`  | number | Number of test variants that failed              |
| `pending` | number | Number of test variants pending/not yet run      |
| `total`   | number | Total number of test variants                     |
| `score`   | number | Pass rate for this client (0-100)                |

## Caching

The API implements caching headers to optimize performance:

- **Client cache:** 5 minutes (`max-age=300`)
- **CDN/proxy cache:** 1 hour (`s-maxage=3600`)

## CORS

The API supports Cross-Origin Resource Sharing (CORS) with `Access-Control-Allow-Origin: *`, allowing requests from any origin.

## Currently Supported EIPs

- **EIP-7928** - Block Access Lists (BAL)

## Rate Limiting

Currently no rate limiting is implemented.

## Version

API Version: 1.0.0
