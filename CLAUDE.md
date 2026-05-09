# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Audius is a decentralized, community-owned music-sharing protocol. This is a monorepo containing:

- Web and desktop applications (React + Vite)
- Backend services (Discovery Provider, Content Node)
- Blockchain smart contracts (Ethereum and Solana)
- SDK and common libraries

## Common Development Commands

### Essential Commands

Only run these commands in the directories related to the changes being made. Do not run in root unless needed.

```bash
# Install dependencies and setup development environment
npm install

# Run the protocol stack locally (requires Docker)
npm run protocol

# Connect client to local protocol
audius-compose connect

# Run web application
npm run web          # Against production
npm run web:local    # Against local services

# Testing
npm run test         # Run all tests via Turbo
npm run web:test     # Web unit tests
npm run web:e2e      # Web E2E tests (Playwright)

# Code Quality
npm run lint         # Run linting
npm run lint:fix     # Fix linting issues
npm run verify       # Run all checks (typecheck, lint, etc.)

# Build
npm run build        # Build all packages via Turbo
```

### Protocol Interaction Commands

```bash
# Service management
audius-compose up    # Start services
audius-compose down  # Stop services
audius-compose logs  # View logs

# User actions
audius-cmd create-user
audius-cmd upload-track
audius-cmd stream
```

## Architecture & Key Patterns

### Monorepo Structure

- **packages/web**: React web client with Vite, Redux Toolkit, Emotion CSS
- **packages/common**: Shared state, models, and utilities
- **packages/sdk**: JavaScript SDK for interacting with Audius protocol
- **packages/harmony**: Design system components and tokens
- **packages/discovery-provider**: Python backend that indexes blockchain data
- **mediorum**: Content node for storing/serving audio files

### State Management

- Redux Toolkit with sagas for side effects
- Slices organized by domain (e.g., user, track, playlist)
- Shared app state lives in packages/common/src/store

### API Communication

- SDK (@audius/sdk) handles all protocol interactions
- Services layer in packages/common/src/services
- API adapters for web3 and traditional HTTP endpoints
### Styling Approach

- Web: Emotion CSS with theme system
- Design tokens from @audius/harmony

### Testing Strategy

- Unit tests: Vitest (web), Jest (services)
- E2E tests: Playwright (web)
- Test files colocated with source files

### Key Development Patterns

- TypeScript throughout with strict mode
- Feature flags for progressive rollout
- Offline support with optimistic updates
- Web3 integration for blockchain features

## Important Notes

### When Making Changes

- Always run `npm run verify` before committing
- Backend changes may require protocol restart
- Design system changes affect shared web surfaces

### Environment Variables

- Web: See packages/web/.env.dev
- Protocol: Configured via dev-tools/startup

### Common Pitfalls

- Protocol must be running for local development
- Some features require blockchain interaction
- Audio processing happens on content nodes

## Code Style and Best Practices

- Always default to using `isPending` instead of `isLoading` as it comes to tanquery hooks
