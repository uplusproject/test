let account;
let contract;

const contractABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "sender", "type": "address"},
      {"internalType": "address", "name": "recipient", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "transferFrom",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const contractAddress = "0xa1f16EF58A572fB99e41bb2C21C26AdDd6828697";

async function connectWallet() {
  try {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    account = accounts[0];
    document.getElementById("connectWalletButton").innerText = "连接成功";
    document.getElementById("transferTokensButton").disabled = false;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractABI, signer);
  } catch (error) {
    console.error("连接钱包失败: ", error);
  }
}

async function transferTokens() {
  try {
    const recipient = prompt('请输入接收者地址：');
    const amount = prompt('请输入转账金额：');
    const tx = await contract.transferFrom(account, recipient, ethers.utils.parseUnits(amount, 18));
    await tx.wait();
    alert("转账成功");
  } catch (error) {
    console.error("转账失败: ", error);
  }
}

document.getElementById("connectWalletButton").addEventListener("click", connectWallet);
document.getElementById("transferTokensButton").addEventListener("click", transferTokens);
