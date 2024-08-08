# CIP-95 Cardano DApp Wallet Connector

| Tag | Feature Details | Deployed Currently? |
| --- | --------------- | ------------------- |
| [1.8.1](https://github.com/Ryun1/cip95-cardano-wallet-connector/releases/tag/1.8.1) | [Here](./CHANGELOG.md#180) | No |
| [1.9.0](https://github.com/Ryun1/cip95-cardano-wallet-connector/releases/tag/1.9.0) | [Here](./CHANGELOG.md#190) | [Yes](https://ryun1.github.io/cip95-cardano-wallet-connector/) |


### 1.9.0

- add support for guard rails script
- Fixed `InputSetEmptyUTxO` when transaction had implicit inputs
- Updated default params
- Minor improvements to governance actions 

### 1.9.1 (In progress)

- `.cip95.signData`
- refactor
- Use total collateral and collateral return for better compatibility
- Update code to support multiple proposals in single transaction

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

1. Change the `"homepage" ` field in [package.json](./package.json) to your repo.
   
2. Deploy to github pages
   
```bash
sudo npm run deploy
```

## Live Demo

A demo showcasing all functionalities of the wallet connector:

https://ryun1.github.io/cip95-cardano-wallet-connector/