import {
    URL,
    BigNum,
    Credential,
    Certificate,
    Ed25519KeyHash,
    DRep,
    Anchor,
    AnchorDataHash,
    StakeRegistration,
    StakeDeregistration,
    StakeAndVoteDelegation,
    StakeRegistrationAndDelegation,
    VoteRegistrationAndDelegation,
    StakeVoteRegistrationAndDelegation,
    CommitteeHotAuth,
    CommitteeColdResign,
    MoveInstantaneousRewardsCert,
    MoveInstantaneousReward,
    MIRToStakeCredentials,
    Int,
    GenesisKeyDelegation,
    GenesisHash,
    GenesisDelegateHash,
    VRFKeyHash,

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
        console.log('Error in parsing credential input, not Hex or Bech32');
        return null;
      }
    }
}

function stringToDRep (input) {
    let targetDRep;
    try {
        if ((input).toUpperCase() === 'ABSTAIN') {
            targetDRep = DRep.new_always_abstain();
        } else if ((input).toUpperCase() === 'NO CONFIDENCE') {
            targetDRep = DRep.new_always_no_confidence();
        } else {
            const dRepKeyCred = keyHashStringToCredential(input)
            targetDRep = DRep.new_key_hash(dRepKeyCred.to_keyhash());
        };
        return targetDRep;
    } catch (err) {
        console.log(err);
        console.log('Error in parsing selected DRep!');
        return null;
    }
}

function stringToBigNum (input) {
    try {
        const targetBigNum = BigNum.from_str(input);    
        return targetBigNum;
    } catch (err) {
        console.log(err);
        console.log('Error in deposit amount!');
        return null;
    }
}

// Register Stake Key
export function buildStakeKeyRegCert(certBuilder, stakeCredential, withCoin=false, deposit="2000000") {
    try {
        const stakeCred = keyHashStringToCredential(stakeCredential);
        let stakeKeyRegCert
        if (withCoin){
            stakeKeyRegCert = StakeRegistration.new_with_coin(stakeCred, stringToBigNum(deposit));
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

// Unregister Stake Key
export function buildStakeKeyUnregCert(certBuilder, stakeCredential, withCoin=false, deposit="2000000") {
        try {
            const stakeCred = keyHashStringToCredential(stakeCredential);
            let stakeKeyUnregCert
            if (withCoin){
                stakeKeyUnregCert = StakeDeregistration.new_with_coin(stakeCred, stringToBigNum(deposit));
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

// Combination Certs

// Stake Delegation and Vote Delegation Cert
export function buildStakeVoteDelegCert(certBuilder, stakeCredential, poolHash, dRep) {
    try {
        const stakeCred = keyHashStringToCredential(stakeCredential);
        const poolId = keyHashStringToCredential(poolHash).to_keyhash();
        const targetDRep = stringToDRep(dRep);
        const stakeVoteDelegCert = StakeAndVoteDelegation.new(stakeCred, poolId, targetDRep);
        certBuilder.add(Certificate.new_stake_and_vote_delegation(stakeVoteDelegCert));
        return certBuilder;
    } catch (err) {
        console.error(err);
        return null;
    }
}

// Stake Registration and Stake Delegation Cert
export function buildStakeRegDelegCert(certBuilder, stakeCredential, poolHash, deposit="2000000") {
    try {
        const stakeCred = keyHashStringToCredential(stakeCredential);
        const poolId = keyHashStringToCredential(poolHash).to_keyhash();
        const depositAmount = stringToBigNum(deposit);
        const stakeRegDelegCert = StakeRegistrationAndDelegation.new(stakeCred, poolId, depositAmount);
        certBuilder.add(Certificate.new_stake_registration_and_delegation(stakeRegDelegCert));
        return certBuilder;
    } catch (err) {
        console.error(err);
        return null;
    }
}

// Stake Registration and Vote Delegation Cert
export function buildStakeRegVoteDelegCert(certBuilder, stakeCredential, dRep, deposit="2000000") {
    try {
        const stakeCred = keyHashStringToCredential(stakeCredential);
        const targetDRep = stringToDRep(dRep);
        const depositAmount = stringToBigNum(deposit);
        const stakeRegVoteDelegCert = VoteRegistrationAndDelegation.new(stakeCred, targetDRep, depositAmount);
        certBuilder.add(Certificate.new_vote_registration_and_delegation(stakeRegVoteDelegCert));
        return certBuilder;
    } catch (err) {
        console.error(err);
        return null;
    }
}

// Stake Registration, Stake Delegation and Vote Delegation Cert
export function buildStakeRegStakeVoteDelegCert(certBuilder, stakeCredential, poolHash, dRep, deposit="2000000") {
    try {
        const stakeCred = keyHashStringToCredential(stakeCredential);
        const poolId = keyHashStringToCredential(poolHash).to_keyhash();
        const targetDRep = stringToDRep(dRep);
        const depositAmount = stringToBigNum(deposit);
        const stakeRegStakeVoteDelegCert = StakeVoteRegistrationAndDelegation.new(stakeCred, poolId, targetDRep, depositAmount);
        certBuilder.add(Certificate.new_stake_vote_registration_and_delegation(stakeRegStakeVoteDelegCert));
        return certBuilder;
    } catch (err) {
        console.error(err);
        return null;
    }
}

// Committee Certs

// Authorize Hot Credential
export function buildAuthorizeHotCredCert(certBuilder, coldCredential, hotCredential) {
    try {
        const coldCredentialTarget = keyHashStringToCredential(coldCredential)
        const hotCredentialTarget = keyHashStringToCredential(hotCredential)
        const committeeHotAuthCert = CommitteeHotAuth.new(coldCredentialTarget, hotCredentialTarget);
        certBuilder.add(Certificate.new_committee_hot_auth(committeeHotAuthCert));
        return certBuilder;
    } catch (err) {
        console.error(err);
        return null;
    }
}

// Resign Cold Credential
export function buildResignColdCredCert(certBuilder, coldCredential, anchorURL=undefined, anchorHash=undefined) {
    try {
        const coldCredentialTarget = keyHashStringToCredential(coldCredential)
        let committeeHotAuthCert;
        if (anchorURL && anchorHash) {
            const anchor = Anchor.new(URL.new(anchorURL), AnchorDataHash.from_hex(anchorHash));
            committeeHotAuthCert = CommitteeColdResign.new_with_anchor(coldCredentialTarget, anchor);
        } else {
            committeeHotAuthCert = CommitteeColdResign.new(coldCredentialTarget);
        }
        certBuilder.add(Certificate.new_committee_cold_resign(committeeHotAuthCert));
        return certBuilder;
    } catch (err) {
        console.error(err);
        return null;
    }
}

// Deprecated Certs

// Move Instantaneous Rewards Cert
export function buildMIRCert(certBuilder, stakeCredential, deltaAmount="2000000", potNumber) {
    try {
        const mirCreds = MIRToStakeCredentials.new();
        const delta = Int.new(BigNum.from_str(deltaAmount));
        console.log("stakecred:", stakeCredential);
        const credential = keyHashStringToCredential(stakeCredential);
        mirCreds.insert(credential, delta);
        const mir = MoveInstantaneousReward.new_to_stake_creds(potNumber, mirCreds);
        const mirCert = MoveInstantaneousRewardsCert.new(mir);
        certBuilder.add(Certificate.new_move_instantaneous_rewards_cert(mirCert));
        return certBuilder;
    } catch (err) {
        console.error(err);
        return null;
    }
}

// Genesis Key Delegation Cert
export function buildGenesisKeyDelegationCert(certBuilder, genesisHashHex, genesisDelegateHashHex, vrfKeyHashHex) {
    try {
        const genesisHash = GenesisHash.from_hex(genesisHashHex);
        const genesisDelegateHash = GenesisDelegateHash.from_hex(genesisDelegateHashHex);
        const vrfKeyHash = VRFKeyHash.from_hex(vrfKeyHashHex);
        const genesisCert = GenesisKeyDelegation.new(genesisHash, genesisDelegateHash, vrfKeyHash);
        certBuilder.add(Certificate.new_genesis_key_delegation(genesisCert));
        return certBuilder;
    } catch (err) {
        console.error(err);
        return null;
    }
}

