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

// Calculate the total prize in SOL as a string
export const getTotalPrize = (lottery: {
  lastTicketId: BN;
  ticketPrice: BN;
}): string => {
  return lottery.lastTicketId
    .mul(lottery.ticketPrice)
    .div(new BN(LAMPORTS_PER_SOL))
    .toString();
};
