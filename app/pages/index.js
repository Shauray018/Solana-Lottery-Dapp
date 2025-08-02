import Header from "../components/Header";
import PotCard from "../components/PotCard";
import Table from "../components/Table";
import style from "../styles/Home.module.css";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
require("@solana/wallet-adapter-react-ui")



export default function Home() {
  const endpoint = "https://icy-fittest-needle.solana-devnet.quiknode.pro/ea71096271bf459c74df051aaf764930e6db731c";

  const wallets = useMemo( 
    () => [
      new PhantomWalletAdapter(),
    ], 
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}> 
        <WalletProvider wallets={wallets} autoConnect> 
          <WalletModalProvider>
            <div className={style.wrapper}>
              <Header />
              <PotCard />
              <Table />
            </div>
          </WalletModalProvider>
        </WalletProvider> 
      </ConnectionProvider>
  );
}
