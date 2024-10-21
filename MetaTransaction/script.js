let web3;
let userAddress;

const contractAddress = "0xa1f16EF58A572fB99e41bb2C21C26AdDd6828697"; // 智能合约地址
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAddress = accounts[0];

            // 显示用户地址
            document.getElementById('walletAddress').innerText = `钱包地址: ${userAddress}`;
            document.getElementById('walletInfo').classList.remove('hidden');
            document.getElementById('transferButton').classList.remove('hidden');
            document.querySelector('.transfer-section').classList.remove('hidden');

            // 获取用户余额
            const balance = await getTokenBalance(userAddress);
            document.getElementById('walletBalance').innerText = `余额: ${balance}`;
        } catch (error) {
            console.error("连接钱包失败:", error);
        }
    } else {
        alert('请安装 MetaMask!');
    }
}

async function getTokenBalance(address) {
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    const balance = await contract.methods.balanceOf(address).call(); // 假设有 balanceOf 函数来获取余额
    return web3.utils.fromWei(balance, 'ether');
}

async function transfer() {
    const recipient = document.getElementById('recipient').value;
    const amount = document.getElementById('amount').value;

    if (!recipient || !amount || amount <= 0) {
        alert('请填写有效的接收者地址和金额');
        return;
    }

    const contract = new web3.eth.Contract(contractABI, contractAddress);

    try {
        // 调用 transferFrom 函数进行转账
        const tx = await contract.methods.transferFrom(userAddress, recipient, web3.utils.toWei(amount, 'ether')).send({ from: userAddress });
        alert('转账成功: ' + tx.transactionHash);
    } catch (error) {
        console.error("转账失败:", error);
    }
}

document.getElementById('connectWalletButton').onclick = connectWallet;
document.getElementById('transferButton').onclick = transfer;

// 初始化 web3
window.addEventListener('load', async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
    } else {
        alert('请安装 MetaMask!');
    }
});
