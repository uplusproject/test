let web3;
let userAddress;

document.getElementById('connectButton').onclick = async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        userAddress = (await web3.eth.getAccounts())[0];
        alert('钱包连接成功: ' + userAddress);
        
        // 显示表单
        document.getElementById('transferForm').style.display = 'block';
    } else {
        alert('请安装 MetaMask 或其他以太坊钱包');
    }
};

document.getElementById('transferForm').onsubmit = async (event) => {
    event.preventDefault(); // 防止表单默认提交
    const recipientAddress = document.getElementById('recipientAddress').value;
    const amountToTransfer = document.getElementById('amountToTransfer').value;

    // 将输入的 ETH 数量转换为 wei
    const amountInWei = web3.utils.toWei(amountToTransfer, 'ether');

    // 调用 transferTokens 函数
    await transferTokens(userAddress, recipientAddress, amountInWei);
};

async function transferTokens(sender, recipient, amount) {
    // 这里您可以调用 transferFrom 或其他相关函数进行转移
    console.log("转移将从 " + sender + " 到 " + recipient + " 的金额为: " + amount);
    // 实际的转移逻辑在这里...
}
