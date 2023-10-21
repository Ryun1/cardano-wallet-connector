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
    Certificate,
    PublicKey,
    RewardAddress,
    Ed25519KeyHash,
    CertificatesBuilder,
    VoteDelegation,
    DRep,
    Anchor,
    DrepRegistration,
    DrepUpdate,
    DrepDeregistration,
    VotingBuilder,
    Voter,
    GovernanceActionId,
    TransactionHash,
    VotingProcedure,
    VotingProposalBuilder,
    VotingProposal,
    NewConstitutionAction,
    Constitution,
    AnchorDataHash,
    URL,
    StakeRegistration,
    StakeDeregistration,
    GovernanceAction,
    InfoAction,
    TreasuryWithdrawals,
    TreasuryWithdrawalsAction,
    UpdateCommitteeAction,
    Committee,
    UnitInterval,
    Credentials,
    NoConfidenceAction,
    ParameterChangeAction,
    ProtocolParamUpdate,
    HardForkInitiationAction,
    ProtocolVersion,
} from "@emurgo/cardano-serialization-lib-asmjs"
import "./App.css";
let Buffer = require('buffer/').Buffer

class App extends React.Component {
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
            balance: undefined,
            changeAddress: undefined,
            rewardAddress: undefined,
            usedAddress: undefined,
            assetNameHex: "4c494645",
            // CIP-95 Stuff
            supportedExtensions: [],
            enabledExtensions: [],
            selected95BasicTabId: "1",
            selected95ActionsTabId: "1",
            selected95MiscTabId: "1",
            selectedCIP95: true,
            // Keys
            dRepKey: undefined,
            dRepID: undefined,
            dRepIDBech32: undefined,
            regStakeKeys: [],
            unregStakeKeys: [],
            regStakeKey: undefined,
            unregStakeKey: undefined,
            regStakeKeyHashHex: undefined,
            unregStakeKeyHashHex: undefined,
            // Txs
            cip95ResultTx: "",
            cip95ResultHash: "",
            cip95ResultWitness: "",
            cip95MetadataURL: undefined,
            cip95MetadataHash: undefined,
            certBuilder: undefined,
            votingBuilder: undefined,
            govActionBuilder: undefined,
            // Certs
            voteDelegationTarget: "",
            voteDelegationStakeCred: "",
            dRepRegTarget: "",
            voteGovActionTxHash: "",
            voteGovActionIndex: "",
            voteChoice: "",
            stakeKeyReg: "",
            stakeKeyUnreg: "",
            // Gov actions
            constURL: "",
            constHash: "",
            treasuryTarget: "",
            treasuryAmount: "",
            hardForkUpdateMajor: "",
            hardForkUpdateMinor: "",
        }

        /**
         * When the wallet is connect it returns the connector which is
         * written to this API variable and all the other operations
         * run using this API object
         */
        this.API = undefined;

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
            votingProposalDeposit: "0",
        }
        this.pollWallets = this.pollWallets.bind(this);
    }

    /**
     * Poll the wallets it can read from the browser.
     * Sometimes the html document loads before the browser initialized browser plugins (like Nami or Flint).
     * So we try to poll the wallets 3 times (with 1 second in between each try).
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

    handleWalletSelect = (obj) => {
        const whichWalletSelected = obj.target.value
        this.setState({whichWalletSelected},
            () => {
                this.refreshData()
            })
    }

    checkIfWalletFound = () => {
        const walletKey = this.state.whichWalletSelected;
        const walletFound = !!window?.cardano?.[walletKey];
        this.setState({walletFound})
        return walletFound;
    }

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

    enableWallet = async () => {
        const walletKey = this.state.whichWalletSelected;
        try {
            this.API = await window.cardano[walletKey].enable();
        } catch(err) {
            console.log(err);
        }
        return this.checkIfWalletEnabled();
    }

    getAPIVersion = () => {
        const walletKey = this.state.whichWalletSelected;
        const walletAPIVersion = window?.cardano?.[walletKey].apiVersion;
        this.setState({walletAPIVersion})
        return walletAPIVersion;
    }

    getWalletName = () => {
        const walletKey = this.state.whichWalletSelected;
        const walletName = window?.cardano?.[walletKey].name;
        this.setState({walletName})
        return walletName;
    }

    getSupportedExtensions = () => {
        const walletKey = this.state.whichWalletSelected;
        let supportedExtensions = [];
        try {
            supportedExtensions = window?.cardano?.[walletKey]?.supportedExtensions;
        } catch (err) {
            console.log("Error getting supported extensions")
            console.log(err)
        }
        this.setState({supportedExtensions})
    }

    getEnabledExtensions = async () => {
        try {
            const enabledExtensions = await this.API.getExtensions();
            this.setState({enabledExtensions})
        } catch (err) {
            console.log(err)
        }
    }

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

    getBalance = async () => {
        try {
            const balanceCBORHex = await this.API.getBalance();
            const balance = Value.from_bytes(Buffer.from(balanceCBORHex, "hex")).coin().to_str();
            this.setState({balance})
        } catch (err) {
            console.log(err)
        }
    }

    getChangeAddress = async () => {
        try {
            const raw = await this.API.getChangeAddress();
            const changeAddress = Address.from_bytes(Buffer.from(raw, "hex")).to_bech32()
            this.setState({changeAddress})
        } catch (err) {
            console.log(err)
        }
    }

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

    getUsedAddresses = async () => {
        try {
            const raw = await this.API.getUsedAddresses();
            const rawFirst = raw[0];
            const usedAddress = Address.from_bytes(Buffer.from(rawFirst, "hex")).to_bech32()
            this.setState({usedAddress})

        } catch (err) {
            console.log(err)
        }
    }

    checkIfCIP95MethodsAvailable = async () => {
        const hasCIP95Methods = ( 
            this.API.cip95.hasOwnProperty('getPubDRepKey') 
            && this.API.cip95.hasOwnProperty('getRegisteredPubStakeKeys')
            && this.API.cip95.hasOwnProperty('getUnregisteredPubStakeKeys'));
        return hasCIP95Methods;
    }

    refreshCIP30State = async () => {
        await this.setState({
            Utxos: null,
            balance: null,
            changeAddress: null,
            rewardAddress: null,
            usedAddress: null,
            supportedExtensions: [],
            enabledExtensions: [],
        });
    }

    refreshCIP95State = async () => {
        await this.setState({
            // Keys
            dRepKey: undefined,
            dRepID: undefined,
            dRepIDBech32: undefined,
            regStakeKeys: [],
            unregStakeKeys: [],
            regStakeKey: undefined,
            unregStakeKey: undefined,
            regStakeKeyHashHex: undefined,
            unregStakeKeyHashHex: undefined,
            // Txs
            cip95ResultTx: "",
            cip95ResultHash: "",
            cip95ResultWitness: "",
            cip95MetadataURL: undefined,
            cip95MetadataHash: undefined,
            certBuilder: undefined,
            votingBuilder: undefined,
            govActionBuilder: undefined,
            // Certs
            voteDelegationTarget: "",
            voteDelegationStakeCred: "",
            dRepRegTarget: "",
            voteGovActionTxHash: "",
            voteGovActionIndex: "",
            voteChoice: "",
            stakeKeyReg: "",
            stakeKeyUnreg: "",
            // Gov actions
            constURL: "",
            constHash: "",
            treasuryTarget: "",
            treasuryAmount: "",
            hardForkUpdateMajor: "",
            hardForkUpdateMinor: "",
        });
    }

    /**
     * Refresh all the data from the user's wallet
     * @returns {Promise<void>}
     */
    refreshData = async () => {
        try {
            const walletFound = this.checkIfWalletFound();
            // If wallet found and CIP-95 selected perform CIP-30 initial API calls
            if (walletFound) {
                await this.getAPIVersion();
                await this.getWalletName();
                this.getSupportedExtensions();
                // If CIP-95 checkbox selected attempt to connect to wallet with CIP-95
                let walletEnabled;
                let hasCIP95Methods;
                if (this.state.selectedCIP95) {
                    walletEnabled = await this.enableCIP95Wallet();
                    hasCIP95Methods = await this.checkIfCIP95MethodsAvailable();
                } else {
                    // else connect to wallet without CIP-95
                    walletEnabled = await this.enableWallet()
                    await this.refreshCIP95State();
                }
                // If wallet is enabled/connected
                if (walletEnabled) {
                    // CIP-30 API calls
                    await this.getNetworkId();
                    await this.getUtxos();
                    await this.getBalance();
                    await this.getChangeAddress();
                    await this.getRewardAddresses();
                    await this.getUsedAddresses();
                    await this.getEnabledExtensions();
                    // If connection was CIP95 and wallet has CIP95 methods
                    if (hasCIP95Methods) {
                        // CIP-95 API calls
                        await this.getPubDRepKey();
                        await this.getRegisteredPubStakeKeys();
                        await this.getUnregisteredPubStakeKeys();
                    }
                // else if connection failed, reset all state
                } else {
                    this.setState({walletIsEnabled: false})
                    await this.refreshCIP30State();
                    await this.refreshCIP95State();
                }
            // else if there are no wallets found, reset all state
            } else {
                this.setState({walletIsEnabled: false})
                await this.refreshCIP30State();
                await this.refreshCIP95State();
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

    getPubDRepKey = async () => {
        try {
            // From wallet get pub DRep key 
            const dRepKey = await this.API.cip95.getPubDRepKey();
            const dRepID = (PublicKey.from_hex(dRepKey)).hash();
            this.setState({dRepKey});
            this.setState({dRepID : dRepID.to_hex()});
            const dRepIDBech32 = dRepID.to_bech32('drep');
            this.setState({dRepIDBech32});
            // Default use the wallet's DRepID for DRep registration
            this.setState({dRepRegTarget: dRepIDBech32});
            // Default use the wallet's DRepID for Vote delegation target
            this.setState({voteDelegationTarget: dRepIDBech32});
        } catch (err) {
            console.log(err)
        }
    }

    getRegisteredPubStakeKeys = async () => {
        try {
            const raw = await this.API.cip95.getRegisteredPubStakeKeys();
            if (raw.length < 1){
                console.log("No Registered Pub Stake Keys");
            } else {
                // Set array
                const regStakeKeys = raw;
                this.setState({regStakeKeys})
                // Just use the first key for now 
                const regStakeKey = regStakeKeys[0];
                this.setState({regStakeKey})
                // Hash the stake key
                const stakeKeyHash = ((PublicKey.from_hex(regStakeKey)).hash()).to_hex();
                this.setState({regStakeKeyHashHex: stakeKeyHash});
                // Set default stake key for vote delegation to the first registered key
                this.setState({voteDelegationStakeCred : stakeKeyHash});
                // Set default stake key to unregister as the first registered key
                this.setState({stakeKeyUnreg : stakeKeyHash});
            }
        } catch (err) {
            console.log(err)
        }
    }

    getUnregisteredPubStakeKeys = async () => {
        try {
            const raw = await this.API.cip95.getUnregisteredPubStakeKeys();
            if (raw.length < 1){
                // console.log("No Registered Pub Stake Keys");
            } else {
                // Set array
                const unregStakeKeys = raw;
                this.setState({unregStakeKeys})
                // Just use the first key for now 
                const unregStakeKey = unregStakeKeys[0];
                this.setState({unregStakeKey})
                // Hash the stake key
                const stakeKeyHash = ((PublicKey.from_hex(unregStakeKey)).hash()).to_hex();
                this.setState({unregStakeKeyHashHex: stakeKeyHash});
                // Set default stake key to register as the first unregistered key
                this.setState({stakeKeyReg : stakeKeyHash});
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

    buildSubmitConwayTx = async (builderSuccess) => {
        try {
            // Abort if error before building Tx
            if (!(await builderSuccess)){
                throw "Error before building Tx, aborting Tx build."
            }
            // Initialize builder with protocol parameters
            const txBuilder = await this.initTransactionBuilder();
            // Add certs, votes or gov actions to the transaction
            if(this.state.certBuilder){
                txBuilder.set_certs_builder(this.state.certBuilder);
                this.setState({certBuilder : undefined});
            }
            if(this.state.votingBuilder){
                txBuilder.set_voting_builder(this.state.votingBuilder);
                this.setState({votingBuilder : undefined});
            }
            if(this.state.govActionBuilder){
                txBuilder.set_voting_proposal_builder(this.state.govActionBuilder);
                this.setState({govActionBuilder : undefined});
            }
            
            // Set output and change addresses to those of our wallet
            const shelleyOutputAddress = Address.from_bech32(this.state.usedAddress);
            const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress);
            
            // Add output of 3 ADA to the address of our wallet
            // 3 is used incase of Stake key deposit refund
            txBuilder.add_output(
                TransactionOutput.new(
                    shelleyOutputAddress,
                    Value.new(BigNum.from_str("3000000"))
                ),
            );
            // Find the available UTxOs in the wallet and use them as Inputs for the transaction
            await this.getUtxos();
            const txUnspentOutputs = await this.getTxUnspentOutputs();
            // Use UTxO selection strategy 2
            txBuilder.add_inputs_from(txUnspentOutputs, 2)

            // Set change address, incase too much ADA provided for fee
            txBuilder.add_change_if_needed(shelleyChangeAddress)
            // Build transaction body
            const txBody = txBuilder.build();
            // Make a full transaction, passing in empty witness set
            const transactionWitnessSet = TransactionWitnessSet.new();
            const tx = Transaction.new(
                txBody,
                TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes()),
            );

            // Ask wallet to to provide signature (witnesses) for the transaction
            let txVkeyWitnesses;
            txVkeyWitnesses = await this.API.signTx(Buffer.from(tx.to_bytes(), "utf8").toString("hex"), true);
            // Create witness set object using the witnesses provided by the wallet
            txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));
            transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());
            // Build transaction with witnesses
            const signedTx = Transaction.new(
                tx.body(),
                transactionWitnessSet,
            );
            
            console.log("SignedTx: ", Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"))
            // console.log("Signed Tx: ", signedTx.to_json());
            
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
            // Reset anchor state
            this.setState({cip95MetadataURL : undefined});
            this.setState({cip95MetadataHash : undefined});

        } catch (err) {
            console.log("Error during build, sign and submit transaction");
            console.log(err);
            await this.refreshData();
        }
    }

    buildStakeKeyRegCert = async () => {
        try {
            const certBuilder = CertificatesBuilder.new();
            const stakeKeyHash = Ed25519KeyHash.from_hex(this.state.stakeKeyReg);
            const stakeKeyRegCert = StakeRegistration.new(Credential.from_keyhash(stakeKeyHash));
            // Add cert to txbuilder
            certBuilder.add(Certificate.new_stake_registration(stakeKeyRegCert));
            this.setState({certBuilder : certBuilder});
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    buildStakeKeyUnregCert = async () => {
        try {
            const certBuilder = CertificatesBuilder.new();
            const stakeKeyHash = Ed25519KeyHash.from_hex(this.state.stakeKeyUnreg);
            const stakeKeyUnregCert = StakeDeregistration.new(Credential.from_keyhash(stakeKeyHash));
            // Add cert to txbuilder
            certBuilder.add(Certificate.new_stake_deregistration(stakeKeyUnregCert));
            this.setState({certBuilder : certBuilder});
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    buildVoteDelegationCert = async () => {
        try {
            // Build Vote Delegation Certificate using wallets stake credential
            const certBuilder = CertificatesBuilder.new();
            const stakeCred = await this.handleInputToCredential(this.state.voteDelegationStakeCred);
            // Create correct DRep
            let targetDRep
            if ((this.state.voteDelegationTarget).toUpperCase() === 'ABSTAIN') {
                targetDRep = DRep.new_always_abstain();
            } else if ((this.state.voteDelegationTarget).toUpperCase() === 'NO CONFIDENCE') {
                targetDRep = DRep.new_always_no_confidence();
            } else {
                const dRepKeyCred = await this.handleInputToCredential(this.state.voteDelegationTarget)
                targetDRep = DRep.new_key_hash(dRepKeyCred.to_keyhash());
            };
            // Create cert object
            const voteDelegationCert = VoteDelegation.new(stakeCred, targetDRep);
            // add cert to txbuilder
            certBuilder.add(Certificate.new_vote_delegation(voteDelegationCert));
            this.setState({certBuilder : certBuilder});
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    handleInputToCredential = async (input) => {
        try {
          const keyHash = Ed25519KeyHash.from_hex(input);
          const cred = Credential.from_keyhash(keyHash);
          return cred;
        } catch (err1) {
          try {
            const keyHash = Ed25519KeyHash.from_bech32(input);
            const cred = Credential.from_keyhash(keyHash);
            return cred;
          } catch (err2) {
            console.error('Error in parsing credential, not Hex or Bech32:', err1, err2);
            return null;
          }
        }
    }

    buildDRepRegCert = async () => {
        try {
            // Build DRep Registration Certificate
            const certBuilder = CertificatesBuilder.new();
            const dRepCred = await this.handleInputToCredential(this.state.dRepRegTarget);
            let dRepRegCert;
            // If there is an anchor
            if (this.state.cip95MetadataURL && this.state.cip95MetadataHash) {
                const anchorURL = URL.new(this.state.cip95MetadataURL);
                const anchorHash = AnchorDataHash.from_hex(this.state.cip95MetadataHash);
                const anchor = Anchor.new(anchorURL, anchorHash);
                // Create cert object
                dRepRegCert = DrepRegistration.new_with_anchor(
                    dRepCred,
                    BigNum.from_str("0"),
                    anchor
                );
            } else {
                dRepRegCert = DrepRegistration.new(
                    dRepCred,
                    BigNum.from_str("0"),
                );
            };
            // add cert to certbuilder
            certBuilder.add(Certificate.new_drep_registration(dRepRegCert));
            this.setState({certBuilder : certBuilder});
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    buildDRepUpdateCert = async () => {
        try {
            // Build DRep Registration Certificate
            const certBuilder = CertificatesBuilder.new();
            // Use the wallet's DRep ID
            const dRepKeyHash = Ed25519KeyHash.from_hex(this.state.dRepID);
            const dRepCred = Credential.from_keyhash(dRepKeyHash);
            let dRepUpdateCert;
            // If there is an anchor
            if (this.state.cip95MetadataURL && this.state.cip95MetadataHash) {
                const anchorURL = URL.new(this.state.cip95MetadataURL);
                const anchorHash = AnchorDataHash.from_hex(this.state.cip95MetadataHash);
                const anchor = Anchor.new(anchorURL, anchorHash);
                // Create cert object
                dRepUpdateCert = DrepUpdate.new_with_anchor(
                    dRepCred,
                    anchor
                );
            } else {
                dRepUpdateCert = DrepUpdate.new(
                    dRepCred,
                );
            };
            // add cert to certbuilder
            certBuilder.add(Certificate.new_drep_update(dRepUpdateCert));
            this.setState({certBuilder : certBuilder});
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    buildDRepRetirementCert = async () => {
        try {
            // Build DRep Registration Certificate
            const certBuilder = CertificatesBuilder.new();
            // Use the wallet's DRep ID
            const dRepKeyHash = Ed25519KeyHash.from_hex(this.state.dRepID);
            const dRepCred = Credential.from_keyhash(dRepKeyHash);
            const dRepRetirementCert = DrepDeregistration.new(
                dRepCred,
                BigNum.from_str("0"),
            );
            // add cert to certbuilder
            certBuilder.add(Certificate.new_drep_deregistration(dRepRetirementCert));
            this.setState({certBuilder : certBuilder});
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    buildVote = async () => {
        try {
            // Use wallet's DRep key
            const dRepKeyHash = Ed25519KeyHash.from_hex(this.state.dRepID);
            const voter = Voter.new_drep(Credential.from_keyhash(dRepKeyHash))
            // What is being voted on
            const govActionId = GovernanceActionId.new(
                TransactionHash.from_hex(this.state.voteGovActionTxHash), this.state.voteGovActionIndex);
            // Voting choice
            let votingChoice;
            if ((this.state.voteChoice).toUpperCase() === "YES") {
                votingChoice = 1
            } else if ((this.state.voteChoice).toUpperCase() === "NO") {
                votingChoice = 0
            } else if ((this.state.voteChoice).toUpperCase() === "ABSTAIN") {
                votingChoice = 2
            }
            let votingProcedure;
            if (this.state.cip95MetadataURL && this.state.cip95MetadataHash) {
                const anchorURL = URL.new(this.state.cip95MetadataURL);
                const anchorHash = AnchorDataHash.from_hex(this.state.cip95MetadataHash);
                const anchor = Anchor.new(anchorURL, anchorHash);
                votingProcedure = VotingProcedure.new_with_anchor(votingChoice, anchor);
            } else {
                votingProcedure = VotingProcedure.new(votingChoice);
            };
            // Add vote to vote builder
            const votingBuilder = VotingBuilder.new();
            votingBuilder.add(voter, govActionId, votingProcedure);
            this.setState({votingBuilder});
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    buildNewConstGovAct = async () => {
        try {
            // Create new constitution gov action
            const constURL = URL.new(this.state.constURL);
            const constDataHash = AnchorDataHash.from_hex(this.state.constHash);
            const constAnchor = Anchor.new(constURL, constDataHash);
            // Create new constitution governance action
            const constChange = NewConstitutionAction.new(Constitution.new(constAnchor));
            const constChangeGovAct = GovernanceAction.new_new_constitution_action(constChange);
            // Create anchor and then reset state
            const anchorURL = URL.new(this.state.cip95MetadataURL);
            const anchorHash = AnchorDataHash.from_hex(this.state.cip95MetadataHash);
            const anchor = Anchor.new(anchorURL, anchorHash);
            // Lets just use the connect wallet's reward address
            const rewardAddr = RewardAddress.from_address(Address.from_bech32(this.state.rewardAddress));
            // Create voting proposal
            const votingProposal = VotingProposal.new(constChangeGovAct, anchor, rewardAddr, BigNum.from_str("0"))
            // Create gov action builder and set it in state
            const govActionBuilder = VotingProposalBuilder.new()
            govActionBuilder.add(votingProposal)
            this.setState({govActionBuilder});
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    buildNewInfoGovAct = async () => {
        try {
            // Create new info action
            const infoAction = InfoAction.new();
            const infoGovAct = GovernanceAction.new_info_action(infoAction);
            // Create anchor and then reset state
            const anchorURL = URL.new(this.state.cip95MetadataURL);
            const anchorHash = AnchorDataHash.from_hex(this.state.cip95MetadataHash);
            const anchor = Anchor.new(anchorURL, anchorHash);
            // Lets just use the connect wallet's reward address
            const rewardAddr = RewardAddress.from_address(Address.from_bech32(this.state.rewardAddress));
            // Create voting proposal
            const votingProposal = VotingProposal.new(infoGovAct, anchor, rewardAddr, BigNum.from_str("0"))
            // Create gov action builder and set it in state
            const govActionBuilder = VotingProposalBuilder.new()
            govActionBuilder.add(votingProposal)
            this.setState({govActionBuilder});
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    buildTreasuryGovAct = async () => {
        try {
            // take inputs
            const treasuryTarget = RewardAddress.from_address(Address.from_bech32(this.state.treasuryTarget));
            const myWithdrawal = BigNum.from_str(this.state.treasuryAmount);
            const withdrawals = (TreasuryWithdrawals.new())
            withdrawals.insert(treasuryTarget, myWithdrawal)
            // Create new treasury withdrawal gov act
            const treasuryAction = TreasuryWithdrawalsAction.new(withdrawals);
            const treasuryGovAct = GovernanceAction.new_treasury_withdrawals_action(treasuryAction);
            // Create anchor and then reset state
            const anchorURL = URL.new(this.state.cip95MetadataURL);
            const anchorHash = AnchorDataHash.from_hex(this.state.cip95MetadataHash);
            const anchor = Anchor.new(anchorURL, anchorHash);
            // Lets just use the connect wallet's reward address
            const rewardAddr = RewardAddress.from_address(Address.from_bech32(this.state.rewardAddress));
            // Create voting proposal
            const votingProposal = VotingProposal.new(treasuryGovAct, anchor, rewardAddr, BigNum.from_str("0"))
            // Create gov action builder and set it in state
            const govActionBuilder = VotingProposalBuilder.new()
            govActionBuilder.add(votingProposal)
            this.setState({govActionBuilder});
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    buildUpdateCommitteeGovAct = async () => {
        try {
            // Create new committee quorum threshold
            const threshold = UnitInterval.new(BigNum.from_str("1"), BigNum.from_str("2"));
            const newCommittee = Committee.new(threshold);
            // temp: propose new committee which is the wallet's stake key, with expiry of 1000 epoch 
            const stakeCred = Credential.from_keyhash(Ed25519KeyHash.from_hex(this.state.regStakeKeyHashHex))
            newCommittee.add_member(stakeCred, 1000)
            // Create new committee gov action
            const updateComAction = UpdateCommitteeAction.new(newCommittee, Credentials.new());
            const updateComGovAct = GovernanceAction.new_new_committee_action(updateComAction);

            // Create anchor and then reset state
            const anchorURL = URL.new(this.state.cip95MetadataURL);
            const anchorHash = AnchorDataHash.from_hex(this.state.cip95MetadataHash);
            const anchor = Anchor.new(anchorURL, anchorHash);
            // Lets just use the connect wallet's reward address
            const rewardAddr = RewardAddress.from_address(Address.from_bech32(this.state.rewardAddress));
            // Create voting proposal
            const votingProposal = VotingProposal.new(updateComGovAct, anchor, rewardAddr, BigNum.from_str("0"))
            // Create gov action builder and set it in state
            const govActionBuilder = VotingProposalBuilder.new()
            govActionBuilder.add(votingProposal)
            this.setState({govActionBuilder});
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    buildMotionOfNoConfidenceAction = async () => {
        try {
            // Create motion of no confidence gov action
            const noConfidenceAction = NoConfidenceAction.new();
            const noConfidenceGovAct = GovernanceAction.new_no_confidence_action(noConfidenceAction);
            // Create anchor and then reset state
            const anchorURL = URL.new(this.state.cip95MetadataURL);
            const anchorHash = AnchorDataHash.from_hex(this.state.cip95MetadataHash);
            const anchor = Anchor.new(anchorURL, anchorHash);
            // Lets just use the connect wallet's reward address
            const rewardAddr = RewardAddress.from_address(Address.from_bech32(this.state.rewardAddress));
            // Create voting proposal
            const votingProposal = VotingProposal.new(noConfidenceGovAct, anchor, rewardAddr, BigNum.from_str("0"))
            // Create gov action builder and set it in state
            const govActionBuilder = VotingProposalBuilder.new()
            govActionBuilder.add(votingProposal)
            this.setState({govActionBuilder});
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    buildProtocolParamAction = async () => {
        try {
            // Placeholder just do key deposit for now
            const protocolParmUpdate = ProtocolParamUpdate.new();
            protocolParmUpdate.set_key_deposit(BigNum.from_str("0"));
            // Create param change gov action
            const parameterChangeAction = ParameterChangeAction.new(protocolParmUpdate);
            const parameterChangeGovAct = GovernanceAction.new_parameter_change_action(parameterChangeAction);
            // Create anchor and then reset state
            const anchorURL = URL.new(this.state.cip95MetadataURL);
            const anchorHash = AnchorDataHash.from_hex(this.state.cip95MetadataHash);
            const anchor = Anchor.new(anchorURL, anchorHash);
            // Lets just use the connect wallet's reward address
            const rewardAddr = RewardAddress.from_address(Address.from_bech32(this.state.rewardAddress));
            // Create voting proposal
            const votingProposal = VotingProposal.new(parameterChangeGovAct, anchor, rewardAddr, BigNum.from_str("0"))
            // Create gov action builder and set it in state
            const govActionBuilder = VotingProposalBuilder.new()
            govActionBuilder.add(votingProposal)
            this.setState({govActionBuilder});
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    buildHardForkAction = async () => {
        try {
            const nextProtocolVerion = ProtocolVersion.new(this.state.hardForkUpdateMajor, this.state.hardForkUpdateMinor);
            // Create HF Initiation Action
            const hardForkInitiationAction = HardForkInitiationAction.new(nextProtocolVerion);
            const hardForkInitiationGovAct = GovernanceAction.new_hard_fork_initiation_action(hardForkInitiationAction);
            // Create anchor and then reset state
            const anchorURL = URL.new(this.state.cip95MetadataURL);
            const anchorHash = AnchorDataHash.from_hex(this.state.cip95MetadataHash);
            const anchor = Anchor.new(anchorURL, anchorHash);
            // Lets just use the connect wallet's reward address
            const rewardAddr = RewardAddress.from_address(Address.from_bech32(this.state.rewardAddress));
            // Create voting proposal
            const votingProposal = VotingProposal.new(hardForkInitiationGovAct, anchor, rewardAddr, BigNum.from_str("0"))
            // Create gov action builder and set it in state
            const govActionBuilder = VotingProposalBuilder.new()
            govActionBuilder.add(votingProposal)
            this.setState({govActionBuilder});
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async componentDidMount() {
        this.pollWallets();
        await this.refreshData();
    }

    render(){
        return (
            <div style={{margin: "20px"}}>

                <h1>✨demos CIP-95 dApp✨</h1>
                <h4>✨v1.5.6✨</h4>

                <input type="checkbox" checked={this.state.selectedCIP95} onChange={this.handleCIP95Select}/> Enable CIP-95?

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
                <hr style={{marginTop: "10px", marginBottom: "10px"}}/>
                <h3>CIP-30 Initial API</h3>
                <p><span style={{fontWeight: "bold"}}>Wallet Found: </span>{`${this.state.walletFound}`}</p>
                <p><span style={{fontWeight: "bold"}}>Wallet Connected: </span>{`${this.state.walletIsEnabled}`}</p>
                <p><span style={{fontWeight: "bold"}}>Wallet API version: </span>{this.state.walletAPIVersion}</p>
                <p><span style={{fontWeight: "bold"}}>Wallet name: </span>{this.state.walletName}</p>
                <p><span style={{ fontWeight: "bold" }}>.getSupportedExtensions():</span></p>
                <ul>{this.state.supportedExtensions && this.state.supportedExtensions.length > 0 ? this.state.supportedExtensions.map((item, index) => ( <li style={{ fontSize: "12px" }} key={index}>{item.cip}</li>)) : <li>No supported extensions found.</li>}</ul>
                <h3>CIP-30 Full API</h3>
                <p><span style={{fontWeight: "bold"}}>Network Id (0 = testnet; 1 = mainnet): </span>{this.state.networkId}</p>
                <p><span style={{fontWeight: "bold"}}>.getUTxOs(): </span>{this.state.Utxos?.map(x => <li style={{fontSize: "10px"}} key={`${x.str}${x.multiAssetStr}`}>{`${x.str}${x.multiAssetStr}`}</li>)}</p>
                <p style={{paddingTop: "10px"}}><span style={{fontWeight: "bold"}}>Balance: </span>{this.state.balance}</p>
                <p><span style={{fontWeight: "bold"}}>.getChangeAddress(): </span>{this.state.changeAddress}</p>
                <p><span style={{fontWeight: "bold"}}>.getRewardsAddress(): </span>{this.state.rewardAddress}</p>
                <p><span style={{fontWeight: "bold"}}>.getUsedAddresses(): </span>{this.state.usedAddress}</p>
                <p><span style={{ fontWeight: "bold" }}>.getExtensions():</span></p>
                <ul>{this.state.enabledExtensions && this.state.enabledExtensions.length > 0 ? this.state.enabledExtensions.map((item, index) => ( <li style={{ fontSize: "12px" }} key={index}>{item.cip}</li>)) : <li>No extensions enabled.</li>}</ul>
                <hr style={{marginTop: "40px", marginBottom: "10px"}}/>
                <h1>CIP-95 🤠</h1>
                <p><span style={{fontWeight: "bold"}}>.cip95.getPubDRepKey(): </span>{this.state.dRepKey}</p>
                <p><span style={{fontWeight: "lighter"}}>Hex DRep ID (Pub DRep Key hash): </span>{this.state.dRepID}</p>
                <p><span style={{fontWeight: "lighter"}}>Bech32 DRep ID (Pub DRep Key hash): </span>{this.state.dRepIDBech32}</p>
                <p><span style={{ fontWeight: "bold" }}>.cip95.getRegisteredPubStakeKeys():</span></p>
                <ul>{this.state.regStakeKeys && this.state.regStakeKeys.length > 0 ? this.state.regStakeKeys.map((item, index) => ( <li style={{ fontSize: "12px" }} key={index}>{item}</li>)) : <li>No registered public stake keys returned.</li>}</ul>
                <p><span style={{fontWeight: "lighter"}}> First registered Stake Key Hash (hex): </span>{this.state.regStakeKeyHashHex}</p>
                <p><span style={{ fontWeight: "bold" }}>.cip95.getUnregisteredPubStakeKeys():</span></p>
                <ul>{this.state.regStakeKeys && this.state.unregStakeKeys.length > 0 ? this.state.unregStakeKeys.map((item, index) => ( <li style={{ fontSize: "12px" }} key={index}>{item}</li>)) : <li>No unregistered public stake keys returned.</li>}</ul>
                <p><span style={{fontWeight: "lighter"}}> First unregistered Stake Key Hash (hex): </span>{this.state.unregStakeKeyHashHex}</p>
                
                <hr style={{marginTop: "10px", marginBottom: "10px"}}/>
                <p><span style={{fontWeight: "bold"}}>Use CIP-95 .signTx(): </span></p>
                <p><span style={{fontWeight: "lighter"}}> Basic Governance Functions</span></p>
                <Tabs id="cip95-basic" vertical={true} onChange={this.handle95TabId} selectedTab95Id={this.state.selected95BasicTabId}>
                    <Tab id="1" title="🦸‍♀️ Vote Delegation" panel={
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
                            <FormGroup
                                label="Stake Credential:"
                                helperText="(Bech32 or Hex encoded)"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({voteDelegationStakeCred: event.target.value})}
                                    value={this.state.voteDelegationStakeCred}
                                />
                            </FormGroup>

                            <button style={{padding: "10px"}} onClick={ () => this.buildSubmitConwayTx(this.buildVoteDelegationCert())}>Build, .signTx() and .submitTx()</button>
                        </div>
                    } />
                    <Tab id="2" title="👷‍♂️ DRep Registration" panel={
                        <div style={{marginLeft: "20px"}}>

                            <FormGroup
                                label="DRep ID:"
                                helperText="(Bech32 or Hex encoded)"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({dRepRegTarget: event.target.value})}
                                    value={this.state.dRepRegTarget}
                                />
                            </FormGroup>

                            <FormGroup
                                helperText=""
                                label="Optional: Metadata URL"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({cip95MetadataURL: event.target.value})}
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
                                />
                            </FormGroup>

                            <button style={{padding: "10px"}} onClick={ () => this.buildSubmitConwayTx(this.buildDRepRegCert())}>Build, .signTx() and .submitTx()</button>
                        </div>
                    } />
                    <Tab id="3" title="💫 DRep Update" panel={
                        <div style={{marginLeft: "20px"}}>
                                                        <FormGroup
                                helperText=""
                                label="Optional: Metadata URL"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({cip95MetadataURL: event.target.value})}
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
                                />
                            </FormGroup>

                            <button style={{padding: "10px"}} onClick={ () => this.buildSubmitConwayTx(this.buildDRepUpdateCert())}>Build, .signTx() and .submitTx()</button>
                        </div>
                    } />

                    <Tab id="4" title="👴 DRep Retirement" panel={
                        <div style={{marginLeft: "20px"}}>
                            <button style={{padding: "10px"}} onClick={ () => this.buildSubmitConwayTx(this.buildDRepRetirementCert())}>Build, .signTx() and .submitTx()</button>
                        </div>
                    } />
                    <Tab id="5" title="🗳 Vote" panel={
                        <div style={{marginLeft: "20px"}}>

                            <FormGroup
                                helperText=""
                                label="Gov Action Tx Hash"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({voteGovActionTxHash: event.target.value})}
                                />
                            </FormGroup>

                            <FormGroup
                                helperText=""
                                label="Gov Action Tx Vote Index"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({voteGovActionTxIndex: event.target.value})}
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
                                />
                            </FormGroup>

                            <FormGroup
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
                                />
                            </FormGroup>
                            <button style={{padding: "10px"}} onClick={ () => this.buildSubmitConwayTx(this.buildVote())}>Build, .signTx() and .submitTx()</button>
                        </div>
                    } />
                    <Tabs.Expander />
                </Tabs>
                <hr style={{marginTop: "10px", marginBottom: "10px"}}/>

                <p><span style={{fontWeight: "bold"}}>Use CIP-95 .signTx(): </span></p>
                <p><span style={{fontWeight: "lighter"}}> Governance Actions</span></p>

                <Tabs id="cip95-actions" vertical={true} onChange={this.handle95TabId} selectedTab95Id={this.state.selected95ActionsTabId}>
                    <Tab id="1" title="💡 Governance Action: Motion of no-confidence" panel={
                        <div style={{marginLeft: "20px"}}>

                            <FormGroup
                                label="Metadata URL"
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
                                label="Metadata Hash"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({cip95MetadataHash: event.target.value})}
                                />
                            </FormGroup>
                            <button style={{padding: "10px"}} onClick={ () => this.buildSubmitConwayTx(this.buildMotionOfNoConfidenceAction()) }>Build, .signTx() and .submitTx()</button>

                        </div>
                    } />
                    <Tab id="2" title="[WIP] 💡 Governance Action: Update Constitutional Committee" panel={
                        <div style={{marginLeft: "20px"}}>

                            <FormGroup
                                label="Metadata URL"
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
                                label="Metadata Hash"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({cip95MetadataHash: event.target.value})}
                                />
                            </FormGroup>
                            <button style={{padding: "10px"}} onClick={ () => this.buildSubmitConwayTx(this.buildUpdateCommitteeGovAct()) }>Build, .signTx() and .submitTx()</button>

                        </div>
                    } />
                    <Tab id="3" title="💡 Governance Action: Update Constitution" panel={
                        <div style={{marginLeft: "20px"}}>

                            <FormGroup
                                label="New Constitution URL"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({constURL: event.target.value})}
                                />
                            </FormGroup>

                            <FormGroup
                                label="New Constituion Hash"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({constHash: event.target.value})}
                                />
                            </FormGroup>

                            <FormGroup
                                label="Metadata URL"
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
                                label="Metadata Hash"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({cip95MetadataHash: event.target.value})}
                                />
                            </FormGroup>
                            <button style={{padding: "10px"}} onClick={ () => this.buildSubmitConwayTx(this.buildNewConstGovAct()) }>Build, .signTx() and .submitTx()</button>

                        </div>
                    } />
                    <Tab id="4" title="[WIP] 💡 Governance Action: Hard-Fork Initation" panel={
                        <div style={{marginLeft: "20px"}}>

                            <FormGroup
                                helperText=""
                                label="Update Major Version"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({hardForkUpdateMajor: event.target.value})}
                                />
                            </FormGroup>

                            <FormGroup
                                helperText=""
                                label="Update Minor Version"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({hardForkUpdateMinor: event.target.value})}
                                />
                            </FormGroup>

                            <FormGroup
                                label="Metadata URL"
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
                                label="Metadata Hash"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({cip95MetadataHash: event.target.value})}
                                />
                            </FormGroup>
                            <button style={{padding: "10px"}} onClick={ () => this.buildSubmitConwayTx(this.buildHardForkAction()) }>Build, .signTx() and .submitTx()</button>

                        </div>
                    } />
                    <Tab id="5" title="[WIP] 💡 Governance Action: Protocol Parameter Update" panel={
                        <div style={{marginLeft: "20px"}}>

                            <FormGroup
                                label="Metadata URL"
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
                                label="Metadata Hash"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({cip95MetadataHash: event.target.value})}
                                />
                            </FormGroup>
                            <button style={{padding: "10px"}} onClick={ () => this.buildSubmitConwayTx(this.buildProtocolParamAction()) }>Build, .signTx() and .submitTx()</button>

                        </div>
                    } />
                    <Tab id="6" title="💡 Governance Action: Treasury Withdrawal" panel={
                        <div style={{marginLeft: "20px"}}>

                            <FormGroup
                                label="Treasury Withdrawal Target Rewards Address"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({treasuryTarget: event.target.value})}
                                />
                            </FormGroup>

                            <FormGroup
                                label="Treasury Withdrawal Amount"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({treasuryAmount: event.target.value})}
                                />
                            </FormGroup>

                            <FormGroup
                                label="Metadata URL"
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
                                label="Metadata Hash"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({cip95MetadataHash: event.target.value})}
                                />
                            </FormGroup>
                            <button style={{padding: "10px"}} onClick={ () => this.buildSubmitConwayTx(this.buildTreasuryGovAct()) }>Build, .signTx() and .submitTx()</button>

                        </div>
                    } />
                    <Tab id="7" title="💡 Governance Action: Info action" panel={
                        <div style={{marginLeft: "20px"}}>

                            <FormGroup
                                label="Metadata URL"
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
                                label="Metadata Hash"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({cip95MetadataHash: event.target.value})}
                                />
                            </FormGroup>
                            <button style={{padding: "10px"}} onClick={ () => this.buildSubmitConwayTx(this.buildNewInfoGovAct()) }>Build, .signTx() and .submitTx()</button>

                        </div>
                    } />

                    <Tabs.Expander />
                </Tabs>
                <hr style={{marginTop: "10px", marginBottom: "10px"}}/>

                <p><span style={{fontWeight: "bold"}}>Use CIP-95 .signTx(): </span></p>
                <p><span style={{fontWeight: "lighter"}}> Random Stuff</span></p>
                
                <Tabs id="cip95-misc" vertical={true} onChange={this.handle95TabId} selectedTab95Id={this.state.selected95MiscTabId}>
                    <Tab id="1" title="🔑 Register Stake Key" panel={
                        <div style={{marginLeft: "20px"}}>

                            <FormGroup
                                helperText=""
                                label="Stake Key Hash"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({stakeKeyReg : event.target.value})}
                                    value={this.state.stakeKeyReg}
                                />
                            </FormGroup>
                            <button style={{padding: "10px"}} onClick={ () => this.buildSubmitConwayTx(this.buildStakeKeyRegCert()) }>Build, .signTx() and .submitTx()</button>

                        </div>
                    } />
                    <Tab id="2" title="🚫🔑 Unregister Stake Key" panel={
                        <div style={{marginLeft: "20px"}}>

                            <FormGroup
                                helperText=""
                                label="Stake Key Hash"
                            >
                                <InputGroup
                                    disabled={false}
                                    leftIcon="id-number"
                                    onChange={(event) => this.setState({stakeKeyUnreg : event.target.value})}
                                    value={this.state.stakeKeyUnreg}
                                />
                            </FormGroup>
                            <button style={{padding: "10px"}} onClick={ () => this.buildSubmitConwayTx(this.buildStakeKeyUnregCert()) }>Build, .signTx() and .submitTx()</button>

                        </div>
                    } />
                    <Tab id="3" title=" 💯 Test Basic Transaction" panel={
                        <div style={{marginLeft: "20px"}}>

                            <button style={{padding: "10px"}} onClick={ () => this.buildSubmitConwayTx(true) }>Build, .signTx() and .submitTx()</button>

                        </div>
                    } />
                    <Tabs.Expander />
                </Tabs>
                
                <hr style={{marginTop: "10px", marginBottom: "10px"}}/>

                <p><span style={{fontWeight: "bold"}}>CborHex Tx: </span>{this.state.cip95ResultTx}</p>
                <p><span style={{fontWeight: "bold"}}>Tx Hash: </span>{this.state.cip95ResultHash}</p>
                <p><span style={{fontWeight: "bold"}}>Witnesses: </span>{this.state.cip95ResultWitness}</p>

                <hr style={{marginTop: "10px", marginBottom: "10px"}}/>
                
                <h5>✨Powered by CSL 12 alpha 11✨</h5>
            </div>
        )
    }
}

export default App;