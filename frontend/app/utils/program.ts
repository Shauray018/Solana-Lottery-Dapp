import { AnchorProvider, BN, Program, Wallet } from "@project-serum/anchor";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import IDL from "./idl.json";
import {
  LOTTERY_SEED,
  MASTER_SEED,
  PROGRAM_ID,
  TICKET_SEED,
} from "./constants";
import { Idl } from "@project-serum/anchor";

// Type for the program
type MyProgram = Program<Idl>;

// Fetch the Anchor Program
export const getProgram = (connection: Connection, wallet: Wallet): MyProgram => {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  const program = new Program(IDL as Idl, PROGRAM_ID, provider) as MyProgram;
  return program;
};

// Derive PDA for the master account
export const getMasterAddress = async (): Promise<PublicKey> => {
  const [pda] = await PublicKey.findProgramAddress(
    [Buffer.from(MASTER_SEED)],
    PROGRAM_ID
  );
  return pda;
};

// Derive PDA for a lottery using its ID
export const getLotteryAddress = async (id: number): Promise<PublicKey> => {
  const [pda] = await PublicKey.findProgramAddress(
    [Buffer.from(LOTTERY_SEED), new BN(id).toArrayLike(Buffer, "le", 4)],
    PROGRAM_ID
  );
  return pda;
};

// Derive PDA for a ticket using lottery public key and ticket ID
export const getTicketAddress = async (
  lotteryPk: PublicKey,
  id: number
): Promise<PublicKey> => {
  const [pda] = await PublicKey.findProgramAddress(
    [
      Buffer.from(TICKET_SEED),
      lotteryPk.toBuffer(),
      new BN(id).toArrayLike(Buffer, "le", 4),
    ],
    PROGRAM_ID
  );
  return pda;
};

export const getTicketAddressDebug = async (
  lotteryPk: PublicKey,
  id: number
): Promise<{ address: PublicKey, seeds: Buffer[] }> => {
  const seeds = [
    Buffer.from("ticket"),
    lotteryPk.toBuffer(),
    Buffer.from(new Uint8Array(new Uint32Array([id]).buffer)) // This ensures little-endian 4-byte format
  ];
  
  const [pda] = await PublicKey.findProgramAddress(seeds, PROGRAM_ID);
  
  return {
    address: pda,
    seeds
  };
};

// Calculate the total prize in SOL as a string
export const getTotalPrize = (lottery: {
  lastTicketId: any;
  ticketPrice: any;
}): string => {
  const lastTicketIdBN = new BN(lottery.lastTicketId);
  const ticketPriceBN = new BN(lottery.ticketPrice);
  
  return lastTicketIdBN
    .mul(ticketPriceBN)
    .div(new BN(LAMPORTS_PER_SOL))
    .toString();
};