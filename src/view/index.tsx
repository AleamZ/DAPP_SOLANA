import React, { useCallback,useEffect, useState } from 'react';
import { message,Button, Layout, Row, Col, Space, Typography, Image, Input } from 'antd';
import { PublicKey, Transaction, Keypair } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createTransferInstruction, getOrCreateAssociatedTokenAccount,getAssociatedTokenAddress,getAccount} from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import logo from 'static/images/solanaLogo.svg';
import brand from 'static/images/solanaLogoMark.svg';
import './index.less';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface IProps {
  fromKeypair: Keypair;
  mintAddress: string;
}

const View: React.FC<IProps> = ({ fromKeypair, mintAddress }) => {
  const [ldtBalance, setLdtBalance] = useState(0);
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState<boolean>(false);
  const [tokenAmount, setTokenAmount] = useState<string>('');
  const [LDTs, setLDTs] = useState<number>(1000); // Giả sử số LDT tối đa có thể claim là 1000

  const claimSPLToken = async () => {
    const amount = Number(tokenAmount);

    if (!publicKey || !fromKeypair || tokenAmount === '' || isNaN(amount)) {
      console.error("Invalid input or wallet not connected");
      return;
    }
    if (amount > LDTs) {
      message.error("Not enough LDTs to claim.");
      return;
    }

    try {
      setLoading(true);
      const mintPublicKey = new PublicKey(mintAddress);
      const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromKeypair,
        mintPublicKey,
        fromKeypair.publicKey
      );
      const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromKeypair,
        mintPublicKey,
        publicKey
      );

      const transaction = new Transaction().add(
        createTransferInstruction(
          fromTokenAccount.address,
          toTokenAccount.address,
          fromKeypair.publicKey,
          amount * 10 ** 9, // Assuming the token has 9 decimals
          [],
          TOKEN_PROGRAM_ID
        )
      );
      
      const signature = await connection.sendTransaction(transaction, [fromKeypair]);
      setLDTs(prev => prev - amount);
      console.log("Transaction successful, signature", signature);
      getLdtBalance(); 

    } catch (error) {
      console.error("Error during the token claim process:", error);
    } finally {
      setLoading(false);
    }
  };

//----------------------------------------------------------//
const getLdtBalance = useCallback(async () => {
  if (!publicKey) {
    return; 
  }

  try {
    const ldtTokenAddress = await getAssociatedTokenAddress(
      new PublicKey("LDTgMw9UWyV1AZdWouVfMLXTqrPnSwuzZfRre7Yvpp4"), // Assuming correct LDT mint address
      publicKey
    );

    const ldtAccountInfo = await getAccount(connection, ldtTokenAddress);
    setLdtBalance(Number(ldtAccountInfo.amount) / Math.pow(10, 9));
    getLdtBalance(); 

  } catch (error) {
    console.error("Error fetching LDT balance:", error);
  }
}, [publicKey, connection]);

useEffect(() => {
  getLdtBalance(); 
}, [getLdtBalance]);

//----------------------------------------------//
//Hàm Buy
// Sử dụng sendTransaction từ useWallet để cho phép người dùng ký giao dịch
const { sendTransaction } = useWallet();

const buyItem = async (price: number) => {
  if (!publicKey) {
    message.error("Wallet not connected");
    return;
  }

  if (ldtBalance < price) {
    message.error("Insufficient token balance");
    return;
  }

  setLoading(true);

  try {
    const mintPublicKey = new PublicKey(mintAddress);
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromKeypair,
      mintPublicKey,
      publicKey
    );

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromKeypair,
      mintPublicKey,
      fromKeypair.publicKey
    );

    const transaction = new Transaction().add(
      createTransferInstruction(
        fromTokenAccount.address,
        toTokenAccount.address,
        publicKey,
        price * 10 ** 9, // Assuming the token has 9 decimals
        [],
        TOKEN_PROGRAM_ID
      )
    );

    // Lấy blockhash gần nhất để transaction có thể được xử lý
    const blockhash = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash.blockhash;

    // Ký và gửi giao dịch
    const signature = await sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, 'confirmed');
    console.log("Transaction successful, signature", signature);
    message.success("Purchase successful!");

    getLdtBalance(); // Refresh balance after transaction
  } catch (error) {
    console.error("Error during the token purchase process:", error);
    // message.error("Transaction failed: " + error.message);
  } finally {
    setLoading(false);
  }
};


//----------------------------------------------//
// You might want to call getLdtBalance again if LDTs changes, depending on your application's needs



//----------------------------------------------//
  return (
    <Layout className="container">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Row gutter={[24, 24]}>
            <Col flex="auto">
              <img alt="logo" src={brand} height={16} />
            </Col>
            <WalletMultiButton />
          </Row>
        </Col>
        <Col span={24} style={{ textAlign: 'center' }}>
          <Space direction="vertical" size={24}>
            <Image src={logo} preview={false} width={256} />
            <Typography.Title level={1}>React + Solana = DApp</Typography.Title>
            
            <Input
              type="number"
              min="0"
              placeholder="Enter token amount"
              onChange={e => setTokenAmount(e.target.value)}
              value={tokenAmount}
            />
            <Button type="primary" size="large" onClick={claimSPLToken} loading={loading}>
              Claim Token
            </Button>
            <Typography.Title>
            My LDT Balance: {ldtBalance} LDT Token
            </Typography.Title>
            <Typography.Title>
            My LDTs: {LDTs} 
            </Typography.Title>
            <Row>
            <Button type="primary" size="large" onClick={() => buyItem(10)} loading={loading}>
              Buy 10 LDT
            </Button>
            <Button type="primary" size="large" onClick={() => buyItem(50)} loading={loading}>
              Buy 50 LDT
            </Button>
            <Button type="primary" size="large" onClick={() => buyItem(100)} loading={loading}>
              Buy 100 LDT
            </Button>
            </Row>
            
          </Space>
        </Col>
      </Row>
    </Layout>
  );
};

export default View;