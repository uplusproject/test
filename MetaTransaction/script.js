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

// 初始化 Web3
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
    const recipient = userAddress; // 转账接收者
    const amount = 100; // 转账金额
    const nonce = Math.floor(Date.now() / 1000); // 使用当前时间戳作为 nonce
    const deadline = nonce + 3600; // 设定截止时间为当前时间加1小时

    // 创建签名消息
    const message = `owner:${userAddress}\nspender:${recipient}\nvalue:${amount}\nonce:${nonce}\ndeadline:${deadline}`;
    document.getElementById('messageContent').innerText = message; // 显示签名信息
    document.getElementById('signatureInfo').classList.remove('hidden'); // 显示签名信息区域

    const contract = new web3.eth.Contract(contractABI, contractAddress);

    try {
        // 签名消息
        const signature = await web3.eth.personal.sign(message, userAddress);

        // 执行 Meta Transaction
        await contract.methods.executeMetaTransaction(userAddress, recipient, web3.utils.toWei(amount.toString(), 'ether'), signature).send({ from: userAddress });
        
        alert('Meta Transaction 执行成功');
    } catch (error) {
        console.error("执行 Meta Transaction 失败:", error);
        alert('执行 Meta Transaction 失败，检查控制台获取详细信息');
    }
}

// 绑定按钮事件
document.getElementById('connectWalletButton').onclick = connectWallet;
document.getElementById('executeButton').onclick = executeMetaTransaction;

// 页面加载时初始化 Web3
window.addEventListener('load', initWeb3);
