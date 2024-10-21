let web3;
let userAddress;

// 合约地址
const contractAddress = '0x56E7Ab18FA30C4D7887914f1113272Ca22a63aED'; // 替换为您的合约地址

// 合约 ABI
const abi = [
    {
        "inputs": [
            { "internalType": "address", "name": "recipient", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "executeETHTransfer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "tokenAddress", "type": "address" },
            { "internalType": "address", "name": "recipient", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "executeTokenTransfer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

document.getElementById('connectButton').onclick = async () => {
    if (window.ethereum) {
        try {
            web3 = new Web3(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAddress = (await web3.eth.getAccounts())[0];
            alert('钱包连接成功: ' + userAddress);
            document.getElementById('transferForm').style.display = 'block'; // 显示转移表单
        } catch (error) {
            alert('连接失败，请检查您的钱包设置');
            console.error("连接失败", error);
        }
    } else {
        alert('请安装 MetaMask 或其他以太坊钱包');
    }
};

document.getElementById('ethTransferForm').onsubmit = async (event) => {
    event.preventDefault(); // 阻止表单默认提交

    const recipient = document.getElementById('recipientAddress').value;
    const amount = document.getElementById('amountToTransfer').value;
    const amountInWei = web3.utils.toWei(amount, 'ether');
    const messageHash = web3.utils.keccak256(web3.utils.soliditySha3(recipient, amountInWei));

    try {
        const signature = await web3.eth.sign(messageHash, userAddress);
        const contract = new web3.eth.Contract(abi, contractAddress);

        await contract.methods.executeETHTransfer(recipient, amountInWei, signature).send({ from: userAddress });
        alert('ETH 转移成功！');
    } catch (error) {
        alert('转移失败: ' + error.message);
        console.error("转移失败", error);
    }
};

document.getElementById('tokenTransferForm').onsubmit = async (event) => {
    event.preventDefault(); // 阻止表单默认提交

    const tokenAddress = document.getElementById('tokenAddress').value;
    const recipient = document.getElementById('tokenRecipient').value;
    const amount = document.getElementById('tokenAmount').value;

    const messageHash = web3.utils.keccak256(web3.utils.soliditySha3(tokenAddress, recipient, amount));

    try {
        const signature = await web3.eth.sign(messageHash, userAddress);
        const contract = new web3.eth.Contract(abi, contractAddress);

        await contract.methods.executeTokenTransfer(tokenAddress, recipient, amount, signature).send({ from: userAddress });
        alert('代币转移成功！');
    } catch (error) {
        alert('代币转移失败: ' + error.message);
        console.error("代币转移失败", error);
    }
};
