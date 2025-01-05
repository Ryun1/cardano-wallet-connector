# CIP-95 Cardano DApp Wallet Connector

| Tag | Feature Details | Deployed Currently? |
| --- | --------------- | ------------------- |
| [1.9.1](https://github.com/Ryun1/cip95-cardano-wallet-connector/releases/tag/1.9.1) | [Here](./CHANGELOG.md#191) | No |
| [1.9.2](https://github.com/Ryun1/cip95-cardano-wallet-connector/releases/tag/1.9.2) | [Here](./CHANGELOG.md#192) | [Yes](https://ryun1.github.io/cip95-cardano-wallet-connector/) |

### 1.9.2

- fix bug with creating 1 ada utxos
- fix Conway stake reg/dereg certificates

### 1.9.3 (In progress)

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