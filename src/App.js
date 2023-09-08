import React from 'react'
import { Tab, Tabs, RadioGroup, Radio, FormGroup, InputGroup } from "@blueprintjs/core";
import "../node_modules/@blueprintjs/core/lib/css/blueprint.css";
import "../node_modules/@blueprintjs/icons/lib/css/blueprint-icons.css";
import "../node_modules/normalize.css/normalize.css";
import {
    Address,
    TransactionUnspentOutput,
    TransactionUnspentOutputs,
    TransactionOutput,
    Value,
    TransactionBuilder,
    TransactionBuilderConfigBuilder,
    LinearFee,
    BigNum,
    TransactionWitnessSet,
    Transaction,
    Credential,
    GeneralTransactionMetadata,
    AuxiliaryData,
    encode_json_str_to_metadatum,
    MetadataJsonSchema,
    TransactionMetadatumLabels,
    Certificate,
    PublicKey,
    RewardAddress,
    Ed25519KeyHash,
    // Conway alpha
    CertificatesBuilder,
    VoteDelegation,
    DRep,
    AnchorDataHash,
    Anchor,
    DrepRegistration,
} from "@emurgo/cardano-serialization-lib-asmjs"
import "./App.css";
let Buffer = require('buffer/').Buffer
let { bech32 } = require('bech32')


export default class App extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            selectedTabId: "1",
            whichWalletSelected: undefined,
            walletFound: false,
            walletIsEnabled: false,
            walletName: undefined,
            walletIcon: undefined,
            walletAPIVersion: undefined,
            wallets: [],

            networkId: undefined,
            Utxos: undefined,
            CollatUtxos: undefined,
            balance: undefined,
            changeAddress: undefined,
            rewardAddress: undefined,
            usedAddress: undefined,

            txBody: undefined,
            txBodyCborHex_unsigned: "",
            txBodyCborHex_signed: "",
            submittedTxHash: "",

            addressBech32SendADA: "addr_test1qrptpa3yfhva8ndvmnfyjl3a49jhhc8apwlz9u8cvm6nmx0lcqjhrza2krhyeuj8wphyrxhzt5l3hczqqmfdsg2du0ksplt2py",
            lovelaceToSend: 3000000,
            assetNameHex: "4c494645",
            assetPolicyIdHex: "ae02017105527c6c0c9840397a39cc5ca39fabe5b9998ba70fda5f2f",
            assetAmountToSend: 5,
            addressScriptBech32: "addr_test1wpnlxv2xv9a9ucvnvzqakwepzl9ltx7jzgm53av2e9ncv4sysemm8",
            datumStr: "12345678",
            plutusScriptCborHex: "4e4d01000033222220051200120011",
            transactionIdLocked: "",
            transactionIndxLocked: 0,
            lovelaceLocked: 3000000,
            manualFee: 900000,

            // CIP-95 Stuff
            selected95TabId: "1",
            selectedCIP95: false,
            // DRep key items
            dRepKey: undefined,
            dRepID: undefined,
            dRepIDBech32: undefined,
            // stake key items
            regStakeKey: undefined,
            unregStakeKey: undefined,
            regStakeKeyHashHex: undefined,
            unregStakeKeyHashHex: undefined,
            // transaction items
            cip95ResultTx: "",
            cip95ResultHash: "",
            cip95ResultWitness: "",
            cip95MetadataURL: undefined,
            cip95MetadataHash: undefined,
            cip95MetadatumLabel: BigNum.from_str("3921"),
            
            // Conway Alpha
            cip95CertBuilder: "",

            // vote delegation
            voteDelegationTarget: "",
        
            // DRep Retirement
            dRepRetirementEpoch : undefined,

            // vote
            voteGovActionID: "gov_action...hd74s",
            voteChoice: undefined,

            // governance action
            govActionDeposit: 100,
            govActionHash: "b4e4184bfedf920fec53cdc327de4da661ae427784c0ccca9e3c2f50",
            govActionType: undefined,

        }

        /**
         * When the wallet is connect it returns the connector which is
         * written to this API variable and all the other operations
         * run using this API object
         */
        this.API = undefined;

        /**
         * Protocol parameters
         * @type {{
         * keyDeposit: string,
         * coinsPerUtxoWord: string,
         * minUtxo: string,
         * poolDeposit: string,
         * maxTxSize: number,
         * priceMem: number,
         * maxValSize: number,
         * linearFee: {minFeeB: string, minFeeA: string}, priceStep: number,
         * votingProposalDeposit: string
         * }}
         */
        this.protocolParams = {
            linearFee: {
                minFeeA: "44",
                minFeeB: "155381",
            },
            minUtxo: "34482",
            poolDeposit: "500000000",
            keyDeposit: "2000000",
            maxValSize: 5000,
            maxTxSize: 16384,
            priceMem: 0.0577,
            priceStep: 0.0000721,
            coinsPerUtxoWord: "34482",
            // Conway Alpha
            votingProposalDeposit: "500000000",
        }

        this.pollWallets = this.pollWallets.bind(this);
    }

    /**
     * Poll the wallets it can read from the browser.
     * Sometimes the html document loads before the browser initialized browser plugins (like Nami or Flint).
     * So we try to poll the wallets 3 times (with 1 second in between each try).
     *
     * Note: CCVault and Eternl are the same wallet, Eternl is a rebrand of CCVault
     * So both of these wallets as the Eternl injects itself twice to maintain
     * backward compatibility
     *
     * @param count The current try count.
     */
    pollWallets = (count = 0) => {
        const wallets = [];
        for(const key in window.cardano) {
            if (window.cardano[key].enable && wallets.indexOf(key) === -1) {
                wallets.push(key);
            }
        }
        if (wallets.length === 0 && count < 3) {
            setTimeout(() => {
                this.pollWallets(count + 1);
            }, 1000);
            return;
        }
        this.setState({
            wallets,
            whichWalletSelected: wallets[0]
        }, () => {
            this.refreshData()
        });
    }

    /**
     * Handles the radio buttons on the form that
     * let the user choose which wallet to work with
     * @param obj
     */
    handleWalletSelect = (obj) => {
        const whichWalletSelected = obj.target.value
        this.setState({whichWalletSelected},
            () => {
                this.refreshData()
            })
    }

    /**
     * Checks if the wallet is running in the browser
     * Does this for Nami, Eternl and Flint wallets
     * @returns {boolean}
     */

    checkIfWalletFound = () => {
        const walletKey = this.state.whichWalletSelected;
        const walletFound = !!window?.cardano?.[walletKey];
        this.setState({walletFound})
        return walletFound;
    }

    /**
     * Checks if a connection has been established with
     * the wallet
     * @returns {Promise<boolean>}
     */
    checkIfWalletEnabled = async () => {
        let walletIsEnabled = false;

        try {
            const walletName = this.state.whichWalletSelected;
            walletIsEnabled = await window.cardano[walletName].isEnabled();
        } catch (err) {
            console.log(err)
        }
        this.setState({walletIsEnabled});

        return walletIsEnabled;
    }

    /**
     * Enables the wallet that was chosen by the user
     * When this executes the user should get a window pop-up
     * from the wallet asking to approve the connection
     * of this app to the wallet
     * @returns {Promise<boolean>}
     */

    enableWallet = async () => {
        const walletKey = this.state.whichWalletSelected;
        try {
            this.API = await window.cardano[walletKey].enable();
        } catch(err) {
            console.log(err);
        }
        return this.checkIfWalletEnabled();
    }

    /**
     * Get the API version used by the wallets
     * writes the value to state
     * @returns {*}
     */
    getAPIVersion = () => {
        const walletKey = this.state.whichWalletSelected;
        const walletAPIVersion = window?.cardano?.[walletKey].apiVersion;
        this.setState({walletAPIVersion})
        return walletAPIVersion;
    }

    /**
     * Get the name of the wallet (nami, eternl, flint)
     * and store the name in the state
     * @returns {*}
     */

    getWalletName = () => {
        const walletKey = this.state.whichWalletSelected;
        const walletName = window?.cardano?.[walletKey].name;
        this.setState({walletName})
        return walletName;
    }

    /**
     * Gets the Network ID to which the wallet is connected
     * 0 = testnet
     * 1 = mainnet
     * Then writes either 0 or 1 to state
     * @returns {Promise<void>}
     */
    getNetworkId = async () => {
        try {
            const networkId = await this.API.getNetworkId();
            this.setState({networkId})

        } catch (err) {
            console.log(err)
        }
    }

    /**
     * Gets the UTXOs from the user's wallet and then
     * stores in an object in the state
     * @returns {Promise<void>}
     */

    getUtxos = async () => {

        let Utxos = [];

        try {
            const rawUtxos = await this.API.getUtxos();

            for (const rawUtxo of rawUtxos) {
                const utxo = TransactionUnspentOutput.from_bytes(Buffer.from(rawUtxo, "hex"));
                const input = utxo.input();
                const txid = Buffer.from(input.transaction_id().to_bytes(), "utf8").toString('hex');
                const txindx = input.index();
                const output = utxo.output();
                const amount = output.amount().coin().to_str(); // ADA amount in lovelace
                const multiasset = output.amount().multiasset();
                let multiAssetStr = "";

                if (multiasset) {
                    const keys = multiasset.keys() // policy Ids of thee multiasset
                    const N = keys.len();
                    // console.log(`${N} Multiassets in the UTXO`)


                    for (let i = 0; i < N; i++){
                        const policyId = keys.get(i);
                        const policyIdHex = Buffer.from(policyId.to_bytes(), "utf8").toString('hex');
                        // console.log(`policyId: ${policyIdHex}`)
                        const assets = multiasset.get(policyId)
                        const assetNames = assets.keys();
                        const K = assetNames.len()
                        // console.log(`${K} Assets in the Multiasset`)

                        for (let j = 0; j < K; j++) {
                            const assetName = assetNames.get(j);
                            const assetNameString = Buffer.from(assetName.name(),"utf8").toString();
                            const assetNameHex = Buffer.from(assetName.name(),"utf8").toString("hex")
                            const multiassetAmt = multiasset.get_asset(policyId, assetName)
                            multiAssetStr += `+ ${multiassetAmt.to_str()} + ${policyIdHex}.${assetNameHex} (${assetNameString})`
                            // console.log(assetNameString)
                            // console.log(`Asset Name: ${assetNameHex}`)
                        }
                    }
                }


                const obj = {
                    txid: txid,
                    txindx: txindx,
                    amount: amount,
                    str: `${txid} #${txindx} = ${amount}`,
                    multiAssetStr: multiAssetStr,
                    TransactionUnspentOutput: utxo
                }
                Utxos.push(obj);
                // console.log(`utxo: ${str}`)
            }
            this.setState({Utxos})
        } catch (err) {
            console.log(err)
        }
    }

    /**
     * The collateral is need for working with Plutus Scripts
     * Essentially you need to provide collateral to pay for fees if the
     * script execution fails after the script has been validated...
     * this should be an uncommon occurrence and would suggest the smart contract
     * would have been incorrectly written.
     * The amount of collateral to use is set in the wallet
     * @returns {Promise<void>}
     */
    getCollateral = async () => {

        let CollatUtxos = [];

        try {

            let collateral = [];

            const wallet = this.state.whichWalletSelected;
            if (wallet === "nami") {
                collateral = await this.API.experimental.getCollateral();
            } else {
                collateral = await this.API.getCollateral();
            }

            for (const x of collateral) {
                const utxo = TransactionUnspentOutput.from_bytes(Buffer.from(x, "hex"));
                CollatUtxos.push(utxo)
                // console.log(utxo)
            }
            this.setState({CollatUtxos})
        } catch (err) {
            console.log(err)
        }

    }

    /**
     * Gets the current balance of in Lovelace in the user's wallet
     * This doesnt resturn the amounts of all other Tokens
     * For other tokens you need to look into the full UTXO list
     * @returns {Promise<void>}
     */
    getBalance = async () => {
        try {
            const balanceCBORHex = await this.API.getBalance();

            const balance = Value.from_bytes(Buffer.from(balanceCBORHex, "hex")).coin().to_str();
            this.setState({balance})

        } catch (err) {
            console.log(err)
        }
    }

    /**
     * Get the address from the wallet into which any spare UTXO should be sent
     * as change when building transactions.
     * @returns {Promise<void>}
     */
    getChangeAddress = async () => {
        try {
            const raw = await this.API.getChangeAddress();
            const changeAddress = Address.from_bytes(Buffer.from(raw, "hex")).to_bech32()
            this.setState({changeAddress})
        } catch (err) {
            console.log(err)
        }
    }

    /**
     * This is the Staking address into which rewards from staking get paid into
     * @returns {Promise<void>}
     */
    getRewardAddresses = async () => {

        try {
            const raw = await this.API.getRewardAddresses();
            const rawFirst = raw[0];
            const rewardAddress = Address.from_bytes(Buffer.from(rawFirst, "hex")).to_bech32()
            // console.log(rewardAddress)
            this.setState({rewardAddress})

        } catch (err) {
            console.log(err)
        }
    }

    /**
     * Gets previsouly used addresses
     * @returns {Promise<void>}
     */
    getUsedAddresses = async () => {

        try {
            const raw = await this.API.getUsedAddresses();
            const rawFirst = raw[0];
            const usedAddress = Address.from_bytes(Buffer.from(rawFirst, "hex")).to_bech32()
            // console.log(rewardAddress)
            this.setState({usedAddress})

        } catch (err) {
            console.log(err)
        }
    }

    checkIfCIP95MethodsAvailable = async () => {
        const hasCIP95Methods =( this.API.hasOwnProperty('getPubDRepKey'));
        console.log(`Has CIP95 .getPubDRepKey() and .getActivePubStakeKeys: ${hasCIP95Methods}`)
        return hasCIP95Methods;
    }
    /**
     * Refresh all the data from the user's wallet
     * @returns {Promise<void>}
     */
    refreshData = async () => {

        try{
            const walletFound = this.checkIfWalletFound();

            if (walletFound && this.state.selectedCIP95) {
                await this.getAPIVersion();
                await this.getWalletName();
                const walletEnabled = await this.enableCIP95Wallet();
                const hasCIP95Methods = await this.checkIfCIP95MethodsAvailable();

                if (walletEnabled && hasCIP95Methods) {
                    await this.getNetworkId();
                    await this.getUtxos();
                    await this.getBalance();
                    await this.getChangeAddress();
                    await this.getRewardAddresses();
                    await this.getUsedAddresses();
                    await this.getPubDRepKey();
                    await this.getRegisteredPubStakeKeys();
                    await this.getUnregisteredPubStakeKeys();
                } else {
                    await this.setState({
                        Utxos: null,
                        CollatUtxos: null,
                        balance: null,
                        changeAddress: null,
                        rewardAddress: null,
                        usedAddress: null,

                        txBody: null,
                        txBodyCborHex_unsigned: "",
                        txBodyCborHex_signed: "",
                        submittedTxHash: "",

                        dRepKey: "",
                        dRepID: "",
                        dRepIDBech32: "",
                        regStakeKey: "",
                        unregStakeKey: "",
                        regStakeKeyHashHex: "",
                        unregStakeKeyHashHex: "",
                        cip95ResultTx: "",
                        cip95ResultHash: "",
                        cip95ResultWitness: "",
                        cip95CertBuilder: "",
                        voteDelegationTarget: "",
                    });
                }
            } else if (walletFound) {
                    await this.getAPIVersion();
                    await this.getWalletName();
                    const walletEnabled = await this.enableWallet();
                    if (walletEnabled) {
                        await this.getNetworkId();
                        await this.getUtxos();
                        // await this.getCollateral();
                        await this.getBalance();
                        await this.getChangeAddress();
                        await this.getRewardAddresses();
                        await this.getUsedAddresses();
                    } else {
                        await this.setState({
                            Utxos: null,
                            CollatUtxos: null,
                            balance: null,
                            changeAddress: null,
                            rewardAddress: null,
                            usedAddress: null,
    
                            txBody: null,
                            txBodyCborHex_unsigned: "",
                            txBodyCborHex_signed: "",
                            submittedTxHash: "",
    
                            dRepKey: "",
                            dRepID: "",
                            dRepIDBech32: "",
                            regStakeKey: "",
                            unregStakeKey: "",
                            regStakeKeyHashHex: "",
                            unregStakeKeyHashHex: "",
                            cip95ResultTx: "",
                            cip95ResultHash: "",
                            cip95ResultWitness: "",
                            cip95CertBuilder: "",
                            voteDelegationTarget: "",
                        });
                    }
            } else {
                await this.setState({
                    walletIsEnabled: false,

                    Utxos: null,
                    CollatUtxos: null,
                    balance: null,
                    changeAddress: null,
                    rewardAddress: null,
                    usedAddress: null,

                    txBody: null,
                    txBodyCborHex_unsigned: "",
                    txBodyCborHex_signed: "",
                    submittedTxHash: "",

                    dRepKey: "",
                    dRepID: "",
                    dRepIDBech32: "",
                    regStakeKey: "",
                    unregStakeKey: "",
                    regStakeKeyHashHex: "",
                    unregStakeKeyHashHex: "",
                    cip95ResultTx: "",
                    cip95ResultHash: "",
                    cip95ResultWitness: "",
                    cip95CertBuilder: "",
                    voteDelegationTarget: "",
                });
            }
        } catch (err) {
            console.log(err)
        }
    }

    /**
     * Every transaction starts with initializing the
     * TransactionBuilder and setting the protocol parameters
     * This is boilerplate
     * @returns {Promise<TransactionBuilder>}
     */
    initTransactionBuilder = async () => {

        const txBuilder = TransactionBuilder.new(
            TransactionBuilderConfigBuilder.new()
                .fee_algo(LinearFee.new(BigNum.from_str(this.protocolParams.linearFee.minFeeA), BigNum.from_str(this.protocolParams.linearFee.minFeeB)))
                .pool_deposit(BigNum.from_str(this.protocolParams.poolDeposit))
                .key_deposit(BigNum.from_str(this.protocolParams.keyDeposit))
                .coins_per_utxo_word(BigNum.from_str(this.protocolParams.coinsPerUtxoWord))
                .max_value_size(this.protocolParams.maxValSize)
                .max_tx_size(this.protocolParams.maxTxSize)
                .prefer_pure_change(true)
                // Conway Alpha
                .voting_proposal_deposit(BigNum.from_str(this.protocolParams.votingProposalDeposit))
                .build()
        );

        return txBuilder
    }
    /**
     * Builds an object with all the UTXOs from the user's wallet
     * @returns {Promise<TransactionUnspentOutputs>}
     */
    getTxUnspentOutputs = async () => {
        let txOutputs = TransactionUnspentOutputs.new()
        for (const utxo of this.state.Utxos) {
            txOutputs.add(utxo.TransactionUnspentOutput)
        }
        return txOutputs
    }

    // CIP-95 Parts
    getPubDRepKey = async () => {
        try {
            // From wallet get pub DRep key 
            const raw = await this.API.getPubDRepKey();
            const dRepKey = raw;
            // console.log("DRep Key: ", dRepKey);
            this.setState({dRepKey});
            
            // From wallet's DRep key hash to get DRep ID 
            const dRepKeyBytes = Buffer.from(dRepKey, "hex");
            const dRepID = ((PublicKey.from_bytes(dRepKeyBytes)).hash());
            // console.log("DRep ID Hex: ", dRepID);
            this.setState({dRepID: Buffer.from(dRepID.to_bytes()).toString('hex')});

            // into bech32
            const words = bech32.toWords(Buffer.from(dRepID.to_bytes()));
            const dRepIDBech32 = bech32.encode('drep_id', words);
            // console.log("DRep ID Bech: ", dRepIDBech32);
            this.setState({dRepIDBech32});

            this.setState({voteDelegationTarget: dRepIDBech32});
        } catch (err) {
            console.log(err)
        }
    }
    

    getRegisteredPubStakeKeys = async () => {
        try {
            const raw = await this.API.getRegisteredPubStakeKeys();

            if (raw.length < 1){
                console.log("No Registered Pub Stake Keys");
            } else {
                // Just use the first key for now 
                const regStakeKey = raw[0];
                console.log("Reg stake Key: ", regStakeKey);
                this.setState({regStakeKey})

                const stakeKeyBytes = Buffer.from(regStakeKey, 'hex');

                // Hash the stake key
                const stakeKeyHash = ((PublicKey.from_bytes(stakeKeyBytes)).hash());
                console.log("Reg stake Key Hash: ", Buffer.from(stakeKeyHash.to_bytes()).toString('hex'));
                this.setState({regStakeKeyHashHex: Buffer.from(stakeKeyHash.to_bytes()).toString('hex')});

                // Make a StakeCredential from the hash
                const stakeCredential = Credential.from_keyhash(stakeKeyHash);
                console.log("Reg stake Credential: ", Buffer.from(stakeCredential.to_bytes()).toString('hex'));

                // Make a StakeAddress Hex from the credential
                const stakeAddrTestHex = Buffer.from((RewardAddress.new(0, stakeCredential)).to_address().to_bytes()).toString('hex');
                const stakeAddrMainHex = Buffer.from((RewardAddress.new(1, stakeCredential)).to_address().to_bytes()).toString('hex');
                console.log("Testnet Reg stake Address (Hex): ", stakeAddrTestHex);
                console.log("Mainnet Reg stake Address (Hex): ", stakeAddrMainHex);

                // Make a StakeAddress Bech from the credential
                console.log("Testnet Reg stake Address (Bech): ", (RewardAddress.new(0, stakeCredential)).to_address().to_bech32());
                console.log("Mainnet Reg stake Address (Bech): ", (RewardAddress.new(1, stakeCredential)).to_address().to_bech32());
            }
        } catch (err) {
            console.log(err)
        }
    }

    getUnregisteredPubStakeKeys = async () => {
        try {
            const raw = await this.API.getUnregisteredPubStakeKeys();
            // Just use the first key for now
            if (raw.length < 1){
                console.log("No Unregistered Pub Stake Keys");
            } else {

                const unregStakeKey = raw[0];

                console.log("Unreg stake Key: ", unregStakeKey);
                this.setState({unregStakeKey})

                const stakeKeyBytes = Buffer.from(unregStakeKey, 'hex');

                // Hash the stake key
                const stakeKeyHash = ((PublicKey.from_bytes(stakeKeyBytes)).hash());
                console.log("Unreg stake Key Hash: ", Buffer.from(stakeKeyHash.to_bytes()).toString('hex'));
                this.setState({unregStakeKeyHashHex: Buffer.from(stakeKeyHash.to_bytes()).toString('hex')});

                // Make a StakeCredential from the hash
                const stakeCredential = Credential.from_keyhash(stakeKeyHash);
                console.log("Unreg stake Credential: ", Buffer.from(stakeCredential.to_bytes()).toString('hex'));

                // Make a StakeAddress Hex from the credential
                const stakeAddrTestHex = Buffer.from((RewardAddress.new(0, stakeCredential)).to_address().to_bytes()).toString('hex');
                const stakeAddrMainHex = Buffer.from((RewardAddress.new(1, stakeCredential)).to_address().to_bytes()).toString('hex');
                console.log("Testnet Unreg stake Address (Hex): ", stakeAddrTestHex);
                console.log("Mainnet Unreg stake Address (Hex): ", stakeAddrMainHex);

                // Make a StakeAddress Bech from the credential
                console.log("Testnet Unreg stake Address (Bech): ", (RewardAddress.new(0, stakeCredential)).to_address().to_bech32());
                console.log("Mainnet Unreg stake Address (Bech): ", (RewardAddress.new(1, stakeCredential)).to_address().to_bech32());
            }
        } catch (err) {
            console.log(err)
        }
    }

    enableCIP95Wallet = async () => {
        const walletKey = this.state.whichWalletSelected;
        try {
            this.API = await window.cardano[walletKey].enable({extensions: [{cip: 95}]});
        } catch(err) {
            console.log(err);
        }
        return this.checkIfWalletEnabled();
    }

    handleTab95Id = (tabId) => this.setState({selectedTab95Id: tabId})

    handleCIP95Select = () => {
        const selectedCIP95 = !this.state.selectedCIP95;
        console.log("CIP-95 Selected?: ", selectedCIP95);
        this.setState({selectedCIP95});
    }

    buildSubmitConwayCertTx = async () => {
    
        // Initialize builder with protocol parameters
        const txBuilder = await this.initTransactionBuilder();

        // Set output and change addresses to those of our wallet
        const shelleyOutputAddress = Address.from_bech32(this.state.usedAddress);
        const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress);
        
        // Add output of 1 ADA to the address of our wallet
        txBuilder.add_output(
            TransactionOutput.new(
                shelleyOutputAddress,
                Value.new(BigNum.from_str("1000000"))
            ),
        );

        // Find the available UTXOs in the wallet and use them as Inputs for the transaction
        const txUnspentOutputs = await this.getTxUnspentOutputs();
        txBuilder.add_inputs_from(txUnspentOutputs, 1)

        // Set change address, incase too much ADA provided for fee
        txBuilder.add_change_if_needed(shelleyChangeAddress)
        
        // Set the certificate to the current certbuilder
        txBuilder.set_certs_builder(this.state.cip95CertBuilder);

        // Build transaction body
        const txBody = txBuilder.build();

        // Make a full transaction, passing in empty witness set
        const transactionWitnessSet = TransactionWitnessSet.new();
        const tx = Transaction.new(
            txBody,
            TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes()),
        );

        console.log("UnSigned Tx: ", tx.to_json());

        // Ask wallet to to provide signature (witnesses) for the transaction
        let txVkeyWitnesses;
        
        txVkeyWitnesses = await this.API.signTx(Buffer.from(tx.to_bytes(), "utf8").toString("hex"), true);

        console.log("Wallet signed Tx")

        // Create witness set object using the witnesses provided by the wallet
        txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));
        transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());
        
        // Build transaction with witnesses
        const signedTx = Transaction.new(
            tx.body(),
            transactionWitnessSet,
        );

        console.log("Signed Tx: ", signedTx.to_json());
        
        // Submit built signed transaction to chain, via wallet's submit transaction endpoint
        const result = await this.API.submitTx(Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"));
        console.log("Built and submitted transaction: ", result)
        // Set results so they can be rendered
        const cip95ResultTx = Buffer.from(signedTx.to_bytes(), "utf8").toString("hex");
        const cip95ResultHash = result;
        const cip95ResultWitness = Buffer.from(txVkeyWitnesses.to_bytes(), "utf8").toString("hex");
        this.setState({cip95ResultTx});
        this.setState({cip95ResultHash});
        this.setState({cip95ResultWitness});
    }

    // conway alpha
    buildDRepRegCert = async (anchorURL, anchorHash) => {

        // Build DRep Registration Certificate
        const certBuilder = CertificatesBuilder.new();

        // Get wallet's DRep key
        const DRepKeyHash = Ed25519KeyHash.from_hex(this.state.dRepID);
        const dRepCred = Credential.from_keyhash(DRepKeyHash);

        // Make an example metadata anchor, using my github example
        const dataHash = AnchorDataHash.from_hex("9bba8233cdd086f0325daba465d568a88970d42536f9e71e92a80d5922ded885");
        // const url = CSL.URL.new("https://raw.githubusercontent.com/Ryun1/gov-metadata/main/governace-action/metadata.jsonld");
        const url = URL.new("example.com");
        const anchor = Anchor.new(url, dataHash);

        // Create cert object using one Ada as the deposit
        const dRepRegCert = DrepRegistration.new_with_anchor(
            dRepCred,
            BigNum.from_str("1000000"), // deposit
            anchor
        );

        // add cert to tbuilder
        certBuilder.add(Certificate.new_drep_registration(dRepRegCert));
        
        this.setState({cip95CertBuilder : certBuilder});
    }

    // conway alpha
    buildVoteDelegationCert = async (target) => {
    
        // Build Vote Delegation Certificate
        const certBuilder = CertificatesBuilder.new();
        
        const stakeKeyHash = Ed25519KeyHash.from_hex(this.state.stakeKeyHashHex);
        const stakeCred = Credential.from_keyhash(stakeKeyHash);
        
        // Create correct DRep
        let targetDRep;
        if (target.dRep === 'abstain') {
            targetDRep = DRep.new_always_abstain();

        }else if (target.dRep === 'no confidence') {
            targetDRep = DRep.new_always_no_confidence();

        }else{
            targetDRep = DRep.new_key_hash(Ed25519KeyHash.from_bech32(target.dRep));
        };

        const voteDelegationCert = VoteDelegation.new(
            stakeCred,
            targetDRep,
        );
    
        // add cert to tbuilder
        certBuilder.add(Certificate.new_vote_delegation(voteDelegationCert));
        
        this.setState({cip95CertBuilder : certBuilder});
    }

    buildSubmitMetadataTx = async (txMetadata) => {

        // Initialize builder with protocol parameters
        const txBuilder = await this.initTransactionBuilder();

        // Set output and change addresses to those of our wallet
        const shelleyOutputAddress = Address.from_bech32(this.state.usedAddress);
        const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress);
        
        // Add output of 1 ADA to the address of our wallet
        txBuilder.add_output(
            TransactionOutput.new(
                shelleyOutputAddress,
                Value.new(BigNum.from_str("1000000"))
            ),
        );

        // Add metadata to tx, have to jump through some data structure hoops 
        const metadata = encode_json_str_to_metadatum(JSON.stringify(txMetadata), MetadataJsonSchema.NoConversions);
        const auxMetadata = AuxiliaryData.new();
        // Map metadata to metadatum label
        const transactionMetadata = GeneralTransactionMetadata.new();
        transactionMetadata.insert(this.state.cip95MetadatumLabel, metadata);
        auxMetadata.set_metadata(transactionMetadata);
        const metadatumLabels = TransactionMetadatumLabels.new();
        metadatumLabels.add(this.state.cip95MetadatumLabel);
        
        // Add metadata to tx builder for correct fee calculation
        txBuilder.add_json_metadatum_with_schema(metadatumLabels.get(0), JSON.stringify(txMetadata), MetadataJsonSchema.NoConversions);

        // Find the available UTXOs in the wallet and use them as Inputs for the transaction
        const txUnspentOutputs = await this.getTxUnspentOutputs();
        txBuilder.add_inputs_from(txUnspentOutputs, 1)

        // Set change address, incase too much ADA provided for fee
        txBuilder.add_change_if_needed(shelleyChangeAddress)
        
        // Build transaction body
        const txBody = txBuilder.build();

        // Make a full transaction, passing in empty witness set
        const transactionWitnessSet = TransactionWitnessSet.new();
        const tx = Transaction.new(
            txBody,
            TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes()),
            auxMetadata,
        );

        // Ask wallet to to provide signature (witnesses) for the transaction
        let txVkeyWitnesses = await this.API.signTx(Buffer.from(tx.to_bytes(), "utf8").toString("hex"), true);
        
        // Create witness set object using the witnesses provided by the wallet
        txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));
        transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());
        
        // Build transaction with witnesses
        const signedTx = Transaction.new(
            tx.body(),
            transactionWitnessSet,
            tx.auxiliary_data(),
        );
        
        // Submit built signed transaction to chain, via wallet's submit transaction endpoint
        const result = await this.API.submitTx(Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"));
        console.log("Built and submitted metadata transaction: ", result)
        // Set results so they can be rendered
        const cip95ResultTx = Buffer.from(signedTx.to_bytes(), "utf8").toString('hex');
        const cip95ResultHash = result;
        const cip95ResultWitness = Buffer.from(txVkeyWitnesses.to_bytes(), "utf8").toString('hex');
        this.setState({cip95ResultTx});
        this.setState({cip95ResultHash});
        this.setState({cip95ResultWitness});
    }

    async componentDidMount() {
        this.pollWallets();
        await this.refreshData();
    }

    render()
    {

        return (
            <div style={{margin: "20px"}}>

                <h1>✨Demos dApp✨</h1>

                <input type="checkbox" onChange={this.handleCIP95Select}/> CIP-95?

                <div style={{paddingTop: "10px"}}>
                    <div style={{marginBottom: 15}}>Select wallet:</div>
                    <RadioGroup
                        onChange={this.handleWalletSelect}
                        selectedValue={this.state.whichWalletSelected}
                        inline={true}
                        className="wallets-wrapper"
                    >
                        { this.state.wallets.map(key =>
                            <Radio
                                key={key}
                                className="wallet-label"
                                value={key}>
                                <img src={window.cardano[key].icon} width={24} height={24} alt={key}/>
                                {window.cardano[key].name} ({key})
                            </Radio>
                        )}
                    </RadioGroup>
                </div>

                <button style={{padding: "20px"}} onClick={this.refreshData}>Refresh</button> 

                <p style={{paddingTop: "20px"}}><span style={{fontWeight: "bold"}}>Wallet Found: </span>{`${this.state.walletFound}`}</p>
                <p><span style={{fontWeight: "bold"}}>Wallet Connected: </span>{`${this.state.walletIsEnabled}`}</p>
                <p><span style={{fontWeight: "bold"}}>Wallet API version: </span>{this.state.walletAPIVersion}</p>
                <p><span style={{fontWeight: "bold"}}>Wallet name: </span>{this.state.walletName}</p>

                <p><span style={{fontWeight: "bold"}}>Network Id (0 = testnet; 1 = mainnet): </span>{this.state.networkId}</p>
                <p style={{paddingTop: "20px"}}><span style={{fontWeight: "bold"}}>UTXOs: </span>{this.state.Utxos?.map(x => <li style={{fontSize: "10px"}} key={`${x.str}${x.multiAssetStr}`}>{`${x.str}${x.multiAssetStr}`}</li>)}</p>
                <p style={{paddingTop: "20px"}}><span style={{fontWeight: "bold"}}>Balance: </span>{this.state.balance}</p>
                <p><span style={{fontWeight: "bold"}}>Change Address: </span>{this.state.changeAddress}</p>
                <p><span style={{fontWeight: "bold"}}>api.getRewardsAddress(): </span>{this.state.rewardAddress}</p>
                <p><span style={{fontWeight: "bold"}}>Used Address: </span>{this.state.usedAddress}</p>
                <hr style={{marginTop: "40px", marginBottom: "40px"}}/>
                <h1>CIP-95 🤠</h1>
                <p><span style={{fontWeight: "bold"}}> .getPubDRepKey(): </span>{this.state.dRepKey}</p>
                <p><span style={{fontWeight: "lighter"}}>Hex DRep ID (Key digest): </span>{this.state.dRepID}</p>
                <p><span style={{fontWeight: "lighter"}}>Bech32 DRep ID (Key digest): </span>{this.state.dRepIDBech32}</p>

                <p><span style={{fontWeight: "bold"}}>.getRegisteredPubStakeKeys(): </span>{this.state.regStakeKey}</p>
                <p><span style={{fontWeight: "lighter"}}> Registered Stake Key Hash (hex): </span>{this.state.regStakeKeyHashHex}</p>

                <p><span style={{fontWeight: "bold"}}>.getUnregisteredPubStakeKeys(): </span>{this.state.unregStakeKey}</p>
                <p><span style={{fontWeight: "lighter"}}> Registered Stake Key Hash (hex): </span>{this.state.unregStakeKeyHashHex}</p>

                <p><span style={{fontWeight: "bold"}}>Build Transaction and then .signTx(): </span></p>
                <Tabs id="cip95" vertical={true} onChange={this.handle95TabId} selectedTab95Id={this.state.selected95TabId}>
                    <Tab id="1" title="Submit Vote Delegation 🦸‍♀️" panel={
                        <div style={{marginLeft: "20px"}}>

                            <FormGroup
                                helperText="DRep ID | abstain | no confidence"
                                label="Target of Vote Delegation:"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({voteDelegationTarget: event.target.value})}
                                    value={this.state.voteDelegationTarget}

                                />
                            </FormGroup>

                            <button style={{padding: "10px"}} onClick={ () => this.buildSubmitConwayCertTx(this.buildVoteDelegationCert({dRep: this.state.voteDelegationTarget}))}>.submitTx()</button>
                        </div>
                    } />
                    <Tab id="2" title="Submit DRep Registration 👷‍♂️" panel={
                        <div style={{marginLeft: "20px"}}>

                            <FormGroup
                                helperText=""
                                label="Optional: Metadata URL"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({cip95MetadataURL: event.target.value})}
                                    defaultValue="https://raw.githubusercontent.com/Ryun1/gov-metadata/main/governace-action/metadata.jsonld"
                                />
                            </FormGroup>

                            <FormGroup
                                helperText=""
                                label="Optional: Metadata Hash"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({cip95MetadataHash: event.target.value})}
                                    defaultValue={this.state.cip95MetadataHash}

                                />
                            </FormGroup>

                            <button style={{padding: "10px"}} onClick={ () => this.buildSubmitMetadataTx({ DRep_id : this.state.dRepIDBech32, stake_credential : this.state.stakeKey, metadata_url : this.state.cip95MetadataURL, metadata_hash : this.state.cip95MetadataHash}) }>.submitTx()</button>
                        </div>
                    } />
                    <Tab id="3" title="3. Submit DRep Retirement 👴" panel={
                        <div style={{marginLeft: "20px"}}>

                            <FormGroup
                                helperText=""
                                label="Retirement Epoch"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({dRepRetirementEpoch: event.target.value})}
                                    defaultValue={this.state.dRepRetirementEpoch}

                                />
                            </FormGroup>

                            <FormGroup
                                helperText="https://my-metadata-url.json"
                                label="Optional: Metadata URL"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({cip95MetadataURL: event.target.value})}
                                    defaultValue={this.state.cip95MetadataURL}

                                />
                            </FormGroup>

                            <FormGroup
                                helperText=""
                                label="Optional: Metadata Hash"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({cip95MetadataHash: event.target.value})}
                                    defaultValue={this.state.cip95MetadataHash}

                                />
                            </FormGroup>

                    <button style={{padding: "10px"}} onClick={ () => this.buildSubmitMetadataTx({ DRep_id : this.state.dRepIDBech32, retirement_epoch : this.state.dRepRetirementEpoch, metadata_url : this.state.cip95MetadataURL, metadata_hash : this.state.cip95MetadataHash}) }>.submitTx()</button>
                        </div>
                    } />
                    <Tab id="4" title="4. Submit Vote 🗳" panel={
                        <div style={{marginLeft: "20px"}}>

                            <FormGroup
                                helperText=""
                                label="Gov Action ID"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({voteGovActionID: event.target.value})}
                                    defaultValue={this.state.voteGovActionID}

                                />
                            </FormGroup>

                            <FormGroup
                                helperText="Yes | No | Abstain"
                                label="Vote Choice"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({voteChoice: event.target.value})}
                                    defaultValue={this.state.voteChoice}

                                />
                            </FormGroup>

                            <FormGroup
                                helperText="https://my-metadata-url.json"
                                label="Optional: Metadata URL"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({cip95MetadataURL: event.target.value})}
                                    defaultValue={this.state.cip95MetadataURL}

                                />
                            </FormGroup>

                            <FormGroup
                                helperText=""
                                label="Optional: Metadata Hash"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({cip95MetadataHash: event.target.value})}
                                    defaultValue={this.state.cip95MetadataHash}

                                />
                            </FormGroup>
                            <button style={{padding: "10px"}} onClick={ () => this.buildSubmitMetadataTx({ governance_action_id : this.state.voteGovActionID, role : "dRep", witness : "witness", metadata_url : this.state.cip95MetadataURL, metadata_hash : this.state.cip95MetadataHash, vote : this.state.voteChoice}) }>.submitTx()</button>
                        </div>
                    } />
                    <Tab id="5" title="5. Submit Governance Action 💡" panel={
                        <div style={{marginLeft: "20px"}}>

                            <FormGroup
                                helperText=""
                                label="Gov Action Type"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({govActionType: event.target.value})}
                                    defaultValue={this.state.govActionType}

                                />
                            </FormGroup>

                            <FormGroup
                                helperText=""
                                label="Last Gov Action Hash"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({govActionHash: event.target.value})}
                                    defaultValue={this.state.govActionHash}

                                />
                            </FormGroup>

                            <FormGroup
                                helperText="https://my-metadata-url.json"
                                label="Optional: Metadata URL"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({cip95MetadataURL: event.target.value})}
                                    defaultValue={this.state.cip95MetadataURL}

                                />
                            </FormGroup>

                            <FormGroup
                                helperText=""
                                label="Optional: Metadata Hash"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({cip95MetadataHash: event.target.value})}
                                    defaultValue={this.state.cip95MetadataHash}

                                />
                            </FormGroup>
                            <button style={{padding: "10px"}} onClick={ () => this.buildSubmitMetadataTx({ governance_type : this.state.govActionType, gov_action_deposit : this.state.govActionDeposit, last_gov_action_hash : this.state.govActionHash, metadata_url : this.state.cip95MetadataURL, metadata_hash : this.state.cip95MetadataHash}) }>.submitTx()</button>

                        </div>
                    } />
                    <Tabs.Expander />
                </Tabs>
                <p><span style={{fontWeight: "bold"}}>CborHex Tx: </span>{this.state.cip95ResultTx}</p>
                <p><span style={{fontWeight: "bold"}}>Tx Hash: </span>{this.state.cip95ResultHash}</p>
                <p><span style={{fontWeight: "bold"}}>Witnesses: </span>{this.state.cip95ResultWitness}</p>

                <hr style={{marginTop: "40px", marginBottom: "40px"}}/>

            </div>
        )
    }
}
