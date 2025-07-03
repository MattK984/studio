// Contract addresses
export const DLP_REGISTRY_ADDRESS = '0x4D59880a924526d1dD33260552Ff4328b1E18a43' as const;
export const DLP_PERFORMANCE_ADDRESS = '0x00A5Fffd73fe45f410b888ba83C7FCE886eE6521' as const;

// DLP Registry ABI
export const DLP_REGISTRY_ABI = [
  {
    "inputs": [],
    "name": "dlpsCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "eligibleDlpsListValues",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "dlpId",
        "type": "uint256"
      }
    ],
    "name": "dlps",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "dlpAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "ownerAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "tokenAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "treasuryAddress",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "iconUrl",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "website",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "metadata",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "registrationBlockNumber",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "depositAmount",
            "type": "uint256"
          },
          {
            "internalType": "enum IDLPRegistry.DlpStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "lpTokenId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "verificationBlockNumber",
            "type": "uint256"
          }
        ],
        "internalType": "struct IDLPRegistry.DlpInfo",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// DLP Performance ABI
export const DLP_PERFORMANCE_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "epochId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "dlpId",
        "type": "uint256"
      }
    ],
    "name": "epochDlpPerformances",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "totalScore",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tradingVolume",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "uniqueContributors",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "dataAccessFees",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tradingVolumeScore",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "uniqueContributorsScore",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "dataAccessFeesScore",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tradingVolumeScorePenalty",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "uniqueContributorsScorePenalty",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "dataAccessFeesScorePenalty",
            "type": "uint256"
          }
        ],
        "internalType": "struct IDLPPerformance.EpochDlpPerformanceInfo",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
