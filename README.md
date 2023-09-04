# CIP-95 Cardano DApp Wallet Connector

Currently corresponding CIP-95 commit: [1f75f99](https://github.com/cardano-foundation/CIPs/pull/509/commits/1f75f990c4e8fdf308c3ed209bac723a84822931).

| Tag | CIP-95 Commit | demos Wallet Tag | Deployed Currently? |
| --- | ------------- | ---------------- | ------------------- |
| [1.4.0](https://github.com/Ryun1/cip95-cardano-wallet-connector/releases/tag/1.4.0) | [fbc5fcb](https://github.com/cardano-foundation/CIPs/pull/509/commits/fbc5fcbb127313ccfd2a30376145f63627f3afd9) | [1.4.0](https://github.com/Ryun1/cip95-demos-wallet/releases/tag/1.4.0) | No |
| [1.4.0](https://github.com/Ryun1/cip95-cardano-wallet-connector/releases/tag/1.4.0) | [1f75f99](https://github.com/cardano-foundation/CIPs/pull/509/commits/1f75f990c4e8fdf308c3ed209bac723a84822931) | [1.4.0](https://github.com/Ryun1/cip95-demos-wallet/releases/tag/1.4.0) | [Yes](https://ryun1.github.io/cip95-cardano-wallet-connector/) |

## CIP-95/Conway Features Supported Notes

### 1.4.0

#### SanchoNet:
- Cannot generate Sancho compatible transactions
  
#### Cardano Serialization Library Conway Alpha:
- Does not use any Conway alpha builds.

#### CIP-95:
- `.getPubDRepKey()`
  - Should work correctly as expected.
- `.getPubActiveStakeKeys()`
  - Calls from wallet and displays the first of the array.
- `.signTx()`
  - No conway items supported properly (waiting for Sancho + CML/CSL).
  - Supports generating and signing of metadata transactions which take user input.
- `.signData()`
  - No conway items supported properly (waiting for Sancho + CML/CSL).
  - Not implemented at all.

### 1.5.XX (In progress)

#### SanchoNet:
- Can create SanchoNet compatible transactions.
- Some things might be broke.
- May not be able to submit to Sancho
  
#### Cardano Serialization Library Conway Alpha:
- Uses Alpha build to support connecting to Sancho and CIP-95.

#### CIP-95:
- `.getPubDRepKey()`
  - Should work correctly as expected.
- `.getPubActiveStakeKeys()`
  - Show array of stake keys
- `.signTx()`
  - Supports generation and signature of all Conway items.
- `.signData()`
  - Supports properly signing with DRep Key.

#### Misc
- Fix Errors and general tidy

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