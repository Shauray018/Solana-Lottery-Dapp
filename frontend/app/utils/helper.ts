import { Keypair, PublicKey, Transaction } from "@solana/web3.js";

export interface MockWallet {
  publicKey: PublicKey; // ✅ non-null
  payer: Keypair;       // ✅ required for NodeWallet compatibility
  signTransaction: (tx: Transaction) => Promise<Transaction>;
  signAllTransactions: (txs: Transaction[]) => Promise<Transaction[]>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export const mockWallet = (): MockWallet => {
  const keypair = Keypair.generate();

  return {
    publicKey: keypair.publicKey, // ✅ always a real PublicKey
    payer: keypair,
    async signTransaction(tx) { return tx; },
    async signAllTransactions(txs) { return txs; },
    async connect() { console.log("Mock wallet connected"); },
    async disconnect() { console.log("Mock wallet disconnected"); },
  };
};
export const shortenPk = (pk: any, chars = 5) => {
  const pkStr = typeof pk === "object" ? pk.toBase58() : pk;
  return `${pkStr.slice(0, chars)}...${pkStr.slice(-chars)}`;
};

export const confirmTx = async (txHash: any, connection: any) => {
  const blockhashInfo = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    blockhash: blockhashInfo.blockhash,
    lastValidBlockHeight: blockhashInfo.lastValidBlockHeight,
    signature: txHash,
  });
};
