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

// Helper functions

function keyHashStringToCredential (input) {
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
        console.log('Error in parsing credential, not Hex or Bech32');
        return null;
      }
    }
}

export function buildStakeKeyRegCert(certBuilder, stakeCredential, withCoin=false, deposit=2) {
    try {
        const stakeCred = keyHashStringToCredential(stakeCredential);
        let stakeKeyRegCert
        if (withCoin){
            stakeKeyRegCert = StakeRegistration.new_with_coin(stakeCred, BigNum.from_str(deposit.toString()));
        } else {
            stakeKeyRegCert = StakeRegistration.new(stakeCred);
        }
        certBuilder.add(Certificate.new_stake_registration(stakeKeyRegCert));
        return certBuilder;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export function buildStakeKeyUnregCert(certBuilder, stakeCredential, withCoin=false, deposit=2) {
    try {
        const stakeCred = keyHashStringToCredential(stakeCredential);
        let stakeKeyUnregCert
        if (withCoin){
            stakeKeyUnregCert = StakeDeregistration.new_with_coin(stakeCred, BigNum.from_str(deposit.toString()));
        } else {
            stakeKeyUnregCert = StakeDeregistration.new(stakeCred);
        }
        certBuilder.add(Certificate.new_stake_deregistration(stakeKeyUnregCert));
        return certBuilder;
    } catch (err) {
        console.error(err);
        return null;
    }
}