// Contract addresses
export const DLP_REGISTRY_ADDRESS = '0x4D59880a924526d1dD33260552Ff4328b1E18a43' as const;
export const DLP_PERFORMANCE_ADDRESS = '0x847715C7DB37cF286611182Be0bD333cbfa29cc1' as const;

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
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AccessControlBadConfirmation",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "neededRole",
        "type": "bytes32"
      }
    ],
    "name": "AccessControlUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "target",
        "type": "address"
      }
    ],
    "name": "AddressEmptyCode",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "dlpId",
        "type": "uint256"
      }
    ],
    "name": "DlpNotEligible",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "implementation",
        "type": "address"
      }
    ],
    "name": "ERC1967InvalidImplementation",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ERC1967NonPayable",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EnforcedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EpochAlreadyFinalized",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EpochNotEnded",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EpochNotFinalized",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ExpectedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FailedInnerCall",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidDataAccessFeesScore",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidEpochDlpPerformancesCount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidInitialization",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidMetricWeights",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidPenaltyScores",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidTradingVolumeScore",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidUniqueContributorsScore",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotInitializing",
    "type": "error"
  },
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
      },
      {
        "internalType": "uint256",
        "name": "penaltyAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "distributedPenaltyAmount",
        "type": "uint256"
      }
    ],
    "name": "PenaltyAmountLessThanPenaltyDistributed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UUPSUnauthorizedCallContext",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "slot",
        "type": "bytes32"
      }
    ],
    "name": "UUPSUnsupportedProxiableUUID",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "epochId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "dlpId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tradingVolumeScorePenalty",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "uniqueContributorsScorePenalty",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "dataAccessFeesScorePenalty",
        "type": "uint256"
      }
    ],
    "name": "EpochDlpPenaltyUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "epochId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "dlpId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tradingVolume",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "uniqueContributors",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "dataAccessFees",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tradingVolumeScore",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "uniqueContributorsScore",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "dataAccessFeesScore",
        "type": "uint256"
      }
    ],
    "name": "EpochDlpPerformancesOverridden",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "epochId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "dlpId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tradingVolume",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "uniqueContributors",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "dataAccessFees",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tradingVolumeScore",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "uniqueContributorsScore",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "dataAccessFeesScore",
        "type": "uint256"
      }
    ],
    "name": "EpochDlpPerformancesSaved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "version",
        "type": "uint64"
      }
    ],
    "name": "Initialized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tradingVolume",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "uniqueContributors",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "dataAccessFees",
        "type": "uint256"
      }
    ],
    "name": "MetricWeightsUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "previousAdminRole",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "newAdminRole",
        "type": "bytes32"
      }
    ],
    "name": "RoleAdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "implementation",
        "type": "address"
      }
    ],
    "name": "Upgraded",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAINTAINER_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MANAGER_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "UPGRADE_INTERFACE_VERSION",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
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
    "name": "calculateEpochDlpRewards",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "rewardAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "penaltyAmount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "epochId",
        "type": "uint256"
      }
    ],
    "name": "confirmEpochFinalScores",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "dlpRegistry",
    "outputs": [
      {
        "internalType": "contract IDLPRegistry",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
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
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "epochId",
        "type": "uint256"
      }
    ],
    "name": "epochMetricWeights",
    "outputs": [
      {
        "components": [
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
          }
        ],
        "internalType": "struct IDLPPerformance.MetricWeights",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "getRoleAdmin",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasRole",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "ownerAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "dlpRegistryAddress",
        "type": "address"
      }
    ],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "metricWeights",
    "outputs": [
      {
        "components": [
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
          }
        ],
        "internalType": "struct IDLPPerformance.MetricWeights",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
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
    "name": "overrideEpochDlpPenalty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
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
    "name": "overrideEpochDlpReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "epochId",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "dlpId",
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
          }
        ],
        "internalType": "struct IDLPPerformance.EpochDlpPerformanceInput[]",
        "name": "newEpochDlpPerformances",
        "type": "tuple[]"
      }
    ],
    "name": "overrideEpochPerformances",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "proxiableUUID",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "callerConfirmation",
        "type": "address"
      }
    ],
    "name": "renounceRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "epochId",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "dlpId",
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
          }
        ],
        "internalType": "struct IDLPPerformance.EpochDlpPerformanceInput[]",
        "name": "newEpochDlpPerformances",
        "type": "tuple[]"
      }
    ],
    "name": "saveEpochPerformances",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "dlpRegistryAddress",
        "type": "address"
      }
    ],
    "name": "updateDlpRegistry",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
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
          }
        ],
        "internalType": "struct IDLPPerformance.MetricWeights",
        "name": "newMetricWeights",
        "type": "tuple"
      }
    ],
    "name": "updateMetricWeights",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "vanaEpochAddress",
        "type": "address"
      }
    ],
    "name": "updateVanaEpoch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newImplementation",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "upgradeToAndCall",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "vanaEpoch",
    "outputs": [
      {
        "internalType": "contract IVanaEpoch",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "version",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  }
] as const;

// Vana Epoch ABI (minimal)
export const VANA_EPOCH_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "epochId",
        "type": "uint256"
      }
    ],
    "name": "epochs",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "startBlock",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "endBlock",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "rewardAmount",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isFinalized",
            "type": "bool"
          }
        ],
        "internalType": "struct VanaEpochStorageV1.EpochInfo",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
