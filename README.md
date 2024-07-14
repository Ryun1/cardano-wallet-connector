# CIP-95 Cardano DApp Wallet Connector

| Tag | Feature Details | demos Wallet Tag | Deployed Currently? |
| --- | --------------- |----------------- | ------------------- |
| [1.8.0](https://github.com/Ryun1/cip95-cardano-wallet-connector/releases/tag/1.8.0) | [Here](./CHANGELOG.md#180) | [1.8.0+](https://github.com/Ryun1/cip95-demos-wallet/tags) | [No](https://ryun1.github.io/cip95-cardano-wallet-connector/) |
| [1.8.1](https://github.com/Ryun1/cip95-cardano-wallet-connector/releases/tag/1.8.1) | [Here](./CHANGELOG.md#180) | [1.8.0+](https://github.com/Ryun1/cip95-demos-wallet/tags) | [Yes](https://ryun1.github.io/cip95-cardano-wallet-connector/) |

## CIP-95/Conway Features Supported Notes

See [CHANGELOG.md](./CHANGELOG.md) for feature details on older tags.

### 1.8.1
- Bump to CSL 12.0.0-beta.2

### 1.8.2 (In progress)
- `.cip95.signData`
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

1. Change the `"homepage" ` field in [package.json](./package.json) to your repo.
   
2. Deploy to github pages
   
```bash
sudo npm run deploy
```

## Live Demo

A demo showcasing all functionalities of the wallet connector:

https://ryun1.github.io/cip95-cardano-wallet-connector/