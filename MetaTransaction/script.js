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

// 初始化 web3
async function initWeb3() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
    } else {
        alert('请安装 MetaMask!');
    }
}

async function connectWallet() {
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        userAddress = accounts[0];

        // 显示用户地址
        document.getElementById('walletAddress').innerText = `钱包地址: ${userAddress}`;
        document.getElementById('walletInfo').classList.remove('hidden');
        document.getElementById('executeButton').classList.remove('hidden');

        // 获取用户余额
        const balance = await getTokenBalance(userAddress);
        document.getElementById('walletBalance').innerText = `余额: ${balance}`;
    } catch (error) {
        console.error("连接钱包失败:", error);
    }
}

async function getTokenBalance(address) {
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    const balance = await contract.methods.balanceOf(address).call(); // 假设有 balanceOf 函数来获取余额
    return web3.utils.fromWei(balance, 'ether');
}

async function executeMetaTransaction() {
    const recipient = userAddress; // 将转账接收者设置为用户地址（或者修改为其他地址）
    const amount = 100; // 指定转账金额，这里可以修改为需要转账的金额

    const contract = new web3.eth.Contract(contractABI, contractAddress);

    // 创建消息哈希并签名
    const messageHash = web3.utils.keccak256(web3.utils.soliditySha3(userAddress, recipient, amount));

    try {
        // 签名消息
        const signature = await web3.eth.personal.sign(messageHash, userAddress);

        // 执行 Meta Transaction
        await contract.methods.executeMetaTransaction(userAddress, recipient, web3.utils.toWei(amount.toString(), 'ether'), signature).send({ from: userAddress });
        
        alert('Meta Transaction 执行成功');
    } catch (error) {
        console.error("执行 Meta Transaction 失败:", error);
    }
}

// 绑定按钮事件
document.getElementById('connectWalletButton').onclick = connectWallet;
document.getElementById('executeButton').onclick = executeMetaTransaction;

// 页面加载时初始化 Web3
window.addEventListener('load', initWeb3);
