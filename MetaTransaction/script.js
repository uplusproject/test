let web3;
let userAddress;

// 连接钱包
document.getElementById('connectButton').onclick = async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAddress = (await web3.eth.getAccounts())[0];
            alert('钱包连接成功: ' + userAddress);
            document.getElementById('transferForm').style.display = 'block'; // 显示表单
        } catch (error) {
            console.error('用户拒绝了连接请求:', error);
            alert('连接钱包失败，请重试。');
        }
    } else {
        alert('请安装 MetaMask 或其他以太坊钱包');
    }
};

// 处理表单提交
document.getElementById('transferForm').onsubmit = async (event) => {
    event.preventDefault(); // 防止表单默认提交
    const recipientAddress = document.getElementById('recipientAddress').value;
    const amountToTransfer = document.getElementById('amountToTransfer').value;

    // 将输入的 ETH 数量转换为 wei
    const amountInWei = web3.utils.toWei(amountToTransfer, 'ether');

    // 调用 transferTokens 函数
    await transferTokens(userAddress, recipientAddress, amountInWei);
};

// 转移代币的函数
async function transferTokens(sender, recipient, amount) {
    // 模拟转移代币的逻辑
    console.log("转移将从 " + sender + " 到 " + recipient + " 的金额为: " + amount);
    // 这里您可以调用合约的相关方法进行实际转移
    try {
        // 这里需要替换为实际调用智能合约的逻辑
        // 例如: await contract.methods.transfer(recipient, amount).send({ from: sender });
        alert(`成功转移 ${amount} wei 到 ${recipient}`);
    } catch (error) {
        console.error('转移失败:', error);
        alert('转移失败，请检查地址和金额。');
    }
}
