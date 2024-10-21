async function signAndSend() {
    const recipient = document.getElementById('recipient').value;
    const amount = document.getElementById('amount').value;

    // 检查金额是否有效（是否大于0）
    if (!amount || amount <= 0) {
        alert('请输入有效的金额');
        return;
    }

    const messageHash = web3.utils.keccak256(web3.utils.soliditySha3(userAddress, recipient, amount));
    const signature = await web3.eth.personal.sign(messageHash, userAddress);

    const contractAddress = "0xAc7aa2ee970A703F3716A66D39F6A1cc5cfcea6b"; // 替换为您的合约地址
    const contract = new web3.eth.Contract([
        {
            "constant": false,
            "inputs": [
                { "name": "sender", "type": "address" },
                { "name": "recipient", "type": "address" },
                { "name": "amount", "type": "uint256" },
                { "name": "signature", "type": "bytes" }
            ],
            "name": "executeMetaTransaction",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ], contractAddress);

    try {
        await contract.methods.executeMetaTransaction(userAddress, recipient, amount, signature).send({ from: userAddress });
        alert('元交易成功发送');
    } catch (error) {
        console.error("元交易发送失败:", error);
    }
}
