import Web3 from "web3";
import {setGlobalState,getGlobalState} from './store'
import abi from './abis/DAO.json'
import { setgid } from "process";

const {ethereum}= window;
window.web3 = new Web3(ethereum)
window.web3 = new Web3(window.web3.currentProvider)


const connectWallet = async()=>{
    try {
        if(!ethereum) return ("Please Install Metamask ")

        const accounts = await ethereum.request({method:"eth_requestAccounts"})
        setGlobalState("connectedAccount",accounts[0].toLowerCase())    
    } catch (error) {
        reportError(error)
        
    }

}
const isWalletConnected = async()=>{
    try {
        if(!ethereum) return alert("Please Install Metamask")
        const accounts = await ethereum.request({method:"eth_accounts"})

        window.ethereum.on('chainId',(chainId)=>{
            window.location.reload()
        })

        window.ethereum.on('accountsChanged',async()=>{
            setGlobalState("connectedAccount",accounts[0].toLowerCase())
            await isWalletConnected()
        })
        if (accounts.length){
            setGlobalState("connectedAccount",accounts[0].toLowerCase())
        }
        else{
            alert("Please connect Wallet")
            console.log("No Accounts Found");
        }
        
    } catch (error) {
        reportError(error)
        
    }

}
const getEthereumContract = async() =>{
    const connectedAccount = getGlobalState('connectedAccount')
    if(connectedAccount){
        const web3 = window.web3
        const networkId = await web3.eth.net.getId()
        const networkData = await abi.networks[networkId]

        if(networkData){
            const contract = new web3.eth.Contract(abi.abi,networkData.address)
            return contract
        }
        else{
            return null
        }
    }else{
        return getGlobalState('contract')
    }

}
const performContribute = async(amount)=>{
    try {
        amount = window.web3.utils.toWei(amount.toString(),'ether')
        const contract =await getEthereumContract()
        const account = getGlobalState('connectedAccount')

        await contract.methods.contribute().sender({from:account,value:amount})
        window.location.reload()

        
    } catch (error) {
        reportError(error)
    }
    

}
const raiseProposal = async({title,description,beneficiary,amount})=>{
    try {
        amount = window.web3.utils.toWei(amount.toString(),'ether')
        const contract = await getEthereumContract()
        const account = getGlobalState('connectedAccount')

        await contract.methods.createProposal({title,description,beneficiary,amount}).send({from:account})

    } catch (error) {
        reportError(error)
    }

}
const getInfo = async()=>{
    try {
        if(!ethereum) return alert ("Please Install Metamask")

        const contract = await getEthereumContract()
        const connectedAccount = getGlobalState('connectedAccount')
        const isStakeholder = await contract.methods.isStakeholder().call({from:connectedAccount})

        const balance  = await contract.methods.daoBalance().call()
        const myBalance = await contract.methods.getBalance().call({from:connectedAccount})

        setGlobalState('Balance',window.web3.utils.fromWei(balance))
        setGlobalState('myBalance',window.web3.utils.fromWei(myBalance))
        setGlobalState('isStakeholder',isStakeholder)

    } catch (error) {
        reportError(error)
    }

}



