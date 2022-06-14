import detectEthereumProvider from '@metamask/detect-provider'
import { ethers, Contract } from 'ethers'
import CoinVaultABI from '../contracts/CoinVault.json'
import IERC20ABI from '../contracts/IERC20.json'
import IERC20METADATAABI from '../contracts/IERC20Metadata.json'
import {available_networks, ERC20_contract_addresses} from '../static/networks';


export async function getWallet() {
  let provider = await detectEthereumProvider()
  if (provider) {
    const networkId = await provider.request({ method: 'net_version' })

    provider = new ethers.providers.Web3Provider(provider)
    //get current metamask wallet address
    let addresses = await provider.send('eth_requestAccounts', [])

    let currentAddress = addresses[0]

    let contractNativeToken = available_networks[networkId]['token']
    let contractSupportedTokens = ERC20_contract_addresses[networkId]

    return [currentAddress, provider, contractNativeToken, contractSupportedTokens]
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
    let contractAddress = available_networks[networkId]['address']

    const vaultContract = new Contract(contractAddress, CoinVaultABI, signer)

    return vaultContract
  }
  return 'Problem registering contract'
}

export async function getTokenInterface(tokenID) {
  //get the Web3 provider from the frontend (prev window.ethereum)
  let provider = await detectEthereumProvider()
  if (provider) {
    //get network id to fit the right contract address
    const networkId = await provider.request({ method: 'net_version' })

    //connect wallet to web3 provider
    provider = new ethers.providers.Web3Provider(provider)
    const signer = provider.getSigner()

    //register the smart contract
    let ERC20_contract_address = ERC20_contract_addresses[networkId][tokenID].address

    const tokenContract = new Contract(
      ERC20_contract_address,
      IERC20ABI,
      signer
    )

    return tokenContract
  }
  return 'Problem registering token contract'
}


export async function getTokenMetaInterface(tokenID) {
  //get the Web3 provider from the frontend (prev window.ethereum)
  let provider = await detectEthereumProvider()
  if (provider) {
    //get network id to fit the right contract address
    const networkId = await provider.request({ method: 'net_version' })

    //connect wallet to web3 provider
    provider = new ethers.providers.Web3Provider(provider)
    const signer = provider.getSigner()

    //register the smart contract
    let ERC20_contract_address = ERC20_contract_addresses[networkId][tokenID].address

    const contractMeta = new Contract(
      ERC20_contract_address,
      IERC20METADATAABI,
      signer
    )

    return contractMeta
  }
  return 'Problem registering token contract'
}