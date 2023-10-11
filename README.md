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

## Development in local/hardhat blockchain
To run and test the protocol using the local blockchain.
As the protocol is automatically deployed when using the local blockchain,
the next step should be skipped.

```bash
# .env
NETWORK="hardhat"
```

Open a new terminal window and navigate (`$ cd /<project directory>`) into project's main folder. Leave it open, as it will be running the local network.
Fake Accounts list will be needed to use with the Metamask wallet provider in the browser.

**Account #0:** Is the protocol deployer's account and will own all governance tokens that should be distributed among the other accounts (community members)
```bash
# Run hardhat node and mount local blockchain
$ npx hardhat node
```

## Deploy Protocol
To deploy
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

# Development watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```
