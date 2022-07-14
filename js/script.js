import { ethers } from "./ethers.min.js"
import { ABI, CONTRACT_ADDRESS } from "./constants.js"

const $connectButton = document.querySelector("#connect-button")
const $fundButton = document.querySelector("#fund-button")
const $balanceButton = document.querySelector("#balance-button")
const $ethBalance = document.querySelector("#eth-balance")
const $withdrawButton = document.querySelector("#withdraw-button")

$connectButton.addEventListener("click", async () => {
    await connect()
})

$fundButton.addEventListener("click", async () => {
    const $ethAmount = document.querySelector("#eth-amount").value
    console.log($ethAmount)
    if (!$ethAmount || $ethAmount < 0.1) {
        console.log("Please add more than 0.1 ETH (+10USD)")
        return
    }
    fund($ethAmount)
})

$withdrawButton.addEventListener("click", () => {
    withdraw()
})

$balanceButton.addEventListener("click", () => {
    getBalance()
})

const connect = async () => {
    if (typeof window.ethereum !== "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
            console.log("Connected to Metamask")
            //Change UI Button
            $connectButton.textContent = "Connected"
            $connectButton.classList.add("btn-secondary")
        } catch (error) {
            console.error(error.message)
        }
    } else {
        //Change UI Button
        $connectButton.textContent = "Please Install Metamask"
    }
}

const fund = async (ethAmount = "0.1") => {
    console.log(`Funding with: ${ethAmount} ETH`)
    if (typeof window.ethereum !== "undefined") {
        //provider - connection to the blockchain
        //signer - wallet
        //contrat that we are interacting with
        //ABI & Address

        const ETH_TO_SEND = ethers.utils.parseEther(ethAmount)

        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)

        try {
            const transactionReponse = await contract.fund({
                value: ETH_TO_SEND,
            })

            await listenForTransactionMine(transactionReponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error.message)
        }
    }
}

const listenForTransactionMine = (transactionResponse, provider) => {
    console.log(`Mining ${transactionResponse.hash}...`)
    //listen for this transaction to finish

    return new Promise((resolve, rejected) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

const getBalance = async () => {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balanceRaw = await provider.getBalance(CONTRACT_ADDRESS)
        $ethBalance.value = ethers.utils.formatEther(balanceRaw)
    }
}

const withdraw = async () => {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)

        try {
            const transactionReponse = await contract.withdraw()
            await listenForTransactionMine(transactionReponse, provider)
            console.log("Done! Withdraw succesfully")
        } catch (error) {
            console.log(error.message)
        }
    }
}
