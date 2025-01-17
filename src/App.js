import React from 'react'
import { Tab, Tabs, RadioGroup, Radio, FormGroup, InputGroup } from "@blueprintjs/core";
import "../node_modules/@blueprintjs/core/lib/css/blueprint.css";
import "../node_modules/@blueprintjs/icons/lib/css/blueprint-icons.css";
import "../node_modules/normalize.css/normalize.css";
import sanchoPParam from "./sanchoPParam.json"
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
    DRepRegistration,
    DRepUpdate,
    DRepDeregistration,
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
    ScriptHash,
    ChangeConfig,
    PlutusScript,
    PlutusWitness,
    PlutusScriptSource,
    Redeemer,
    RedeemerTag,
    ExUnits,
    PlutusData,
    PlutusMap,
    ExUnitPrices,
    PlutusScripts,
    Redeemers,
    Costmdls,
    CostModel,
    Language,
    Int,
    TxInputsBuilder,
} from "@emurgo/cardano-serialization-lib-asmjs"
import "./App.css";
import {
    buildStakeKeyRegCert,
    buildStakeKeyUnregCert,
    buildStakeVoteDelegCert,
    buildStakeRegDelegCert,
    buildStakeRegVoteDelegCert,
    buildStakeRegStakeVoteDelegCert,
    buildAuthorizeHotCredCert,
    buildResignColdCredCert,
    buildMIRCert,
    buildGenesisKeyDelegationCert,
} from './utils.js';
let { bech32 } = require('bech32')

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
            signAndSubmitError: undefined,
            buildingError: undefined,
            supportedExtensions: [],
            enabledExtensions: [],
            selected95BasicTabId: "1",
            selected95ActionsTabId: "1",
            selected95ComboTabId: "1",
            selected95MiscTabId: "1",
            selected95CCTabId: "1",
            selectedCIP95: true,
            // Keys
            dRepKey: undefined,
            cip105dRepID: undefined,
            cip105dRepIDBech32: undefined,
            cip129dRepID: undefined,
            cip129dRepIDBech32: undefined,
            regStakeKeys: [],
            unregStakeKeys: [],
            regStakeKey: undefined,
            unregStakeKey: undefined,
            regStakeKeyHashHex: undefined,
            unregStakeKeyHashHex: undefined,
            // Txs
            seeCombos: false,
            seeGovActs: false,
            seeCCCerts: false,
            seeMisc: false,
            certsInTx: [],
            votesInTx: [],
            govActsInTx: [],
            cip95ResultTx: "",
            cip95ResultHash: "",
            cip95ResultWitness: "",
            cip95MetadataURL: undefined,
            cip95MetadataHash: undefined,
            certBuilder: undefined,
            votingBuilder: undefined,
            govActionBuilder: undefined,
            treasuryDonationAmount: undefined,
            treasuryValueAmount: undefined,
            // Certs
            voteDelegationTarget: "",
            voteDelegationStakeCred: "",
            dRepRegTarget: "",
            dRepDeposit: "500000000",
            voteGovActionTxHash: "",
            voteGovActionIndex: "",
            voteChoice: "",
            stakeKeyReg: "",
            stakeKeyCoin: "2000000",
            stakeKeyWithCoin: false,
            stakeKeyUnreg: "",
            totalRefunds: undefined,
            // Deprecated Certs
            mirStakeCred: undefined,
            mirAmount: undefined,
            mirPot: undefined,
            genesisHash: undefined,
            genesisDelegationHash: undefined,
            vrfKeyHash: undefined,
            // Combo certs
            comboPoolHash: "",
            comboStakeCred: "",
            comboStakeRegCoin: "2000000",
            comboVoteDelegTarget: "",
            // Gov actions
            gaMetadataURL: "https://raw.githubusercontent.com/Ryun1/metadata/main/cip100/ga.jsonld",
            gaMetadataHash: "1805dc601b3b6fe259c646a94edb14d52534c09a0ee51e5ac502fa823b6a510c",
            constURL: "",
            constHash: "",
            treasuryTarget: "",
            treasuryWithdrawalAmount: undefined,
            hardForkUpdateMajor: "",
            hardForkUpdateMinor: "",
            committeeAdd: undefined,
            committeeExpiry: undefined,
            committeeRemove: undefined,
            committeeQuorum: undefined,
            govActDeposit: "100000000000",
            govActPrevActionHash: undefined,
            govActPrevActionIndex: undefined,
            guardRailsScriptHash: undefined,
            guardrailScriptUsed: false,
            guardrailScript: "59082f59082c0101003232323232323232323232323232323232323232323232323232323232323232323232323232323232323225932325333573466e1d2000001180098121bab357426ae88d55cf001054ccd5cd19b874801000460042c6aae74004dd51aba1357446ae88d55cf1baa325333573466e1d200a35573a00226ae84d5d11aab9e0011637546ae84d5d11aba235573c6ea800642b26006003149a2c8a4c3021801c0052000c00e0070018016006901e40608058c00e00290016007003800c00b0034830268320306007001800600690406d6204e00060001801c0052004c00e007001801600690404001e0006007001800600690404007e00060001801c0052006c00e006023801c006001801a4101000980018000600700148023003801808e0070018006006904827600060001801c005200ac00e0070018016006904044bd4060c00e003000c00d2080ade204c000c0003003800a4019801c00e003002c00d2080cab5ee0180c100d1801c005200ec00e0060238000c00e00290086007003800c00b003483d00e0306007001800600690500fe00040243003800a4025803c00c01a0103003800a4029803c00e003002c00cc07520d00f8079801c006001801980ea4120078001800060070014805b00780180360070018006006603e900a4038c0003003800a4041801c00c04601a3003800a4045801c00e003002c00d20f02e80c1801c006001801a4190cb80010090c00e00290126000c00e0029013600b003803c00e003002c00cc0752032c000c00e003000c00cc075200ac000c0006007007801c006005801980ea418170058001801c006001801980ea41209d80018000c0003003800a4051802c00e007003011c00e003000c00d2080e89226c000c0006007003801808e007001800600690406c4770b7e000600030000c00e0029015600b003801c00c047003800c00300348202e2e1cb00030001801c00e006023801c006001801a410181f905540580018000c0003003800a4059801c00c047003800c00300348203000700030000c00e00290176007003800c00b003483200603060070018006006904801e00040243003800a4061801c00c0430001801c0052032c016006003801801e00600780180140100c00e002901a600b003001c00c00f003003c00c00f003002c00c007003001c00c007003803c00e003002c00c0560184014802000c00e002901b6007003800c00b003480030034801b0001801c006001801a4029800180006007001480e3003801c006005801a4001801a40498000c00e003000c00d20ca04c00080486007001480eb00380180860070018006006900f600060001801c005203cc00e006015801c006001801a4101012bcf138c09800180006007001480fb003801805600700180060069040505bc3f482e00060001801c0052040c00e0070018016006900d4060c00e003000c00d204ac000c0003003800a4085801c00c04601630000000000200f003006c00e003000c00c05a0166000200f003005c00e003000c00c057003010c0006000200f003800c00b003012c00cc05d2028c0004008801c01e007001801600602380010043000400e003000c00c04b003011c0006000800c00b00300d8049001801600601d801980924190038000801c0060010066000801c00600900f6000800c00b003480030034820225eb0001003800c003003483403f0003000400c023000400e003000c00d208094ebdc03c000c001003009c001003300f4800b0004006005801a40058001001801401c6014900518052402860169004180424008600a900a180324005003480030001806240cc6016900d18052402460129004180424004600e900018032400c6014446666aae7c004a0005003328009aab9d0019aab9e0011aba100298019aba200224c6012444a6520071300149a4432005225900689802a4d2219002912c998099bad0020068ac99807002800c4cc03001c00e300244cc03001c02a3002012c801460012218010c00888004c004880094cc8c0040048848c8cc0088c00888c00800c8c00888c00400c8d4cc01001000cd400c0044888cc00c896400a300090999804c00488ccd5cd19b87002001800400a01522333573466e2000800600100291199ab9a33712004003000801488ccd5cd19b89002001801400244666ae68cdc4001000c00a001225333573466e240080044004400a44a666ae68cdc4801000880108008004dd6801484cc010004dd6001484c8ccc02a002452005229003912999ab9a3370e0080042666ae68cdc3801800c00200430022452005229003911980899b820040013370400400648a400a45200722333573466e20cdc100200099b82002003800400880648a400a45200722333573466e24cdc100200099b82002003801400091480148a400e44666ae68cdc419b8200400133704004007002800122593300e0020018800c400922593300e00200188014400400233323357346ae8cd5d10009198051bad357420066eb4d5d08011aba2001268001bac00214800c8ccd5cd1aba3001800400a444b26600c0066ae8400626600a0046ae8800630020c0148894ccd5cd19b87480000045854ccd5cd19b88001480004cc00ccdc0a400000466e05200000113280099b8400300199b840020011980200100098021112999ab9a3370e9000000880109980180099b860020012223300622590018c002443200522323300d225900189804803488564cc0140080322600800318010004b20051900991111111001a3201322222222005448964ce402e444444440100020018c00a30000002225333573466e1c00800460002a666ae68cdc48010008c010600445200522900391199ab9a3371266e08010004cdc1001001c0020041191800800918011198010010009",
            redeemers: undefined,
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
            minUtxo: "1000000",
            poolDeposit: "500000000",
            keyDeposit: "2000000",
            maxValSize: 5000,
            maxTxSize: 16384,
            priceMem: 0.0577,
            priceStep: 0.0000721,
            coinsPerUTxOByte: "4310",
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
    getCollaterals = async()=>{
        const rawUtxos = await this.API.getUtxos();
        return rawUtxos.map(rawUtxo=>{
            TransactionUnspentOutput.from_bytes(Buffer.from(rawUtxo, "hex"))
        })
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
            let address = Address.from_bytes(Buffer.from(raw, "hex"))
            const changeAddress = address.to_bech32(address.network_id == 0?"addr":"addr_test")
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
            cip105dRepID: undefined,
            cip105dRepIDBech32: undefined,
            cip129dRepID: undefined,
            cip129dRepIDBech32: undefined,
            regStakeKeys: [],
            unregStakeKeys: [],
            regStakeKey: undefined,
            unregStakeKey: undefined,
            regStakeKeyHashHex: undefined,
            unregStakeKeyHashHex: undefined,
            // Txs
            signAndSubmitError: undefined,
            buildingError: undefined,
            seeCombos: false,
            seeGovActs: false,
            seeMisc: false,
            certsInTx: [],
            votesInTx: [],
            govActsInTx: [],
            cip95ResultTx: "",
            cip95ResultHash: "",
            cip95ResultWitness: "",
            cip95MetadataURL: undefined,
            cip95MetadataHash: undefined,
            certBuilder: undefined,
            votingBuilder: undefined,
            govActionBuilder: undefined,
            treasuryDonationAmount: undefined,
            treasuryValueAmount: undefined,
            // Certs
            voteDelegationTarget: "",
            voteDelegationStakeCred: "",
            dRepRegTarget: "",
            dRepDeposit: "500000000",
            voteGovActionTxHash: "",
            voteGovActionIndex: "",
            voteChoice: "",
            stakeKeyReg: "",
            stakeKeyCoin: "2000000",
            stakeKeyWithCoin: false,
            stakeKeyUnreg: "",
            totalRefunds: undefined,
            // Deprecated Certs
            mirStakeCred: undefined,
            mirAmount: undefined,
            mirPot: undefined,
            genesisHash: undefined,
            genesisDelegationHash: undefined,
            vrfKeyHash: undefined,
            // Combo certs
            comboPoolHash: "",
            comboStakeCred: "",
            comboStakeRegCoin: "2000000",
            comboVoteDelegTarget: "",
            // Gov actions
            gaMetadataURL: "https://raw.githubusercontent.com/Ryun1/metadata/main/cip100/ga.jsonld",
            gaMetadataHash: "d57d30d2d03298027fde6d1c887c65da2b98b7ddefab189dcadab9a1d6792fee",
            constURL: "",
            constHash: "",
            treasuryTarget: "",
            treasuryWithdrawalAmount: "",
            hardForkUpdateMajor: "10",
            hardForkUpdateMinor: "0",
            committeeAdd: undefined,
            committeeExpiry: undefined,
            committeeRemove: undefined,
            committeeQuorum: undefined,
            govActDeposit: "100000000000",
            govActPrevActionHash: undefined,
            govActPrevActionIndex: undefined,
            guardRailsScriptHash: undefined,
            guardrailScriptUsed: false,
            guardrailScript: "59082f59082c0101003232323232323232323232323232323232323232323232323232323232323232323232323232323232323225932325333573466e1d2000001180098121bab357426ae88d55cf001054ccd5cd19b874801000460042c6aae74004dd51aba1357446ae88d55cf1baa325333573466e1d200a35573a00226ae84d5d11aab9e0011637546ae84d5d11aba235573c6ea800642b26006003149a2c8a4c3021801c0052000c00e0070018016006901e40608058c00e00290016007003800c00b0034830268320306007001800600690406d6204e00060001801c0052004c00e007001801600690404001e0006007001800600690404007e00060001801c0052006c00e006023801c006001801a4101000980018000600700148023003801808e0070018006006904827600060001801c005200ac00e0070018016006904044bd4060c00e003000c00d2080ade204c000c0003003800a4019801c00e003002c00d2080cab5ee0180c100d1801c005200ec00e0060238000c00e00290086007003800c00b003483d00e0306007001800600690500fe00040243003800a4025803c00c01a0103003800a4029803c00e003002c00cc07520d00f8079801c006001801980ea4120078001800060070014805b00780180360070018006006603e900a4038c0003003800a4041801c00c04601a3003800a4045801c00e003002c00d20f02e80c1801c006001801a4190cb80010090c00e00290126000c00e0029013600b003803c00e003002c00cc0752032c000c00e003000c00cc075200ac000c0006007007801c006005801980ea418170058001801c006001801980ea41209d80018000c0003003800a4051802c00e007003011c00e003000c00d2080e89226c000c0006007003801808e007001800600690406c4770b7e000600030000c00e0029015600b003801c00c047003800c00300348202e2e1cb00030001801c00e006023801c006001801a410181f905540580018000c0003003800a4059801c00c047003800c00300348203000700030000c00e00290176007003800c00b003483200603060070018006006904801e00040243003800a4061801c00c0430001801c0052032c016006003801801e00600780180140100c00e002901a600b003001c00c00f003003c00c00f003002c00c007003001c00c007003803c00e003002c00c0560184014802000c00e002901b6007003800c00b003480030034801b0001801c006001801a4029800180006007001480e3003801c006005801a4001801a40498000c00e003000c00d20ca04c00080486007001480eb00380180860070018006006900f600060001801c005203cc00e006015801c006001801a4101012bcf138c09800180006007001480fb003801805600700180060069040505bc3f482e00060001801c0052040c00e0070018016006900d4060c00e003000c00d204ac000c0003003800a4085801c00c04601630000000000200f003006c00e003000c00c05a0166000200f003005c00e003000c00c057003010c0006000200f003800c00b003012c00cc05d2028c0004008801c01e007001801600602380010043000400e003000c00c04b003011c0006000800c00b00300d8049001801600601d801980924190038000801c0060010066000801c00600900f6000800c00b003480030034820225eb0001003800c003003483403f0003000400c023000400e003000c00d208094ebdc03c000c001003009c001003300f4800b0004006005801a40058001001801401c6014900518052402860169004180424008600a900a180324005003480030001806240cc6016900d18052402460129004180424004600e900018032400c6014446666aae7c004a0005003328009aab9d0019aab9e0011aba100298019aba200224c6012444a6520071300149a4432005225900689802a4d2219002912c998099bad0020068ac99807002800c4cc03001c00e300244cc03001c02a3002012c801460012218010c00888004c004880094cc8c0040048848c8cc0088c00888c00800c8c00888c00400c8d4cc01001000cd400c0044888cc00c896400a300090999804c00488ccd5cd19b87002001800400a01522333573466e2000800600100291199ab9a33712004003000801488ccd5cd19b89002001801400244666ae68cdc4001000c00a001225333573466e240080044004400a44a666ae68cdc4801000880108008004dd6801484cc010004dd6001484c8ccc02a002452005229003912999ab9a3370e0080042666ae68cdc3801800c00200430022452005229003911980899b820040013370400400648a400a45200722333573466e20cdc100200099b82002003800400880648a400a45200722333573466e24cdc100200099b82002003801400091480148a400e44666ae68cdc419b8200400133704004007002800122593300e0020018800c400922593300e00200188014400400233323357346ae8cd5d10009198051bad357420066eb4d5d08011aba2001268001bac00214800c8ccd5cd1aba3001800400a444b26600c0066ae8400626600a0046ae8800630020c0148894ccd5cd19b87480000045854ccd5cd19b88001480004cc00ccdc0a400000466e05200000113280099b8400300199b840020011980200100098021112999ab9a3370e9000000880109980180099b860020012223300622590018c002443200522323300d225900189804803488564cc0140080322600800318010004b20051900991111111001a3201322222222005448964ce402e444444440100020018c00a30000002225333573466e1c00800460002a666ae68cdc48010008c010600445200522900391199ab9a3371266e08010004cdc1001001c0020041191800800918011198010010009"
        });
    }

    /**
     * Refresh all the data from the user's wallet
     * @returns {Promise<void>}
     */
    refreshData = async () => {
        try {
            const walletFound = this.checkIfWalletFound();
            this.resetSomeState();
            this.refreshErrorState();
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
                .coins_per_utxo_byte(BigNum.from_str(this.protocolParams.coinsPerUTxOByte))
                .max_value_size(this.protocolParams.maxValSize)
                .max_tx_size(this.protocolParams.maxTxSize)
                .prefer_pure_change(true)
                .ex_unit_prices(
                    ExUnitPrices.new(
                        UnitInterval.new(BigNum.from_str("577"),BigNum.from_str("10000")), 
                        UnitInterval.new(BigNum.from_str("721"),BigNum.from_str("10000000"))
                    )
                )
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
            const cip105dRepID = (PublicKey.from_hex(dRepKey)).hash();
            this.setState({dRepKey});
            this.setState({cip105dRepID : cip105dRepID.to_hex()});
            const cip105dRepIDBech32 = cip105dRepID.to_bech32('drep');
            this.setState({cip105dRepIDBech32});
            
            // add CIP-129 DRep ID
            const cip129dRepID = 22 + cip105dRepID.to_hex();
            this.setState({cip129dRepID});

            // bech32 encode the CIP-129 DRep ID
            const words = bech32.toWords(Buffer.from(cip129dRepID, "hex"));
            const cip129dRepIDBech32 = bech32.encode('drep', words);
            this.setState({cip129dRepIDBech32});

            // Default use the wallet's cip105dRepID for DRep registration
            this.setState({dRepRegTarget: cip105dRepIDBech32});
            // Default use the wallet's cip105dRepID for Vote delegation target
            this.setState({voteDelegationTarget: cip105dRepIDBech32});
            // Default use the wallet's cip105dRepID for combo Vote delegation target
            this.setState({comboVoteDelegTarget: cip105dRepIDBech32});
        } catch (err) {
            console.log(err)
        }
    }

    getRegisteredPubStakeKeys = async () => {
        try {
            const raw = await this.API.cip95.getRegisteredPubStakeKeys();
            if (raw.length < 1){
                // console.log("No Registered Pub Stake Keys");
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
                // Set default stake key for combo certs as the first registered key
                this.setState({comboStakeCred : stakeKeyHash});
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
            console.error('Error in parsing credential, not Hex or Bech32:');
            console.error(err1, err2);
            this.setState({buildingError : {msg: 'Error in parsing credential, not Hex or Bech32', err: err2}});
            return null;
          }
        }
    }

    // ew! who wrote this?
    resetSomeState = async () => { 
        this.setState({cip95ResultTx : ""});
        this.setState({cip95ResultHash : ""});
        this.setState({certsInTx : []});
        this.setState({votesInTx : []});
        this.setState({govActsInTx : []});
        this.setState({certBuilder : undefined});
        this.setState({votingBuilder : undefined});
        this.setState({govActionBuilder : undefined});
    }

    refreshErrorState = async () => { 
        this.setState({buildingError : undefined});
        this.setState({signAndSubmitError : undefined});
    }

    getCertBuilder = async () => {
        if (this.state.certBuilder){
            return this.state.certBuilder;
        } else {
            return CertificatesBuilder.new();
        }
    }

    setCertBuilder = async (certBuilderWithCert) => {
        this.setState({certBuilder : certBuilderWithCert});

        let certs = certBuilderWithCert.build();
        let certsInJson = [];
        for (let i = 0; i < certs.len(); i++) {
            certsInJson.push(certs.get(i).to_json());
        }
        this.setState({certsInTx : certsInJson});
    }

    getVotingBuilder = async () => {
        let votingBuilder;
        if (this.state.votingBuilder){
            votingBuilder = this.state.votingBuilder;
        } else {
            votingBuilder = VotingBuilder.new();
        }
        return votingBuilder;
    }

    setVotingBuilder = async (votingBuilderWithVote) => {
        this.setState({votingBuilder : votingBuilderWithVote});

        // let votes = votingBuilderWithVote.build();
        // let votesInJson = [];
        // for (let i = 0; i < votes.get_voters().len(); i++) {
        //     votesInJson.push(votes.get(i).to_json());
        // }
        this.setState({votesInTx : votingBuilderWithVote.build().to_json()});
    }

    getGovActionBuilder = async () => {
        let govActionBuilder;
        if (this.state.govActionBuilder){
            govActionBuilder = this.state.govActionBuilder;
        } else {
            govActionBuilder = VotingProposalBuilder.new();
        }
        return govActionBuilder;
    }

    setGovActionBuilder = async (govActionBuilderWithAction) => {
        this.setState({govActionBuilder : govActionBuilderWithAction});

        let actions = govActionBuilderWithAction.build();
        let actionsInJson = [];
        for (let i = 0; i < actions.len(); i++) {
            actionsInJson.push(actions.get(i).to_json());
        }
        this.setState({govActsInTx : actionsInJson});
    }

    buildSubmitConwayTx = async (builderSuccess) => {
        try {
            console.log("Building, signing and submitting transaction")
            // Abort if error before building Tx
            if (!(await builderSuccess)){
                throw new Error("Error before building Tx, aborting Tx build.")
            }
            // Initialize builder with protocol parameters
            const txBuilder = await this.initTransactionBuilder();
            const transactionWitnessSet = TransactionWitnessSet.new();

            // Add certs, votes, gov actions or donation to the transaction
            if (this.state.certBuilder){
                txBuilder.set_certs_builder(this.state.certBuilder);
                this.setState({certBuilder : undefined});
            }
            if (this.state.votingBuilder){
                txBuilder.set_voting_builder(this.state.votingBuilder);
                this.setState({votingBuilder : undefined});
            }
            if (this.state.govActionBuilder){
                txBuilder.set_voting_proposal_builder(this.state.govActionBuilder);
                this.setState({govActionBuilder : undefined});
            }
            if (this.state.treasuryDonationAmount){
                txBuilder.set_donation(BigNum.from_str(this.state.treasuryDonationAmount));
            }
            if (this.state.treasuryValueAmount){
                txBuilder.set_current_treasury_value(BigNum.from_str(this.state.treasuryValueAmount));
            }
            if(this.state.guardrailScriptUsed){
                try{
                    const scripts = PlutusScripts.new();
                    scripts.add(PlutusScript.from_bytes_v3(Buffer.from(this.state.guardrailScript,'hex')));
                    transactionWitnessSet.set_plutus_scripts(scripts)

                    const redeemers = Redeemers.new();
                    this.state.redeemers.forEach(r=>{
                        redeemers.add(r);
                    })
                    transactionWitnessSet.set_redeemers(redeemers)

                    const costModels = Costmdls.new()
                    let v1costModel = CostModel.new()
                    sanchoPParam.costModels.PlutusV1.forEach((val,index)=>{
                        v1costModel.set(index,Int.new_i32(val))
                    })
                    costModels.insert(Language.new_plutus_v1(),v1costModel)

                    let v2costModel = CostModel.new()
                    sanchoPParam.costModels.PlutusV2.forEach((val,index)=>{
                        v2costModel.set(index,Int.new_i32(val))
                    })
                    costModels.insert(Language.new_plutus_v2(),v2costModel)

                    let v3costModel = CostModel.new()
                    sanchoPParam.costModels.PlutusV3.forEach((val,index)=>{
                        v3costModel.set(index,Int.new_i32(val))
                    })
                    costModels.insert(Language.new_plutus_v3(),v3costModel)
                                        
                    txBuilder.calc_script_data_hash(costModels)
                }
                catch(e){
                    console.error("App.buildSubmitConwayTx : if(this.state.guardrailScriptUsed)",e)
                    throw e
                }
            }
            
            // Set output and change addresses to those of our wallet
            const shelleyOutputAddress = Address.from_bech32(this.state.usedAddress);
            const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress);
            
            // Ensure the total output is larger than total implicit inputs (refunds / withdrawals)
            if (!txBuilder.get_implicit_input().is_zero()){
                const outputValue = txBuilder.get_implicit_input().coin();
                // add output to the transaction
                txBuilder.add_output(
                    TransactionOutput.new(
                        shelleyOutputAddress,
                        Value.new(outputValue)
                    ),
                );
            }

            // Find the available UTxOs in the wallet and use them as Inputs for the transaction
            await this.getUtxos();
            const txUnspentOutputs = await this.getTxUnspentOutputs();

            if(this.state.guardrailScriptUsed){
                let inputsBuilder=TxInputsBuilder.new()
                const probable_collaterals = this.state.Utxos
                .filter(x => !x["multiAssetStr"])
                .map(x => ({
                    ...x,
                    amount: window.BigInt(x.amount)
                }))
                .sort((a, b) => (a.amount > b.amount ? -1 : 1)); 
                console.log("utxos",this.state.Utxos)
                console.log("Collaterals",probable_collaterals)
                if(probable_collaterals.length>0){
                    let unspentOutput=probable_collaterals[0].TransactionUnspentOutput
                    let output=unspentOutput.output()
                    inputsBuilder.add_regular_input(
                        output.address(),
                        unspentOutput.input(),
                        output.amount()
                    )
                    txBuilder.set_collateral(inputsBuilder)
                }else{
                    throw Error("Set collateral on Wallet.")
                }
            }

            // Use UTxO selection strategy 2 and add change address to be used if needed
            const changeConfig = ChangeConfig.new(shelleyChangeAddress);
            
            // Todo use total collateral for better compatibility
            function use_change_strategy(script,strategy){
                    if(script){
                        txBuilder.add_inputs_from_and_change_with_collateral_return(txUnspentOutputs, strategy, changeConfig,BigNum.from_str("150"));

                    }else{
                        txBuilder.add_inputs_from_and_change(txUnspentOutputs, strategy, changeConfig);
                    }
            }
            // Use UTxO selection strategy 2 if strategy 3 fails
            try {
                txBuilder.add_inputs_from_and_change(txUnspentOutputs, 3, changeConfig);
            } catch (e) {
                console.error(e);
                txBuilder.add_inputs_from_and_change(txUnspentOutputs, 2, changeConfig);
            }

            // Build transaction body
            const txBody = txBuilder.build();
            // Make a full transaction, passing in empty witness set
            const tx = Transaction.new(
                txBody,
                TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes()),
            );

            // Ask wallet to to provide signature (witnesses) for the transaction
            let txVkeyWitnesses;
            // Log the CBOR of tx to console
            console.log("UnsignedTx: ", Buffer.from(tx.to_bytes(), "utf8").toString("hex"));
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
            //console.log("Signed Tx: ", signedTx.to_json());

            const cip95ResultWitness = Buffer.from(txVkeyWitnesses.to_bytes(), "utf8").toString("hex");
            this.setState({cip95ResultWitness});
            
            this.resetSomeState();

            if (await this.submitConwayTx(signedTx)){
                // Reset  state
                this.setState({cip95MetadataURL : undefined});
                this.setState({cip95MetadataHash : undefined});
                this.setState({totalRefunds : undefined});
            }
        } catch (err) {
            console.error("App.buildSubmitConwayTx",err);
            await this.refreshData();
            this.setState({signAndSubmitError : (err)})
        }
    }

    submitConwayTx = async (signedTx) => {
        try {
            const result = await this.API.submitTx(Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"));
            console.log("Submitted transaction hash", result)
            // Set results so they can be rendered
            const cip95ResultTx = Buffer.from(signedTx.to_bytes(), "utf8").toString("hex");
            this.setState({cip95ResultTx});
            this.setState({cip95ResultHash : result});
            return true;
        } catch (err) {
            console.log("Error during submission of transaction");
            console.log(err);
            this.setState({signAndSubmitError : (err)})
            return false;
        }
    }

    addStakeKeyRegCert = async () => {
        this.refreshErrorState();
        let certBuilder = await this.getCertBuilder();
        console.log("Adding stake registration cert to transaction")
        const certBuilderWithStakeReg = buildStakeKeyRegCert(
            certBuilder, 
            this.state.stakeKeyReg,
            this.state.stakeKeyWithCoin,
            this.state.stakeKeyCoin,
        );
    
        // messy having this here
        if (!this.state.stakeKeyWithCoin){
            this.protocolParams.keyDeposit = this.state.stakeKeyCoin
        }
        if (certBuilderWithStakeReg){
            await this.setCertBuilder(certBuilderWithStakeReg)
            return true;
        } else {
            return false;
        }
    }

    addStakeKeyUnregCert = async () => {
        this.refreshErrorState();        
        let certBuilder = await this.getCertBuilder();
        console.log("Adding stake deregistraiton cert to transaction")
        const certBuilderWithStakeUnreg = buildStakeKeyUnregCert(
            certBuilder, 
            this.state.stakeKeyUnreg,
            this.state.stakeKeyWithCoin,
            this.state.stakeKeyCoin,
        );
        // messy having this here
        if (!this.state.stakeKeyWithCoin){
            this.protocolParams.keyDeposit = this.state.stakeKeyCoin
        }

        // messy having this here
        let refund;
        if (this.state.totalRefunds){
            refund = (this.state.totalRefunds).checked_add(BigNum.from_str(this.state.stakeKeyWithCoin))
        } else {
            refund = BigNum.from_str(this.state.stakeKeyCoin)
        }
        this.setState({totalRefunds : refund})

        if (certBuilderWithStakeUnreg){
            await this.setCertBuilder(certBuilderWithStakeUnreg)
            return true;
        } else {
            return false;
        }
    }

    addStakeVoteDelegCert = async () => {
        this.refreshErrorState();
        let certBuilder = await this.getCertBuilder();
        console.log("Adding vote delegation cert to transaction")
        const certBuilderWithStakeVoteDeleg = buildStakeVoteDelegCert(
            certBuilder, 
            this.state.comboStakeCred,
            this.state.comboPoolHash,
            this.state.comboVoteDelegTarget,
        );
        if (certBuilderWithStakeVoteDeleg){
            await this.setCertBuilder(certBuilderWithStakeVoteDeleg)
            return true;
        } else {
            return false;
        }
    }

    addStakeRegDelegCert = async () => {
        this.refreshErrorState();
        let certBuilder = await this.getCertBuilder();
        console.log("Adding (stake key reg and stake pool delegation) cert to transaction")
        const certBuilderWithStakeRegDelegCert = buildStakeRegDelegCert(
            certBuilder, 
            this.state.comboStakeCred,
            this.state.comboPoolHash,
            this.state.comboStakeRegCoin,
        );
        // messy having this here
        if (!this.state.comboStakeRegCoin){
            this.protocolParams.keyDeposit = this.state.comboStakeRegCoin
        }
        if (certBuilderWithStakeRegDelegCert){
            await this.setCertBuilder(certBuilderWithStakeRegDelegCert)
            return true;
        } else {
            return false;
        }
    }

    addStakeRegVoteDelegCert = async () => {
        this.refreshErrorState();
        let certBuilder = await this.getCertBuilder();
        console.log("Adding (stake key reg and vote delegation) cert to transaction")
        const certBuilderWithStakeRegVoteDelegCert = buildStakeRegVoteDelegCert(
            certBuilder, 
            this.state.comboStakeCred,
            this.state.comboVoteDelegTarget,
            this.state.comboStakeRegCoin,
        );
        // messy having this here
        if (!this.state.comboStakeRegCoin){
            this.protocolParams.keyDeposit = this.state.comboStakeRegCoin
        }
        if (certBuilderWithStakeRegVoteDelegCert){
            await this.setCertBuilder(certBuilderWithStakeRegVoteDelegCert)
            return true;
        } else {
            return false;
        }
    }

    addStakeRegStakeVoteDelegCert = async () => {
        this.refreshErrorState();
        let certBuilder = await this.getCertBuilder();
        console.log("Adding (stake key reg, stake pool delegation and vote delegation) cert to transaction")
        const certBuilderWithStakeRegStakeVoteDelegCert = buildStakeRegStakeVoteDelegCert(
            certBuilder, 
            this.state.comboStakeCred,
            this.state.comboPoolHash,
            this.state.comboVoteDelegTarget,
            this.state.comboStakeRegCoin,
        );
        // messy having this here
        if (!this.state.comboStakeRegCoin){
            this.protocolParams.keyDeposit = this.state.comboStakeRegCoin
        }
        if (certBuilderWithStakeRegStakeVoteDelegCert){
            await this.setCertBuilder(certBuilderWithStakeRegStakeVoteDelegCert)
            return true;
        } else {
            return false;
        }
    }

    addAuthorizeHotCredCert = async () => {
        this.refreshErrorState();
        let certBuilder = await this.getCertBuilder();
        console.log("Adding CC authorize hot credential cert to transaction")
        const certBuilderWithAuthorizeHotCredCert = buildAuthorizeHotCredCert(
            certBuilder, 
            this.state.ccColdCred,
            this.state.ccHotCred,
        );
        if (certBuilderWithAuthorizeHotCredCert){
            await this.setCertBuilder(certBuilderWithAuthorizeHotCredCert)
            return true;
        } else {
            return false;
        }
    }

    addResignColdCredCert = async () => {
        this.refreshErrorState();
        let certBuilder = await this.getCertBuilder();
        console.log("Adding CC resign cold credential cert to transaction")

        let certBuilderWithResignColdCredCert;
        
        if (this.state.cip95MetadataURL && this.state.cip95MetadataHash) {
            certBuilderWithResignColdCredCert = buildResignColdCredCert(
            certBuilder, 
            this.state.ccColdCred,
            this.state.cip95MetadataURL,
            this.state.cip95MetadataHash
            );
        } else {
            certBuilderWithResignColdCredCert = buildResignColdCredCert(
                certBuilder, 
                this.state.ccColdCred
            );
        }
        if (certBuilderWithResignColdCredCert){
            await this.setCertBuilder(certBuilderWithResignColdCredCert)
            return true;
        } else {
            return false;
        }
    }

    addMIRCert = async () => {
        this.refreshErrorState();
        let certBuilder = await this.getCertBuilder();
        console.log("Adding MIR cert to transaction")
        
        const certBuilderWithMIRCert = buildMIRCert(
            certBuilder, 
            this.state.mirStakeCred,
            this.state.mirAmount,
            this.state.mirPot
        );

        if (certBuilderWithMIRCert){
            await this.setCertBuilder(certBuilderWithMIRCert)
            return true;
        } else {
            return false;
        }
    }

    addGenesisDelegationCert = async () => {
        this.refreshErrorState();
        let certBuilder = await this.getCertBuilder();
        console.log("Adding genesis delegation to transaction")
        
        const certBuilderWithGenesisDelegationCert = buildGenesisKeyDelegationCert(
            certBuilder, 
            this.state.genesisHash,
            this.state.genesisDelegationHash,
            this.state.vrfKeyHash
        );

        if (certBuilderWithGenesisDelegationCert){
            await this.setCertBuilder(certBuilderWithGenesisDelegationCert)
            return true;
        } else {
            return false;
        }
    }

    buildVoteDelegationCert = async () => {
        this.refreshErrorState();
        let certBuilder = await this.getCertBuilder();
        console.log("Adding vote delegation cert to transaction")
        try {
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
            // add cert to certBuilder
            certBuilder.add(Certificate.new_vote_delegation(voteDelegationCert));
            await this.setCertBuilder(certBuilder)
            return true;
        } catch (err) {
            this.setState({buildingError : String(err)})
            this.resetSomeState();
            console.log(err);
            return false;
        }
    }

    buildDRepRegCert = async () => {
        this.refreshErrorState();
        let certBuilder = await this.getCertBuilder();
        console.log("Adding DRep Registration cert to transaction")
        try {
            const dRepCred = await this.handleInputToCredential(this.state.dRepRegTarget);
            let dRepRegCert;
            // If there is an anchor
            if (this.state.cip95MetadataURL && this.state.cip95MetadataHash) {
                const anchorURL = URL.new(this.state.cip95MetadataURL);
                const anchorHash = AnchorDataHash.from_hex(this.state.cip95MetadataHash);
                const anchor = Anchor.new(anchorURL, anchorHash);
                // Create cert object
                dRepRegCert = DRepRegistration.new_with_anchor(
                    dRepCred,
                    BigNum.from_str(this.state.dRepDeposit),
                    anchor
                );
            } else {
                dRepRegCert = DRepRegistration.new(
                    dRepCred,
                    BigNum.from_str(this.state.dRepDeposit),
                );
            };
            // add cert to certbuilder
            certBuilder.add(Certificate.new_drep_registration(dRepRegCert));
            await this.setCertBuilder(certBuilder)
            return true;
        } catch (err) {
            this.setState({buildingError : String(err)})
            this.resetSomeState();
            console.log(err);
            return false;
        }
    }

    buildDRepUpdateCert = async () => {
        this.refreshErrorState();
        let certBuilder = await this.getCertBuilder();
        console.log("Adding DRep Update cert to transaction")
        try {
            // Use the wallet's DRep ID
            const dRepKeyHash = Ed25519KeyHash.from_hex(this.state.cip105dRepID);
            const dRepCred = Credential.from_keyhash(dRepKeyHash);
            let dRepUpdateCert;
            // If there is an anchor
            if (this.state.cip95MetadataURL && this.state.cip95MetadataHash) {
                const anchorURL = URL.new(this.state.cip95MetadataURL);
                const anchorHash = AnchorDataHash.from_hex(this.state.cip95MetadataHash);
                const anchor = Anchor.new(anchorURL, anchorHash);
                // Create cert object
                dRepUpdateCert = DRepUpdate.new_with_anchor(
                    dRepCred,
                    anchor
                );
            } else {
                dRepUpdateCert = DRepUpdate.new(
                    dRepCred,
                );
            };
            // add cert to certbuilder
            certBuilder.add(Certificate.new_drep_update(dRepUpdateCert));
            await this.setCertBuilder(certBuilder)
            return true;
        } catch (err) {
            this.setState({buildingError : String(err)})
            this.resetSomeState();
            console.log(err);
            return false;
        }
    }

    buildDRepRetirementCert = async () => {
        this.refreshErrorState();
        let certBuilder = await this.getCertBuilder();
        console.log("Adding DRep Retirement cert to transaction")
        try {
            // Use the wallet's DRep ID
            const dRepKeyHash = Ed25519KeyHash.from_hex(this.state.cip105dRepID);
            const dRepCred = Credential.from_keyhash(dRepKeyHash);
            const dRepRetirementCert = DRepDeregistration.new(
                dRepCred,
                BigNum.from_str(this.state.dRepDeposit),
            );
            // add cert to certbuilder
            certBuilder.add(Certificate.new_drep_deregistration(dRepRetirementCert));
            await this.setCertBuilder(certBuilder)
            return true;
        } catch (err) {
            this.setState({buildingError : String(err)})
            this.resetSomeState();
            console.log(err);
            return false;
        }
    }

    buildVote = async () => {
        this.refreshErrorState();
        let votingBuilder = await this.getVotingBuilder();
        console.log("Adding DRep vote to transaction")
        try {
            // Use wallet's DRep key
            const dRepKeyHash = Ed25519KeyHash.from_hex(this.state.cip105dRepID);
            const voter = Voter.new_drep_credential(Credential.from_keyhash(dRepKeyHash))
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
            votingBuilder.add(voter, govActionId, votingProcedure);
            await this.setVotingBuilder(votingBuilder)
            return true;
        } catch (err) {
            this.setState({buildingError : String(err)})
            this.resetSomeState();
            console.log(err);
            return false;
        }
    }

    buildNewConstGovAct = async () => {
        this.refreshErrorState();
        let govActionBuilder = await this.getGovActionBuilder();
        console.log("Adding New Constitution Gov Act to transaction")
        try {
            // Create new constitution gov action
            const constURL = URL.new(this.state.constURL);
            const constDataHash = AnchorDataHash.from_hex(this.state.constHash);
            const constAnchor = Anchor.new(constURL, constDataHash);
            // Add in proposal policy if provided
            let constitution;
            if (this.state.guardRailsScriptHash) {
                constitution = Constitution.new_with_script_hash(constAnchor, ScriptHash.from_hex(this.state.guardRailsScriptHash));
            } else {
                constitution = Constitution.new(constAnchor);
            }
            // Create new constitution governance action
            let constChange;
            if (this.state.govActPrevActionHash && this.state.govActPrevActionIndex){
                const prevActionId = GovernanceActionId.new(TransactionHash.from_hex(this.state.govActPrevActionHash), this.state.govActPrevActionIndex);
                constChange = NewConstitutionAction.new_with_action_id(prevActionId, constitution, prevActionId);
            } else {
                constChange = NewConstitutionAction.new(constitution);
            }
            const constChangeGovAct = GovernanceAction.new_new_constitution_action(constChange);
            // Create anchor and then reset state
            const anchorURL = URL.new(this.state.gaMetadataURL);
            const anchorHash = AnchorDataHash.from_hex(this.state.gaMetadataHash);
            const anchor = Anchor.new(anchorURL, anchorHash);
            // Lets just use the connect wallet's reward address
            const rewardAddr = RewardAddress.from_address(Address.from_bech32(this.state.rewardAddress));
            // Create voting proposal
            const votingProposal = VotingProposal.new(constChangeGovAct, anchor, rewardAddr, BigNum.from_str(this.state.govActDeposit))
            // Create gov action builder and set it in state
            govActionBuilder.add(votingProposal)
            await this.setGovActionBuilder(govActionBuilder)
            return true;
        } catch (err) {
            this.setState({buildingError : String(err)})
            this.resetSomeState();
            console.log(err);
            return false;
        }
    }

    buildNewInfoGovAct = async () => {
        this.refreshErrorState();
        let govActionBuilder = await this.getGovActionBuilder();
        console.log("Adding New Constitution Gov Act to transaction")
        try {
            // Create new info action
            const infoAction = InfoAction.new();
            const infoGovAct = GovernanceAction.new_info_action(infoAction);
            // Create anchor and then reset state
            const anchorURL = URL.new(this.state.gaMetadataURL);
            const anchorHash = AnchorDataHash.from_hex(this.state.gaMetadataHash);
            const anchor = Anchor.new(anchorURL, anchorHash);
            // Lets just use the connect wallet's reward address
            const rewardAddr = RewardAddress.from_address(Address.from_bech32(this.state.rewardAddress));
            // Create voting proposal
            const votingProposal = VotingProposal.new(infoGovAct, anchor, rewardAddr, BigNum.from_str(this.state.govActDeposit))
            // Create gov action builder and set it in state
            govActionBuilder.add(votingProposal)
            await this.setGovActionBuilder(govActionBuilder)
            return true;
        } catch (err) {
            this.setState({buildingError : String(err)})
            this.resetSomeState();
            console.log(err);
            return false;
        }
    }

    buildTreasuryGovAct = async () => {
        this.refreshErrorState();
        let govActionBuilder = await this.getGovActionBuilder();
        console.log("Adding Treasury Withdrawal Gov Act to transaction")
        let guardrailScript
        try {
            // take inputs
            const treasuryTarget = RewardAddress.from_address(Address.from_bech32(this.state.treasuryTarget));
            const myWithdrawal = BigNum.from_str(this.state.treasuryWithdrawalAmount);
            const withdrawals = (TreasuryWithdrawals.new())
            withdrawals.insert(treasuryTarget, myWithdrawal)
            // Create new treasury withdrawal gov act
            // if proposal policy
            let treasuryAction;
            if (this.state.guardrailScript) {
                guardrailScript =PlutusScript.from_bytes_v3(Buffer.from(this.state.guardrailScript,'hex'))
                treasuryAction = TreasuryWithdrawalsAction.new_with_policy_hash(withdrawals,guardrailScript.hash());

            } else {
                treasuryAction = TreasuryWithdrawalsAction.new(withdrawals);
            }
            const treasuryGovAct = GovernanceAction.new_treasury_withdrawals_action(treasuryAction);
            // Create anchor and then reset state
            const anchorURL = URL.new(this.state.gaMetadataURL);
            const anchorHash = AnchorDataHash.from_hex(this.state.gaMetadataHash);
            const anchor = Anchor.new(anchorURL, anchorHash);
            // Lets just use the connect wallet's reward address
            const rewardAddr = RewardAddress.from_address(Address.from_bech32(this.state.rewardAddress));
            // Create voting proposal
            const votingProposal = VotingProposal.new(treasuryGovAct, anchor, rewardAddr, BigNum.from_str(this.state.govActDeposit))
            // Create gov action builder and set it in state
            this.addVotingProposalToBuilder(govActionBuilder,votingProposal,guardrailScript)
            
            return true;
        } catch (err) {
            console.error("App.buildTreasuryGovAct",err);
            this.setState({buildingError : String(err)})
            this.resetSomeState();
            return false;
        }
    }

    async addVotingProposalToBuilder(govActionBuilder,votingProposal,guardrailScript){
        let redeemer
        if(guardrailScript){
            const redeemerTag = RedeemerTag.new_voting_proposal(0)
            const plutusData  = PlutusData.new_map(PlutusMap.new());
            const exUnits = ExUnits.new(BigNum.from_str("402468"), BigNum.from_str("89488792"));
            redeemer = Redeemer.new(redeemerTag, BigNum.from_str("0"), plutusData, exUnits)
            const witness = PlutusWitness.new_with_ref_without_datum(
                PlutusScriptSource.new(guardrailScript),
                redeemer
            )
            this.setState({redeemers: [redeemer]})
            govActionBuilder.add_with_plutus_witness(votingProposal,witness)
        }else{
            govActionBuilder.add(votingProposal)
        }
        await this.setGovActionBuilder(govActionBuilder)
        if(guardrailScript){
            this.setState({guardrailScriptUsed: true,redeemers: [redeemer]})
        }

    }

    buildUpdateCommitteeGovAct = async () => {
        this.refreshErrorState();
        let govActionBuilder = await this.getGovActionBuilder();
        console.log("Adding Update Committee Gov Act to transaction")
        try {
            // Create new committee quorum threshold
            let threshold = UnitInterval.new(BigNum.from_str("1"), BigNum.from_str("2"));
            if (this.state.committeeQuorum){
                threshold = UnitInterval.new(BigNum.from_str("1"), BigNum.from_str(this.state.committeeQuorum));
            }
    
            // add new member if provided
            let newCommittee = Committee.new(threshold);
            if (this.state.committeeAdd && this.state.committeeExpiry){
                const ccCredential = await this.handleInputToCredential((this.state.committeeAdd));
                newCommittee.add_member(ccCredential, Number(this.state.committeeExpiry))
            }
            // remove member if provided
            let removeCred;
            if (this.state.committeeRemove){
                removeCred = Credentials.new()
                removeCred.add(await this.handleInputToCredential(this.state.committeeRemove))
            } else {
                removeCred = Credentials.new()
            }

            let updateComAction;
            if (this.state.govActPrevActionHash && this.state.govActPrevActionIndex){
                const prevActionId = GovernanceActionId.new(TransactionHash.from_hex(this.state.govActPrevActionHash), this.state.govActPrevActionIndex);
                updateComAction = UpdateCommitteeAction.new_with_action_id(prevActionId, newCommittee, removeCred);
            } else {
                updateComAction = UpdateCommitteeAction.new(newCommittee, removeCred);
            }
            const updateComGovAct = GovernanceAction.new_new_committee_action(updateComAction);

            // Create anchor and then reset state
            const anchorURL = URL.new(this.state.gaMetadataURL);
            const anchorHash = AnchorDataHash.from_hex(this.state.gaMetadataHash);
            const anchor = Anchor.new(anchorURL, anchorHash);
            // Lets just use the connect wallet's reward address
            const rewardAddr = RewardAddress.from_address(Address.from_bech32(this.state.rewardAddress));
            // Create voting proposal
            const votingProposal = VotingProposal.new(updateComGovAct, anchor, rewardAddr, BigNum.from_str(this.state.govActDeposit))
            // Create gov action builder and set it in state
            govActionBuilder.add(votingProposal)
            await this.setGovActionBuilder(govActionBuilder)
            return true;
        } catch (err) {
            console.error("App.buildUpdatecommitteeGovAct",err);
            this.setState({buildingError : String(err)})
            this.resetSomeState();
            return false;
        }
    }

    buildMotionOfNoConfidenceAction = async () => {
        this.refreshErrorState();
        let govActionBuilder = await this.getGovActionBuilder();
        console.log("Adding Motion of No Confidence Gov Act to transaction")
        try {
            // Create motion of no confidence gov action

            let noConfidenceAction;
            if (this.state.govActPrevActionHash && this.state.govActPrevActionIndex){
                const prevActionId = GovernanceActionId.new(TransactionHash.from_hex(this.state.govActPrevActionHash), this.state.govActPrevActionIndex);
                noConfidenceAction = NoConfidenceAction.new_with_action_id(prevActionId);
            } else {
                noConfidenceAction = NoConfidenceAction.new();
            }
            const noConfidenceGovAct = GovernanceAction.new_no_confidence_action(noConfidenceAction);
            // Create anchor and then reset state
            const anchorURL = URL.new(this.state.gaMetadataURL);
            const anchorHash = AnchorDataHash.from_hex(this.state.gaMetadataHash);
            const anchor = Anchor.new(anchorURL, anchorHash);
            // Lets just use the connect wallet's reward address
            const rewardAddr = RewardAddress.from_address(Address.from_bech32(this.state.rewardAddress));
            // Create voting proposal
            const votingProposal = VotingProposal.new(noConfidenceGovAct, anchor, rewardAddr, BigNum.from_str(this.state.govActDeposit))
            // Create gov action builder and set it in state
            govActionBuilder.add(votingProposal)
            await this.setGovActionBuilder(govActionBuilder)
            return true;
        } catch (err) {
            this.setState({buildingError : String(err)})
            this.resetSomeState();
            console.log(err);
            return false;
        }
    }

    buildProtocolParamAction = async () => {
        this.refreshErrorState();
        let govActionBuilder = await this.getGovActionBuilder();
        console.log("Adding Protocol Param Change Gov Act to transaction")
        let guardrailScript
        try {
            // Placeholder just do key deposit for now
            const protocolParmUpdate = ProtocolParamUpdate.new();
            protocolParmUpdate.set_key_deposit(BigNum.from_str("0"));
            // Create param change gov action
            let parameterChangeAction;

            // if prev action
            if (this.state.govActPrevActionHash && this.state.govActPrevActionIndex) {
                const prevActionId = GovernanceActionId.new(TransactionHash.from_hex(this.state.govActPrevActionHash), this.state.govActPrevActionIndex);
                // if policy
                if (this.state.guardrailScript) {
                    guardrailScript =PlutusScript.from_bytes_v3(Buffer.from(this.state.guardrailScript,'hex'))
                    parameterChangeAction = ParameterChangeAction.new_with_policy_hash_and_action_id(prevActionId, protocolParmUpdate, guardrailScript.hash());
    
                } else {
                    parameterChangeAction = ParameterChangeAction.new_with_action_id(prevActionId, protocolParmUpdate);
                }

            // else no prev action
            } else {
                if(this.state.guardrailScript){
                    guardrailScript =PlutusScript.from_bytes_v3(Buffer.from(this.state.guardrailScript,'hex'))
                    parameterChangeAction = ParameterChangeAction.new_with_policy_hash(protocolParmUpdate,guardrailScript.hash());
                } else {
                // if no policy and no prev action
                    parameterChangeAction = ParameterChangeAction.new(protocolParmUpdate);
                }
            }
            const parameterChangeGovAct = GovernanceAction.new_parameter_change_action(parameterChangeAction);
            // Create anchor and then reset state
            const anchorURL = URL.new(this.state.gaMetadataURL);
            const anchorHash = AnchorDataHash.from_hex(this.state.gaMetadataHash);
            const anchor = Anchor.new(anchorURL, anchorHash);
            // Lets just use the connect wallet's reward address
            const rewardAddr = RewardAddress.from_address(Address.from_bech32(this.state.rewardAddress));
            // Create voting proposal
            const votingProposal = VotingProposal.new(parameterChangeGovAct, anchor, rewardAddr, BigNum.from_str(this.state.govActDeposit))
            // Create gov action builder and set it in state
            this.addVotingProposalToBuilder(govActionBuilder,votingProposal,guardrailScript)
            return true;
        } catch (err) {
            this.setState({buildingError : String(err)})
            this.resetSomeState();
            console.log(err);
            return false;
        }
    }

    buildHardForkAction = async () => {
        this.refreshErrorState();
        let govActionBuilder = await this.getGovActionBuilder();
        console.log("Adding Protocol Param Change Gov Act to transaction")
        try {
            const nextProtocolVersion = ProtocolVersion.new(this.state.hardForkUpdateMajor, this.state.hardForkUpdateMinor);
            // Create HF Initiation Action
            let hardForkInitiationAction;
            if (this.state.govActPrevActionHash && this.state.govActPrevActionIndex){
                const prevActionId = GovernanceActionId.new(TransactionHash.from_hex(this.state.govActPrevActionHash), this.state.govActPrevActionIndex);
                hardForkInitiationAction = HardForkInitiationAction.new_with_action_id(prevActionId, nextProtocolVersion);
            } else {
                hardForkInitiationAction = HardForkInitiationAction.new(nextProtocolVersion);
            }
            const hardForkInitiationGovAct = GovernanceAction.new_hard_fork_initiation_action(hardForkInitiationAction);
            // Create anchor and then reset state
            const anchorURL = URL.new(this.state.gaMetadataURL);
            const anchorHash = AnchorDataHash.from_hex(this.state.gaMetadataHash);
            const anchor = Anchor.new(anchorURL, anchorHash);
            // Lets just use the connect wallet's reward address
            const rewardAddr = RewardAddress.from_address(Address.from_bech32(this.state.rewardAddress));
            // Create voting proposal
            const votingProposal = VotingProposal.new(hardForkInitiationGovAct, anchor, rewardAddr, BigNum.from_str(this.state.govActDeposit))
            // Create gov action builder and set it in state
            govActionBuilder.add(votingProposal)
            await this.setGovActionBuilder(govActionBuilder)
            return true;
        } catch (err) {
            this.setState({buildingError : String(err)})
            this.resetSomeState();
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
                <h4>✨v1.9.2✨</h4>

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
                <p><span style={{ fontWeight: "bold" }}>.supportedExtensions:</span></p>
                <ul>{this.state.supportedExtensions && this.state.supportedExtensions.length > 0 ? this.state.supportedExtensions.map((item, index) => ( <li style={{ fontSize: "12px" }} key={index}>{item.cip}</li>)) : <li>No supported extensions found.</li>}</ul>
                <h3>CIP-30 Full API</h3>
                <p><span style={{fontWeight: "bold"}}>Network Id (0 = testnet; 1 = mainnet): </span>{this.state.networkId}</p>
                <p><span style={{fontWeight: "bold"}}>.getUTxOs(): </span>{this.state.Utxos?.map(x => <li style={{fontSize: "10px"}} key={`${x.str}${x.multiAssetStr}`}>{`${x.str}${x.multiAssetStr}`}</li>)}</p>
                <p style={{paddingTop: "10px"}}><span style={{fontWeight: "bold"}}>Balance: </span>{this.state.balance}</p>
                <p><span style={{fontWeight: "bold"}}>.getChangeAddress(): </span>{this.state.changeAddress}</p>
                <p><span style={{fontWeight: "bold"}}>.getRewardsAddress(): </span>{this.state.rewardAddress}</p>
                <p><span style={{ fontWeight: "bold" }}>.getExtensions():</span></p>
                <ul>{this.state.enabledExtensions && this.state.enabledExtensions.length > 0 ? this.state.enabledExtensions.map((item, index) => ( <li style={{ fontSize: "12px" }} key={index}>{item.cip}</li>)) : <li>No extensions enabled.</li>}</ul>
                <hr style={{marginTop: "40px", marginBottom: "10px"}}/>
                <h1>CIP-95 🤠</h1>
                <p><span style={{fontWeight: "bold"}}>.cip95.getPubDRepKey(): </span>{this.state.dRepKey}</p>
                <p><span style={{fontWeight: "lighter"}}>CIP-129 Hex DRep ID (byte + byte + Pub DRep key hash): </span>{this.state.cip129dRepID}</p>
                <p><span style={{fontWeight: "lighter"}}>CIP-129 Bech32 DRep ID: </span>{this.state.cip129dRepIDBech32}</p>
                <p><span style={{fontWeight: "lighter"}}>Legacy CIP-105 Hex DRep ID (Pub DRep key hash): </span>{this.state.cip105dRepID}</p>
                <p><span style={{fontWeight: "lighter"}}>Legacy CIP-105 Bech32 DRep ID: </span>{this.state.cip105dRepIDBech32}</p>
                <p><span style={{ fontWeight: "bold" }}>.cip95.getRegisteredPubStakeKeys():</span></p>
                <ul>{this.state.regStakeKeys && this.state.regStakeKeys.length > 0 ? this.state.regStakeKeys.map((item, index) => ( <li style={{ fontSize: "12px" }} key={index}>{item}</li>)) : <li>No registered public stake keys returned.</li>}</ul>
                <p><span style={{fontWeight: "lighter"}}> First registered Stake Key Hash (hex): </span>{this.state.regStakeKeyHashHex}</p>
                <p><span style={{ fontWeight: "bold" }}>.cip95.getUnregisteredPubStakeKeys():</span></p>
                <ul>{this.state.regStakeKeys && this.state.unregStakeKeys.length > 0 ? this.state.unregStakeKeys.map((item, index) => ( <li style={{ fontSize: "12px" }} key={index}>{item}</li>)) : <li>No unregistered public stake keys returned.</li>}</ul>
                <p><span style={{fontWeight: "lighter"}}> First unregistered Stake Key Hash (hex): </span>{this.state.unregStakeKeyHashHex}</p>
                <hr style={{marginTop: "10px", marginBottom: "10px"}}/>

                <label>
                <span style={{ paddingRight: "5px", paddingLeft: '20px' }}>Governance Actions?</span>
                    <input
                        type="checkbox"
                        style={{ paddingRight: "10px", paddingLeft: "10px"}}
                        checked={this.state.seeGovActs}
                        onChange={() => this.setState({ seeGovActs: !this.state.seeGovActs })}
                    />
                </label>
                <label>
                <span style={{ paddingRight: "5px", paddingLeft: '20px' }}>Combination Certificates?</span>
                    <input
                        type="checkbox"
                        style={{ paddingRight: "10px", paddingLeft: "10px"}}
                        checked={this.state.seeCombos}
                        onChange={() => this.setState({ seeCombos: !this.state.seeCombos })}
                    />
                </label>
                <label>
                    <span style={{ paddingRight: "5px", paddingLeft: '20px' }}>Constitutional Committee Certs?</span>
                    <input
                        type="checkbox"
                        style={{ paddingRight: "10px", paddingLeft: "10px"}}
                        checked={this.state.seeCCCerts}
                        onChange={() => this.setState({ seeCCCerts: !this.state.seeCCCerts })}
                    />
                </label>
                <label>
                    <span style={{ paddingRight: "5px", paddingLeft: '20px' }}>Miscellaneous?</span>
                    <input
                        type="checkbox"
                        style={{ paddingRight: "10px", paddingLeft: "10px"}}
                        checked={this.state.seeMisc}
                        onChange={() => this.setState({ seeMisc: !this.state.seeMisc })}
                    />
                </label>                   

                <hr style={{marginTop: "10px", marginBottom: "10px"}}/>
                <p><span style={{fontWeight: "bold"}}>Use CIP-95 .signTx(): </span></p>
                <p><span style={{fontWeight: "lighter"}}> Basic Governance Functions</span></p>
                <Tabs id="cip95-basic" vertical={true} onChange={this.handle95TabId} selectedTab95Id={this.state.selected95BasicTabId}>
                    <Tab id="1" title="🦸‍♀️ Vote Delegation" panel={
                        <div style={{marginLeft: "20px"}}>

                            <FormGroup
                                helperText="CIP-105 DRep ID | abstain | no confidence"
                                label="Target of Vote Delegation:"
                            >
                                <InputGroup
                                    disabled={false}
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
                                    onChange={(event) => this.setState({voteDelegationStakeCred: event.target.value})}
                                    value={this.state.voteDelegationStakeCred}
                                />
                            </FormGroup>

                            <button style={{padding: "10px"}} onClick={ () => this.buildVoteDelegationCert()}>Build cert, add to Tx</button>
                        </div>
                    } />
                    <Tab id="2" title="👷‍♂️ DRep Registration" panel={
                        <div style={{marginLeft: "20px"}}>

                            <FormGroup
                                label="CIP-105 DRep ID:"
                                helperText="(Bech32 or Hex encoded)"
                            >
                                <InputGroup
                                    disabled={false}
                                    onChange={(event) => this.setState({dRepRegTarget: event.target.value})}
                                    value={this.state.dRepRegTarget}
                                />
                            </FormGroup>

                            <FormGroup
                                helperText="This should align with current protocol parameters (in lovelace)"
                                label="DRep Registration Deposit Amount"
                            >
                                <InputGroup
                                    disabled={false}
                                    onChange={(event) => this.setState({dRepDeposit : event.target.value})}
                                    value={this.state.dRepDeposit}
                                />
                            </FormGroup>

                            <FormGroup
                                helperText=""
                                label="Optional: Metadata URL"
                            >
                                <InputGroup
                                    disabled={false}
                                    onChange={(event) => this.setState({cip95MetadataURL: event.target.value})}
                                />
                            </FormGroup>

                            <FormGroup
                                helperText=""
                                label="Optional: Metadata Hash"
                            >
                                <InputGroup
                                    disabled={false}
                                    onChange={(event) => this.setState({cip95MetadataHash: event.target.value})}
                                />
                            </FormGroup>

                            <button style={{padding: "10px"}} onClick={ () => this.buildDRepRegCert()}>Build cert, add to Tx</button>
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
                                    onChange={(event) => this.setState({cip95MetadataURL: event.target.value})}
                                />
                            </FormGroup>

                            <FormGroup
                                helperText=""
                                label="Optional: Metadata Hash"
                            >
                                <InputGroup
                                    disabled={false}
                                    onChange={(event) => this.setState({cip95MetadataHash: event.target.value})}
                                />
                            </FormGroup>

                            <button style={{padding: "10px"}} onClick={ () => this.buildDRepUpdateCert()}>Build cert, add to Tx</button>
                        </div>
                    } />

                    <Tab id="4" title="👴 DRep Retirement" panel={
                        <div style={{marginLeft: "20px"}}>
                            <FormGroup
                                helperText="This should align with how much was paid during registration (in lovelace)"
                                label="DRep Registration Deposit Refund Amount"
                            >
                                <InputGroup
                                    disabled={false}
                                    onChange={(event) => this.setState({dRepDeposit : event.target.value})}
                                    value={this.state.dRepDeposit}
                                />
                            </FormGroup>

                            <button style={{padding: "10px"}} onClick={ () => this.buildDRepRetirementCert()}>Build cert, add to Tx</button>
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
                                    onChange={(event) => this.setState({voteGovActionTxHash: event.target.value})}
                                />
                            </FormGroup>

                            <FormGroup
                                helperText=""
                                label="Gov Action Tx Vote Index"
                            >
                                <InputGroup
                                    disabled={false}
                                    onChange={(event) => this.setState({voteGovActionTxIndex: event.target.value})}
                                />
                            </FormGroup>

                            <FormGroup
                                helperText="Yes | No | Abstain"
                                label="Vote Choice"
                            >
                                <InputGroup
                                    disabled={false}
                                    onChange={(event) => this.setState({voteChoice: event.target.value})}
                                />
                            </FormGroup>

                            <FormGroup
                                label="Optional: Metadata URL"
                            >
                                <InputGroup
                                    disabled={false}
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
                                    onChange={(event) => this.setState({cip95MetadataHash: event.target.value})}
                                />
                            </FormGroup>
                            <button style={{padding: "10px"}} onClick={ () => this.buildVote()}>Build cert, add to Tx</button>
                        </div>
                    } />
                    <Tabs.Expander />
                </Tabs>

                {this.state.seeGovActs && (
                <>
                    <hr style={{marginTop: "10px", marginBottom: "10px"}}/>
                    <p><span style={{fontWeight: "lighter"}}> Governance Actions</span></p>

                    <FormGroup
                        helperText="This should align with current protocol parameters (in lovelace)"
                        label="Governance Action Deposit Amount"
                        >
                        <InputGroup
                            disabled={false}
                            onChange={(event) => this.setState({govActDeposit : event.target.value})}
                            value={this.state.govActDeposit}
                        />
                    </FormGroup>

                    <FormGroup
                        label="Metadata URL"
                        >
                        <InputGroup
                            disabled={false}
                            onChange={(event) => this.setState({gaMetadataURL: event.target.value})}
                            defaultValue={this.state.gaMetadataURL}
                        />
                    </FormGroup>

                    <FormGroup
                        label="Metadata Hash"
                        >
                        <InputGroup
                            disabled={false}
                            onChange={(event) => this.setState({gaMetadataHash: event.target.value})}
                            defaultValue={this.state.gaMetadataHash}
                        />
                    </FormGroup>               

                    <Tabs id="cip95-actions" vertical={true} onChange={this.handle95TabId} selectedTab95Id={this.state.selected95ActionsTabId}>
                        <Tab id="1" title="💡 Governance Action: Motion of no-confidence" panel={
                            <div style={{marginLeft: "20px"}}>

                                <FormGroup
                                    label="Optional: Previously enacted no-confidence action tx hash"
                                    helperText="Required if there has been a no-confidence action enacted before"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({govActPrevActionHash: event.target.value})}
                                    />
                                </FormGroup>

                                <FormGroup
                                    label="Optional: Previously enacted no-confidence action tx index"
                                    helperText="Required if there has been a no-confidence action enacted before"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({govActPrevActionIndex: event.target.value})}
                                    />
                                </FormGroup>

                                <button style={{padding: "10px"}} onClick={ () => this.buildMotionOfNoConfidenceAction() }>Build cert, add to Tx</button>

                            </div>
                        } />
                        <Tab id="2" title="💡 Governance Action: Update Constitutional Committee" panel={
                            
                            <div style={{marginLeft: "20px"}}>
                                <h4>For convenience we limit to adding or removing only one credential at a time. </h4>
                                <FormGroup
                                    helperText="(Bech32 or Hex encoded)"
                                    label="Optional: Committee Cold Credential to add"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({committeeAdd: event.target.value})}
                                    />
                                </FormGroup>

                                <FormGroup
                                    label="Optional: Committee Cold Credential expiry epoch"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({committeeExpiry: event.target.value})}
                                    />
                                </FormGroup>

                                <FormGroup
                                    helperText="(Bech32 or Hex encoded)"
                                    label="Optional: Committee Cold Credential to remove"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({committeeRemove: event.target.value})}
                                    />
                                </FormGroup>

                                <FormGroup
                                    helperText="1 / input"
                                    label="Optional: New Quorum Threshold"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({committeeQuorum: event.target.value})}
                                    />
                                </FormGroup>

                                <FormGroup
                                    label="Optional: Previously enacted update committee action tx hash"
                                    helperText="Required if there has been a update committee action enacted before"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({govActPrevActionHash: event.target.value})}
                                    />
                                </FormGroup>

                                <FormGroup
                                    label="Optional: Previously enacted update committee action tx index"
                                    helperText="Required if there has been a update committee action enacted before"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({govActPrevActionIndex: event.target.value})}
                                    />
                                </FormGroup>

                                <button style={{padding: "10px"}} onClick={ () => this.buildUpdateCommitteeGovAct() }>Build cert, add to Tx</button>

                            </div>
                        } />
                        <Tab id="3" title="💡 Governance Action: Update Constitution" panel={
                            <div style={{marginLeft: "20px"}}>

                                <FormGroup
                                    label="New Constitution URL"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({constURL: event.target.value})}
                                    />
                                </FormGroup>

                                <FormGroup
                                    label="New Constituion Hash"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({constHash: event.target.value})}
                                    />
                                </FormGroup>

                                <FormGroup
                                    label="Optional: New Guard Rails Script Script hash"
                                    helperText="The hash of a new guard rails script hash."
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({guardRailsScriptHash: event.target.value})}
                                    />
                                </FormGroup>

                                <FormGroup
                                    label="Optional: Previously enacted update constitution action tx hash"
                                    helperText="Required if there has been a update constitution action enacted before"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({govActPrevActionHash: event.target.value})}
                                    />
                                </FormGroup>

                                <FormGroup
                                    label="Optional: Previously enacted update constitution action tx index"
                                    helperText="Required if there has been a update constitution action enacted before"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({govActPrevActionIndex: event.target.value})}
                                    />
                                </FormGroup>

                                <button style={{padding: "10px"}} onClick={ () => this.buildNewConstGovAct() }>Build cert, add to Tx</button>

                            </div>
                        } />
                        <Tab id="4" title="💡 Governance Action: Hard-Fork Initiation" panel={
                            <div style={{marginLeft: "20px"}}>

                                <FormGroup
                                    helperText=""
                                    label="Update Major Version"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({hardForkUpdateMajor: event.target.value})}
                                        defaultValue={this.state.hardForkUpdateMajor}
                                    />
                                </FormGroup>

                                <FormGroup
                                    helperText=""
                                    label="Update Minor Version"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({hardForkUpdateMinor: event.target.value})}
                                        defaultValue={this.state.hardForkUpdateMinor}
                                    />
                                </FormGroup>

                                <FormGroup
                                    label="Optional: Previously enacted hardfork action tx hash"
                                    helperText="Required if there has been a hardfork action enacted before"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({govActPrevActionHash: event.target.value})}
                                    />
                                </FormGroup>

                                <FormGroup
                                    label="Optional: Previously enacted hardfork action tx index"
                                    helperText="Required if there has been a hardfork action enacted before"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({govActPrevActionIndex: event.target.value})}
                                    />
                                </FormGroup>

                                <button style={{padding: "10px"}} onClick={ () => this.buildHardForkAction() }>Build cert, add to Tx</button>

                            </div>
                        } />
                        <Tab id="5" title="[WIP] 💡 Governance Action: Protocol Parameter Update" panel={
                            <div style={{marginLeft: "20px"}}>
                                <h4>WIP because this only allows changing of stake key deposit to 0. </h4>

                                <FormGroup
                                    label="Optional: Previously enacted update parameter action tx hash"
                                    helperText="Required if there has been a update parameter action enacted before"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({govActPrevActionHash: event.target.value})}
                                    />
                                </FormGroup>

                                <FormGroup
                                    label="Optional: Previously enacted update parameter action tx index"
                                    helperText="Required if there has been a update parameter action enacted before"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({govActPrevActionIndex: event.target.value})}
                                    />
                                </FormGroup>

                                <FormGroup
                                    label="Optional: Guard Rails Script (Hex)"
                                    helperText="Required if there has been a guard rails script ratified on-chain currently."
                                >
                                    <InputGroup
                                        disabled={false}
                                        value={this.state.guardrailScript}
                                        onChange={(event) => this.setState({guardrailScript: event.target.value})}
                                    />
                                </FormGroup>

                                <button style={{padding: "10px"}} onClick={ () => this.buildProtocolParamAction() }>Build cert, add to Tx</button>

                            </div>
                        } />
                        <Tab id="6" title="💡 Governance Action: Treasury Withdrawal" panel={
                            <div style={{marginLeft: "20px"}}>
                                <h4>For convenience we only allow withdrawal to one address. </h4>
                                <FormGroup
                                    label="Treasury Withdrawal Target Rewards Address"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({treasuryTarget: event.target.value})}
                                    />
                                </FormGroup>

                                <FormGroup
                                    label="Treasury Withdrawal Amount"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({treasuryWithdrawalAmount: event.target.value})}
                                    />
                                </FormGroup>

                                <FormGroup
                                    label="Optional: Guard Rails Script (Hex)"
                                    helperText="Required if there has been a guard rails script ratified on-chain currently."
                                >
                                    <InputGroup
                                        disabled={false}
                                        value={this.state.guardrailScript}
                                        onChange={(event) => this.setState({guardrailScript: event.target.value})}
                                    />
                                </FormGroup>

                                <button style={{padding: "10px"}} onClick={ () => this.buildTreasuryGovAct() }>Build cert, add to Tx</button>

                            </div>
                        } />
                        <Tab id="7" title="💡 Governance Action: Info action" panel={
                            <div style={{marginLeft: "20px"}}>

                                <button style={{padding: "10px"}} onClick={ () => this.buildNewInfoGovAct() }>Build cert, add to Tx</button>

                            </div>
                        } />

                        <Tabs.Expander />
                    </Tabs>
                    </>
                )}

                {this.state.seeCombos && (
                <>
                    <hr style={{marginTop: "10px", marginBottom: "10px"}}/>
                    <p><span style={{fontWeight: "lighter"}}> Combination Certificates</span></p>

                    <Tabs id="cip95-combo" vertical={true} onChange={this.handle95TabId} selectedTab95Id={this.state.selected95ComboTabId}>
                        <Tab id="1" title="Stake Delegation and Vote Delegation Certificate" panel={
                            <div style={{marginLeft: "20px"}}>
                                <FormGroup
                                    label="Target of Pool (keyhash):"
                                    helperText="(Bech32 or Hex encoded)"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({comboPoolHash: event.target.value})}
                                        value={this.state.comboPoolHash}
                                    />
                                </FormGroup>
                                <FormGroup
                                    label="Target of Vote Delegation:"
                                    helperText="CIP-105 DRep ID | abstain | no confidence"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({comboVoteDelegTarget: event.target.value})}
                                        value={this.state.comboVoteDelegTarget}
                                    />
                                </FormGroup>
                                <FormGroup
                                    label="Stake Credential:"
                                    helperText="(Bech32 or Hex encoded)"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({comboStakeCred: event.target.value})}
                                        value={this.state.comboStakeCred}
                                    />
                                </FormGroup>

                                <button style={{padding: "10px"}} onClick={ () => this.addStakeVoteDelegCert() }>Build cert, add to Tx</button>
                            </div>
                        } />
                        <Tab id="2" title="Stake Registration and Stake Pool Delegation Certificate" panel={
                            <div style={{marginLeft: "20px"}}>
                                <FormGroup
                                    label="Target of Pool (keyhash):"
                                    helperText="(Bech32 or Hex encoded)"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({comboPoolHash: event.target.value})}
                                        value={this.state.comboPoolHash}
                                    />
                                </FormGroup>
                                <FormGroup
                                    label="Stake Credential:"
                                    helperText="(Bech32 or Hex encoded)"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({comboStakeCred: event.target.value})}
                                        value={this.state.comboStakeCred}
                                    />
                                </FormGroup>

                                <FormGroup
                                    helperText="This should align with current protocol parameters (in lovelace)"
                                    label="Stake Key Deposit Amount"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({comboStakeRegCoin : event.target.value})}
                                        value={this.state.comboStakeRegCoin}
                                    />
                                </FormGroup>
                                
                                <button style={{padding: "10px"}} onClick={ () => this.addStakeRegDelegCert() }>Build cert, add to Tx</button>
                            </div>
                        } />
                        <Tab id="3" title="Stake Registration and Vote Delegation Certificate" panel={
                            <div style={{marginLeft: "20px"}}>
                                <FormGroup
                                    label="Target of Vote Delegation:"
                                    helperText="CIP-105 DRep ID | abstain | no confidence"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({comboVoteDelegTarget: event.target.value})}
                                        value={this.state.comboVoteDelegTarget}
                                    />
                                </FormGroup>
                                <FormGroup
                                    label="Stake Credential:"
                                    helperText="(Bech32 or Hex encoded)"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({comboStakeCred: event.target.value})}
                                        value={this.state.comboStakeCred}
                                    />
                                </FormGroup>

                                <FormGroup
                                    helperText="This should align with current protocol parameters (in lovelace)"
                                    label="Stake Key Deposit Amount"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({comboStakeRegCoin : event.target.value})}
                                        value={this.state.comboStakeRegCoin}
                                    />
                                </FormGroup>
                                
                                <button style={{padding: "10px"}} onClick={ () => this.addStakeRegVoteDelegCert() }>Build cert, add to Tx</button>
                            </div>
                        } />
                        <Tab id="4" title="Stake Registration, Stake Pool Delegation and Vote Delegation Certificate" panel={
                            <div style={{marginLeft: "20px"}}>
                                <FormGroup
                                    label="Target of Pool (keyhash):"
                                    helperText="(Bech32 or Hex encoded)"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({comboPoolHash: event.target.value})}
                                        value={this.state.comboPoolHash}
                                    />
                                </FormGroup>
                                <FormGroup
                                    label="Target of Vote Delegation:"
                                    helperText="DRep ID | abstain | no confidence"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({comboVoteDelegTarget: event.target.value})}
                                        value={this.state.comboVoteDelegTarget}
                                    />
                                </FormGroup>
                                <FormGroup
                                    label="Stake Credential:"
                                    helperText="(Bech32 or Hex encoded)"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({comboStakeCred: event.target.value})}
                                        value={this.state.comboStakeCred}
                                    />
                                </FormGroup>

                                <FormGroup
                                    helperText="This should align with current protocol parameters (in lovelace)"
                                    label="Stake Key Deposit Amount"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({comboStakeRegCoin : event.target.value})}
                                        value={this.state.comboStakeRegCoin}
                                    />
                                </FormGroup>
                                
                                <button style={{padding: "10px"}} onClick={ () => this.addStakeRegStakeVoteDelegCert() }>Build cert, add to Tx</button>
                            </div>
                        } />

                        <Tabs.Expander />
                    </Tabs>
                    </>
                )}

                {this.state.seeCCCerts && (
                <>
                   <hr style={{marginTop: "10px", marginBottom: "10px"}}/>
                    <p><span style={{fontWeight: "lighter"}}> Consitutional Commitee Certs (under CIP95 wallet SHOULD NOT be able to witness these correctly)</span></p>

                    <Tabs id="cip95-cc" vertical={true} onChange={this.handle95TabId} selectedTab95Id={this.state.selected95CCTabId}>
                        <Tab id="1" title="🔥 Authorize CC Hot Credential" panel={
                            <div style={{marginLeft: "20px"}}>
                                <FormGroup
                                    label="CC Cold Credential"
                                    style={{ paddingTop: "10px" }}
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({ccColdCred : event.target.value})}
                                        value={this.state.ccColdCred}
                                    />
                                </FormGroup>

                                <FormGroup
                                    label="CC Hot Credential"
                                    style={{ paddingTop: "10px" }}
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({ccHotCred : event.target.value})}
                                        value={this.state.ccHotCred}
                                    />
                                </FormGroup>

                                <button style={{padding: "10px"}} onClick={ () => this.addAuthorizeHotCredCert() }>Build cert, add to Tx</button>

                            </div>
                        } />
                        <Tab id="2" title="🧊 Resign CC Cold Credential" panel={
                            <div style={{marginLeft: "20px"}}>
                                <FormGroup
                                    label="CC Cold Credential"
                                    style={{ paddingTop: "10px" }}
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({ccColdCred : event.target.value})}
                                        value={this.state.ccColdCred}
                                    />
                                </FormGroup>

                                <FormGroup
                                    label="Optional: Metadata URL"
                                >
                                    <InputGroup
                                        disabled={false}
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
                                        onChange={(event) => this.setState({cip95MetadataHash: event.target.value})}
                                    />
                                </FormGroup>

                                <button style={{padding: "10px"}} onClick={ () => this.addResignColdCredCert() }>Build cert, add to Tx</button>

                            </div>
                        } />
                        <Tabs.Expander />
                    </Tabs>
                    </>
                )}
                
                {this.state.seeMisc && (
                <>
                    <hr style={{marginTop: "10px", marginBottom: "10px"}}/>
                    <p><span style={{fontWeight: "lighter"}}> Random Stuff</span></p>

                    <Tabs id="cip95-misc" vertical={true} onChange={this.handle95TabId} selectedTab95Id={this.state.selected95MiscTabId}>
                        <Tab id="1" title="🔑 Register Stake Key" panel={
                            <div style={{marginLeft: "20px"}}>

                                <label>
                                    <input
                                        type="checkbox"
                                        style={{ paddingRight: "10px" }}
                                        checked={this.state.stakeKeyWithCoin}
                                        onChange={() => this.setState({ stakeKeyWithCoin: !this.state.stakeKeyWithCoin })}
                                    />
                                    <span style={{ paddingLeft: '10px' }}>Use the new Conway Stake Registration Certificate (with coin)</span>
                                </label>

                                <FormGroup
                                    label="Stake Key Hash"
                                    style={{ paddingTop: "10px" }}
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({stakeKeyReg : event.target.value})}
                                        value={this.state.stakeKeyReg}
                                    />
                                </FormGroup>
                                <FormGroup
                                    helperText="This should align with current protocol parameters (in lovelace)"
                                    label="Stake Key Deposit Amount"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({stakeKeyCoin : event.target.value})}
                                        value={this.state.stakeKeyCoin}
                                    />
                                </FormGroup>

                                <button style={{padding: "10px"}} onClick={ () => this.addStakeKeyRegCert() }>Build cert, add to Tx</button>

                            </div>
                        } />
                        <Tab id="2" title="🚫🔑 Unregister Stake Key" panel={
                            <div style={{marginLeft: "20px"}}>
                                <label>
                                    <input
                                        type="checkbox"
                                        style={{ paddingRight: "10px" }}
                                        checked={this.state.stakeKeyWithCoin}
                                        onChange={() => this.setState({ stakeKeyWithCoin: !this.state.stakeKeyWithCoin })}
                                    />
                                    <span style={{ paddingLeft: '10px' }}>Use the new Conway Stake Unregisteration Certificate (with coin)</span>
                                </label>

                                <FormGroup
                                    helperText=""
                                    label="Stake Key Hash"
                                    style={{ paddingTop: "10px" }}
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({stakeKeyUnreg : event.target.value})}
                                        value={this.state.stakeKeyUnreg}
                                    />
                                </FormGroup>
                                
                                <FormGroup
                                    helperText="This should align with how much was paid during registration (in lovelace)"
                                    label="Stake Key Deposit Refund Amount"
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({stakeKeyCoin : event.target.value})}
                                        value={this.state.stakeKeyCoin}
                                    />
                                </FormGroup>

                                <button style={{padding: "10px"}} onClick={ () => this.addStakeKeyUnregCert() }>Build cert, add to Tx</button>
                            </div>
                        } />
                        <Tab id="3" title="🤑 Treasury Donation (TxBody)" panel={
                            <div style={{marginLeft: "20px"}}>

                                <FormGroup
                                    helperText="(lovelace)"
                                    label="Donation amount"
                                    style={{ paddingTop: "10px" }}
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({treasuryDonationAmount : event.target.value})}
                                        value={this.state.treasuryDonationAmount}
                                    />
                                </FormGroup>

                            </div>
                        } />
                        <Tab id="4" title="🏧 Current Treasury Value (TxBody)" panel={
                            <div style={{marginLeft: "20px"}}>

                                <FormGroup
                                    helperText="(lovelace)"
                                    label="Current Treasury Value"
                                    style={{ paddingTop: "10px" }}
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({treasuryValueAmount : event.target.value})}
                                        value={this.state.treasuryValueAmount}
                                    />
                                </FormGroup>

                            </div>
                        } />
                        <Tab id="5" title="💸 MIR Transfer (depricated in Conway)" panel={
                            <div style={{marginLeft: "20px"}}>

                                <FormGroup
                                    helperText="Hex key hash"
                                    label="Recieving stake key Hash"
                                    style={{ paddingTop: "10px" }}
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({mirStakeCred : event.target.value})}
                                        defaultValue={this.state.mirStakeCred}
                                    />
                                </FormGroup>

                                <FormGroup
                                    helperText="(Lovelace)"
                                    label="MIR Delta Amount"
                                    style={{ paddingTop: "10px" }}
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({mirAmount : event.target.value})}
                                        defaultValue={this.state.mirAmount}
                                    />
                                </FormGroup>

                                <FormGroup
                                    helperText="0 for the reserve, 1 for treasury."
                                    label="MIR Pot Number"
                                    style={{ paddingTop: "10px" }}
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({mirPot : event.target.value})}
                                        defaultValue={this.state.mirPot}
                                    />
                                </FormGroup>

                                <button style={{padding: "10px"}} onClick={ () => this.addMIRCert() }>Build cert, add to Tx</button>

                            </div>
                        } />

                        <Tab id="6" title="🧬 Genesis Delegation Certificate (depricated in Conway)" panel={
                            <div style={{marginLeft: "20px"}}>

                                <FormGroup
                                    helperText="(Hex, 56 chars)"
                                    label="Genesis Hash"
                                    style={{ paddingTop: "10px" }}
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({genesisHash : event.target.value})}
                                        value={this.state.genesisHash}
                                    />
                                </FormGroup>

                                <FormGroup
                                    helperText="(Hex, 56 chars)"
                                    label="Gensis Delegation Hash"
                                    style={{ paddingTop: "10px" }}
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({genesisDelegationHash : event.target.value})}
                                        value={this.state.genesisDelegationHash}
                                    />
                                </FormGroup>

                                <FormGroup
                                    helperText="(Hex, 64 chars)"
                                    label="VRF Keyhash"
                                    style={{ paddingTop: "10px" }}
                                >
                                    <InputGroup
                                        disabled={false}
                                        onChange={(event) => this.setState({vrfKeyHash : event.target.value})}
                                        value={this.state.vrfKeyHash}
                                    />
                                </FormGroup>

                                <button style={{padding: "10px"}} onClick={ () => this.addGenesisDelegationCert() }>Build cert, add to Tx</button>

                            </div>
                        } />

                        <Tab id="7" title=" 💯 Test Basic Transaction" panel={
                            <div style={{marginLeft: "20px"}}>

                                <button style={{padding: "10px"}} onClick={ () => this.buildSubmitConwayTx(true) }>Build empty Tx</button>

                            </div>
                        } />
                        <Tabs.Expander />
                    </Tabs>
                    </>
                )}
                <hr style={{marginTop: "10px", marginBottom: "10px"}}/>
                <p><span style={{fontWeight: "bold"}}>Contents of transaction: </span></p>

                {!this.state.buildingError && !this.state.signAndSubmitError && (
                    <ul>{this.state.govActsInTx.concat(this.state.certsInTx.concat(this.state.votesInTx)).length > 0 ? this.state.govActsInTx.concat(this.state.certsInTx.concat(this.state.votesInTx)).map((item, index) => ( <li style={{ fontSize: "12px" }} key={index}>{item}</li>)) : <li>No certificates, votes or gov actions in transaction.</li>}</ul>
                )}
                {[
                    { title: "🚨 Error during building 🚨", error: this.state.buildingError },
                    { title: "🚨 Error during sign and submit 🚨", error: this.state.signAndSubmitError }
                ].map(({ title, error }, index) => (
                    error && (
                        <React.Fragment key={index}>
                            <h5>{title}</h5>
                            <div>
                                {typeof error === 'object' && error !== null ? (
                                    <ul>
                                        {Object.entries(error).map(([key, value], i) => (
                                            <li key={i}>
                                                <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p><span style={{ fontWeight: "bold" }}>{error}</span></p>
                                )}
                            </div>
                        </React.Fragment>
                    )
                ))}

                {this.state.treasuryDonationAmount && (
                    <>
                    <p><span style={{fontWeight: "lighter"}}> Treasury Donation Amount: </span>{this.state.treasuryDonationAmount}</p>
                    </>
                )}

                {this.state.treasuryValueAmount && (
                    <>
                    <p><span style={{fontWeight: "lighter"}}> Treasury Value: </span>{this.state.treasuryValueAmount}</p>
                    </>
                )}
                
                <button style={{padding: "10px"}} onClick={ () => this.buildSubmitConwayTx(true) }>.signTx() and .submitTx()</button>
                <button style={{padding: "10px"}} onClick={this.refreshData}>Refresh</button> 

                <hr style={{marginTop: "10px", marginBottom: "10px"}}/>
                {this.state.cip95ResultTx !== '' && this.state.cip95ResultHash !== '' && (
                <>
                    <h5>🚀 Transaction signed and submitted successfully 🚀</h5>
                </>
                )}
                <p><span style={{fontWeight: "bold"}}>Tx Hash: </span>{this.state.cip95ResultHash}</p>
                <p><span style={{fontWeight: "bold"}}>CborHex Tx: </span>{this.state.cip95ResultTx}</p>
                <hr style={{marginTop: "2px", marginBottom: "10px"}}/>
                
                <h5>💖 Powered by CSL 12.1.1 💖</h5>
            </div>
        )
    }
}

export default App;
