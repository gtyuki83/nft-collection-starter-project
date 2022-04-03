import myEpicNft from './utils/MyEpicNFT.json';
import { Contract, ethers } from "ethers";
import React, { useEffect, useState } from "react";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';

// Constantsを宣言する: constとは値書き換えを禁止した変数を宣言する方法です。
const TWITTER_HANDLE = '0x0Yuki';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const COLLECTION_LINK = 'https://rinkeby.rarible.com/collection/0xf9e69d26cc68b3eea15727f2cec3a432260ff293/items';
const TOTAL_MINT_COUNT = 10;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  console.log("currentAccount: ", currentAccount);
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      setupEventListener()
    } else {
      console.log("No authorized account found");
    }

    // アラーと
    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Connected to chain " + chainId);
    // 0x4 は　Rinkeby の ID です。
    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
    }
  }

  // めたますく
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      /*
      * ウォレットアドレスに対してアクセスをリクエストしています。
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected", accounts[0]);
      /*
      * ウォレットアドレスを currentAccount に紐付けます。
      */
      setCurrentAccount(accounts[0]);

      setupEventListener()
    } catch (error) {
      console.log(error)
    }
  }

  // イベントリスナー定義
  const setupEventListener = async () => {
    const CONTRACT_ADDRESS = "0x25c86e7007eB1e5001c89c54c4374d4C6C268e4f";
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        // NFT が発行されます。
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        // Event が　emit される際に、コントラクトから送信される情報を受け取っています。
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(
            `あなたのウォレットに NFT を送信しました。OpenSea に表示されるまで最大で10分かかることがあります。NFT へのリンクはこちらです: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }


  const askContractToMintNft = async () => {
    const CONTRACT_ADDRESS = "0x25c86e7007eB1e5001c89c54c4374d4C6C268e4f";
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();
        console.log("Mining...please wait.")

        await nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // renderNotConnectedContainer メソッドを定義します。
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  // // mint数定義
  // const mintNum = async () => {
  //   const [mintCount, setCount] = useState(0);
  //   const { ethereum } = window;
  //   const CONTRACT_ADDRESS = "0xd08C0A04c755e2Ab46DE19302b340F8b58C36e28";
  //   const provider = new ethers.providers.Web3Provider(ethereum);
  //   const signer = provider.getSigner();
  //   const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
  //   let val = await connectedContract.TotalMintCount();
  //   console.log(val)
  //   return (val);
  // };

  // ミント再チャレンジ
  const [mintCount, setCount] = useState(0);

  useEffect(() => {
    checkIfWalletIsConnected();

    // ここから追加
    const CONTRACT_ADDRESS = "0x25c86e7007eB1e5001c89c54c4374d4C6C268e4f";
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
    const handleEmitEvent = (_from, tokenId) => {
      const latestMintCount = tokenId.toNumber();
      // ✅ ここで state を更新させる(大事)
      setCount(latestMintCount);
    };
    // イベントリスナーの購読：
    // NewEpicNFTMinted が emit されたら、handleEmitEvent を呼ぶ宣言
    connectedContract.on("NewEpicNFTMinted", handleEmitEvent);
    return () => {
      connectedContract.off("NewEpicNFTMinted", handleEmitEvent);
    };

  }, [])
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            あなただけの特別な NFT を Mint しよう💫
            <p>
              コレクションの総数：{TOTAL_MINT_COUNT}
            </p>
            {/* <p>
              残り：{mintNum}
            </p> */}
            <p>
              現在のミント数：{mintCount} / {TOTAL_MINT_COUNT}
            </p>

          </p>
          {/*条件付きレンダリングを追加しました
          // すでに接続されている場合は、
          // Connect to Walletを表示しないようにします。*/}
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
              Mint NFT
            </button>
          )}
          <p></p>
          <button onClick={null} className="cta-button connect-wallet-button">
            <a
              className="footer-text"
              href={COLLECTION_LINK}
              target="_blank"
              rel="noreferrer"
            >raribleでコレクションを表示</a>
          </button>
        </div>

        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div >
  );
};

export default App;
