## Governance Protocol Server API

This is a demo portfolio server project of a DAO / Governance Protocol. It provides an API with endpoints to connect a client to the protocol

### Features
- Governance Service:
  - Get proposals list
  - Get proposal details (votes, stats)
  - Create new proposal
  - Vote on proposals
- Network Service:
  - Get network status

## Getting started
Config environment in a new `.env` file.
Currently supporting networks 'hardhat', 'sepolia', 'mainnet'

**Default configuration**
Every env variable has a default to be used with Sepolia test network

```bash
# .env

NEXT=<SERVER_API_URL>
NETWORK=<NETWORK_NAME>
ETHERSCAN_API_KEY=<KEY>
DEPLOYER_ACCOUNT_PRIVATE_KEY=<KEY>
COINMARKETCAP_API_KEY=<KEY>
```

## Install hardhat and dependencies

```bash
# Install project dependencies
$ yarn install
```

### Development in local blockchain
```bash
# Run hardhat node
$ npx hardhat node
```

## Deploy Protocol

```bash
# Deploy protocol in local hardhat blockchain
$ yarn hardhat deploy --network hardhat

# Deploy protocol in testnet blockchain (for example 'sepolia')
$ yarn hardhat deploy --network sepolia
```

## Running the app
```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```
