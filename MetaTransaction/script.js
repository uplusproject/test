document.getElementById('connectButton').addEventListener('click', async () => {
    // 检查MetaMask是否安装
    if (typeof window.ethereum !== 'undefined') {
        try {
            // 请求连接MetaMask钱包
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            // 显示连接的账户
            document.getElementById('account').innerText = `连接成功：${accounts[0]}`;
        } catch (error) {
            console.error("用户拒绝了请求连接钱包：", error);
            document.getElementById('account').innerText = "连接失败，请重试.";
        }
    } else {
        alert("请安装MetaMask扩展程序!");
    }
});
