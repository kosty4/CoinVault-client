
import detectEthereumProvider from '@metamask/detect-provider'
import { ethers, Contract } from 'ethers';
import CoinVaultABI from '../contracts/CoinVault.json';
import IERC20ABI from '../contracts/IERC20.json';

//deployed contracts on different networks
export const available_networks = {

  97 : {
    'address': '0x603f77EE12428f7680B8971Cb37B6C35C2E58549',
    'token' : 'BNB'
  },

  // 56 : {
  //   'address': '0xedf5ECa4e55624D86908aef1dEb46b011912EF1F',
  //   'token' : 'BNB'
  // },

  // 137: {'address': '0x743D83DDa5984B86f68D2D7aeB2F5961fC82B0Ac', 'token' : 'MATIC'}
}

export const ERC20_contract_addresses = {
  97 : {
    'BTCB' : '0x6ce8dA28E2f864420840cF74474eFf5fD80E65B8',
    'USDC' : '0x64544969ed7EBf5f083679233325356EbE738930',
    'BUSD' : '0x40A178d7289eDc9179cDCbda232B51a244B7a8D3'
  }
}


export async function getWallet() {
  let provider = await detectEthereumProvider()
  if (provider) {
    const networkId = await provider.request({ method: 'net_version' })
    
    provider = new ethers.providers.Web3Provider(provider)
    //get current metamask wallet address
    let addresses = await provider.send('eth_requestAccounts', [])

    console.log('active address ', addresses)

    let currentAddress = addresses[0];

    let contractNativeToken = available_networks[networkId]['token'];

    return [currentAddress, provider, contractNativeToken]
  }
  return 'Install metamask!'
}

export async function getContract() {
  //get the Web3 provider from the frontend (prev window.ethereum)
  let provider = await detectEthereumProvider()
  if (provider) {
    
    
    //get network id to fit the right contract address
    const networkId = await provider.request({ method: 'net_version' })

    //connect wallet to web3 provider
    provider = new ethers.providers.Web3Provider(provider)
    const signer = provider.getSigner()

    //register the smart contract
    let contractAddress = available_networks[networkId]['address'];

    const vaultContract = new Contract(contractAddress, CoinVaultABI, signer)
    
    return vaultContract
  }
  return "Problem registering contract";
}

export async function getTokenInterface(tokenTicker) {
  //get the Web3 provider from the frontend (prev window.ethereum)
  let provider = await detectEthereumProvider()
  if (provider) {
    
    //get network id to fit the right contract address
    const networkId = await provider.request({ method: 'net_version' })

    //connect wallet to web3 provider
    provider = new ethers.providers.Web3Provider(provider)
    // const signer = provider.getSigner()
    
    //register the smart contract
    let ERC20_contract_address = ERC20_contract_addresses[networkId][tokenTicker];

    const tokenContract = new Contract(ERC20_contract_address, IERC20ABI, provider)
    
    return tokenContract
  }
  return "Problem registering token contract";
}
