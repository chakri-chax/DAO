import Web3 from "web3";
import {setGlobalState,getGlobalState} from './store'
import abi from './abis/DAO.json'


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
        const contract = new web3.eth.Contract(abi.abi,"0x5FbDB2315678afecb367f032d93F642f64180aa3")
        return contract
        }
    else{
        return getGlobalState('contract')
    }

}
const performContribute = async(amount)=>{
    try {
        amount = window.web3.utils.toWei(amount.toString(),'ether')
        const contract =await getEthereumContract()
        const account = getGlobalState('connectedAccount')

        await contract.methods.contribute().send({from:account,value:amount})
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
const getProposals = async()=>{
    try {
        if(!ethereum) return alert("Please install Metamask")
        const contract = await getEthereumContract()
        const proposals = await contract.methods.getProposals().call
        setGlobalState('proposals',structuredProposals(proposals))

    } catch (error) {
        reportError(error)
    }
}
const structuredProposals = (proposals)=>{
    return proposals.map((proposal)=>({
        id : proposal.id,
        amount : window.web3.utils.fromWei(proposal.amount),
        title : proposal.title,
        description : proposal.description,
        paid:proposal.paid,
        passed : proposal.passed,
        proposer : proposal.proposer,
        upvotes : Number(proposal.upvotes),
        downvotes:Number(proposal.downvotes),
        beneficiary : proposal.beneficiary,
        excecutor : proposal.excecutor,
        duration : proposal.duration

    }))
    
}
const getProposal= async(id)=>{
    try {
        const proposals = getGlobalState('proposals')
        return proposals.find((proposal)=>proposal.id==id)
    } catch (error) {
        reportError(error)
    }

}
const voteOnProposal = async(proposalId,supported)=>{
    try {
        const contract = await getEthereumContract()
        const account = getGlobalState("connectedAccount")
        await contract.methods.Vote(proposalId,supported).send({from:account})

        window.location.reload()

    } catch (error) {
        reportError(error)
    }
}

const listVoters=async(id)=>{
    try {
        const contract = await getEthereumContract()
        const votes = await contract.methods.getVotesOf(id).call()
        return votes;
        
    } catch (error) {
        reportError(error)
    }

}
const payoutBeneficiary = async(id)=>{
    try {
        const contract = await getEthereumContract()
        const account = getGlobalState("connectedAccount")
        await contract.methods.payBeneficiary(id).send({from:account})
        window.location.reload()
    } catch (error) {
        reportError(error)
    }
}
const reportError = (error)=>{
    console.log(JSON.stringify(error),red);
    throw new Error('No ethereum Object,something is Wrong')
}

export {
    connectWallet,
    isWalletConnected,
    performContribute,
    raiseProposal,
    getInfo,
    getProposal,
    getProposals,
    voteOnProposal,
    listVoters,
    payoutBeneficiary
}


