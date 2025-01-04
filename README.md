# CIP-95 Cardano DApp Wallet Connector

| Tag | Feature Details | Deployed Currently? |
| --- | --------------- | ------------------- |
| [1.9.0](https://github.com/Ryun1/cip95-cardano-wallet-connector/releases/tag/1.9.0) | [Here](./CHANGELOG.md#190) | no |
| [1.9.1](https://github.com/Ryun1/cip95-cardano-wallet-connector/releases/tag/1.9.1) | [Here](./CHANGELOG.md#190) | [Yes](https://ryun1.github.io/cip95-cardano-wallet-connector/) |

### 1.9.1

- bump CSL to 12.1.1
- add CIP-129 support for DRep IDs

### 1.9.2 (In progress)

- `.cip95.signData`
- Use total collateral and collateral return for better compatibility
- refactor

## To Develop

### Start Dev Env

1. Install modules

```bash
sudo npm install
```

2. Try to start

```bash
sudo npm start
```

This should launch a local dev environment at [http://localhost:3000](http://localhost:3000).

### To Deploy

1. Change the `"homepage"` field in [package.json](./package.json) to your repo.

2. Deploy to github pages

```bash
sudo npm run deploy
```

## Live Demo

A demo showcasing all functionalities of the wallet connector:

https://ryun1.github.io/cip95-cardano-wallet-connector/