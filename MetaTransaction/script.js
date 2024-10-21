document.getElementById('connectButton').addEventListener('click', async () => {
    // 检查MetaMask是否安装
    if (typeof window.ethereum !== 'undefined') {
        try {
            // 请求连接MetaMask钱包
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            // 检查返回的账户
            if (accounts.length > 0) {
                document.getElementById('account').innerText = `连接成功：${accounts[0]}`;
            } else {
                throw new Error("没有返回账户，请检查 MetaMask 设置。");
            }
        } catch (error) {
            console.error("连接失败:", error);
            document.getElementById('account').innerText = `连接失败: ${error.message}`;
        }
    } else {
        alert("请安装MetaMask扩展程序!");
    }
});
