//deployed contracts on different networks
export const available_networks = {
  137: {
    address: '0x86488eAe1D24d47f71fe8112690Cd023cAB5Fd35',
    token: 'MATIC',
  },

  // 97: {
  //   address: '0x603f77EE12428f7680B8971Cb37B6C35C2E58549',
  //   token: 'BNB',
  // },

  // 56 : {
  //   'address': '0xedf5ECa4e55624D86908aef1dEb46b011912EF1F',
  //   'token' : 'BNB'
  // },

  // 137: {'address': '0x743D83DDa5984B86f68D2D7aeB2F5961fC82B0Ac', 'token' : 'MATIC'}
}

export const ERC20_contract_addresses = {
  // 97: {
  //   1: {
  //     ticker: 'USDC',
  //     address: '0x64544969ed7EBf5f083679233325356EbE738930',
  //   },
  //   2: {
  //     ticker: 'WBTC',
  //     address: '0x6ce8dA28E2f864420840cF74474eFf5fD80E65B8',
  //   },
  //   4: {
  //     ticker: 'BUSD',
  //     address: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
  //   },
  // },
  137: {
    1: {
      ticker: 'WETH',
      address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      decimals: 18,
    },
    2: {
      ticker: 'USDT',
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      decimals: 6,
    },
    3: {
      ticker: 'USDC',
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      decimals: 6,
    },
    4: {
      ticker: 'WBTC',
      address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
      decimals: 8,
    },
  },
}
