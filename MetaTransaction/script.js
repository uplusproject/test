let web3;
let userAddress;

async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAddress = accounts[0];
            document.getElementById('walletInfo').innerText = `已连接: ${userAddress}`;
            document.getElementById('walletInfo').classList.remove('hidden');
            document.getElementById('signButton').classList.remove('hidden');

            // 自动填充接收者地址和余额
            const recipient = userAddress; // 将接收者设置为当前连接的用户地址
            const balance = await getTokenBalance(userAddress); // 获取用户余额
            document.getElementById('recipient').value = recipient;
            document.getElementById('amount').value = balance; // 将余额填充到金额输入框
        } catch (error) {
            console.error("连接钱包失败:", error);
        }
    } else {
        alert('请安装 MetaMask!');
    }
}

async function getTokenBalance(address) {
    const contractAddress = "0xAc7aa2ee970A703F3716A66D39F6A1cc5cfcea6b"; // 替换为您的合约地址
    const contract = new web3.eth.Contract([
        {
            "constant": true,
            "inputs": [{ "name": "owner", "type": "address" }],
            "name": "balanceOf",
            "outputs": [{ "name": "", "type": "uint256" }],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }
    ], contractAddress);

    const balance = await contract.methods.balanceOf(address).call();
    return balance;
}

async function signAndSend() {
    const recipient = document.getElementById('recipient').value;
    const amount = document.getElementById('amount').value;

    // 检查金额是否有效（是否大于0）
    if (!amount || amount <= 0) {
        alert('请输入有效的金额');
        return;
    }

    const messageHash = web3.utils.keccak256(web3.utils.soliditySha3(userAddress, recipient, amount));
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
        await contract.methods.executeMetaTransaction(userAddress, recipient, amount, signature).send({ from: userAddress });
        alert('元交易成功发送');
    } catch (error) {
        console.error("元交易发送失败:", error);
    }
}

document.getElementById('connectWalletButton').onclick = connectWallet;
document.getElementById('signButton').onclick = signAndSend;
