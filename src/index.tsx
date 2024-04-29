import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import View from 'view'
import configs from 'configs'

import reportWebVitals from 'reportWebVitals'

import 'static/styles/index.less'
import { Keypair,Connection } from '@solana/web3.js'
import {
  ConnectionProvider,
  WalletProvider
} from '@solana/wallet-adapter-react'
import {
  Coin98WalletAdapter,
  PhantomWalletAdapter
} from '@solana/wallet-adapter-wallets'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'

const {
  rpc: {endpoint},
}=configs
const secretKey = new Uint8Array([145,216,152,231,28,183,17,202,121,69,152,225,236,20,73,214,192,190,63,188,155,140,71,113,118,206,201,59,4,22,216,63,180,183,228,158,19,202,122,103,68,60,61,176,251,142,40,157,53,249,160,150,232,231,33,40,108,157,105,238,123,75,39,44]);
const fromKeypair = Keypair.fromSecretKey(secretKey);
const mintAddress = 'LDTgMw9UWyV1AZdWouVfMLXTqrPnSwuzZfRre7Yvpp4';




createRoot(document.getElementById('root') as HTMLElement).render(
  <BrowserRouter>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={[new PhantomWalletAdapter(), new Coin98WalletAdapter()]}
        autoConnect> 
        <WalletModalProvider>   
        <View fromKeypair={fromKeypair} mintAddress={mintAddress} />
        </WalletModalProvider>

      </WalletProvider>
    </ConnectionProvider>

  </BrowserRouter>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()