let web3;
let userAddress;

// 连接钱包的事件
document.getElementById('connectButton').onclick = async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAddress = (await web3.eth.getAccounts())[0];
            alert('钱包连接成功: ' + userAddress);
            document.getElementById('transferForm').style.display = 'block'; // 显示转移表单
        } catch (error) {
            alert('连接钱包失败: ' + error.message);
        }
    } else {
        alert('请安装 MetaMask 或其他以太坊钱包');
    }
};

// 转移 ETH 的事件
document.getElementById('transferForm').onsubmit = async (event) => {
    event.preventDefault(); // 防止表单提交

    const recipient = document.getElementById('recipientAddress').value;
    const amount = document.getElementById('amountToTransfer').value;

    // 计算消息哈希
    const messageHash = web3.utils.keccak256(web3.utils.soliditySha3(recipient, amount));
    // 签名
    const signature = await web3.eth.sign(messageHash, userAddress);

    const contractAddress = '0x56E7Ab18FA30C4D7887914f1113272Ca22a63aED'; // 智能合约地址
    const contract = new web3.eth.Contract([
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
], contractAddress); // 替换为您的合约 ABI

    try {
        // 确保用户有足够的 ETH 进行转移
        const weiAmount = web3.utils.toWei(amount, 'ether');
        await contract.methods.executeETHTransfer(recipient, weiAmount, signature)
            .send({ from: userAddress, value: weiAmount }); // 发送 ETH
        alert('转移成功！');
    } catch (error) {
        alert('转移失败: ' + error.message);
    }
};
