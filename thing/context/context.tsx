"use client"

import { createContext, useContext, useMemo, ReactNode, useEffect, useState } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { getLotteryAddress, getMasterAddress, getProgram, getTicketAddress, getTotalPrize } from "@/app/utils/program";
import { confirmTx, mockWallet } from "@/app/utils/helper";
import { LAMPORTS_PER_SOL, SystemProgram, PublicKey } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import {toast} from "react-toastify"; 

// Define proper types for your program accounts
//toast('Wow so easy !')
interface Master {
  lastId: number;
}

interface Lottery {
  lastTicketId: number;
  authority: any; 
  winnerId: any; 
  claimed: any; 
  ticketPrice: any; 

}

// Define the context type
interface AppContextType {
  connected: boolean;
  isMasterInitialized: boolean;
  initMaster: () => Promise<void>;
  createLottery: () => Promise<void>;
  lotteryId: number | null; 
  lotteryPot: number;
  buyTicket: () => Promise<void>; 
  pickWinner: () => Promise<void>; 
  isLotteryAuthority: boolean | null | undefined; 
  canClaim: any;
  isFinished: any; 
  lotteryHistory: any; 
  claimPrize: () => Promise<void>; 
}

// Create context with initial value
export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {

  const [masterAddress, setMasterAddress] = useState<PublicKey | null>(null); 
  const [initialized, setInitialized] = useState<boolean>(false); 
  const [lotteryId, setLotteryId] = useState<number | null>(null); 
  const [lotteryPot, setLotteryPot] = useState<number>(0); 
  const [lottery, setLottery] = useState<Lottery | null>(null); 
  const [lotteryAddress, setLotteryAddress] = useState<PublicKey>(null); 
  const [userWinningId, setUserWinningId] = useState<number>(0); 
  const [lotteryHistory, setLotteryHistory] = useState([]); 
  const [isUserWinner, setIsUserWinner] = useState<boolean>(false); 

  const { connection } = useConnection(); 
  const wallet = useAnchorWallet(); 
  const program = useMemo(() => {
    if (connection) { 
      return getProgram(connection, wallet ?? mockWallet()) as Program; 
    }
    return null;
  }, [connection, wallet]);

  useEffect(() => { 
    updateState();
  }, [program]);

  useEffect(() => { 
    if (!lottery) return;
    getPot();
    getHistory(); 
  }, [lottery]);

  const updateState = async (): Promise<void> => { 
    if (!program) return; 

    try { 
      let currentMasterAddress = masterAddress;
      
      if (!currentMasterAddress) {
        const ma = await getMasterAddress();
        currentMasterAddress = ma;
        setMasterAddress(ma); 
        console.log('Master address:', ma.toString()); 
      }

      const master = await program.account.master.fetch(currentMasterAddress) as Master;
      setInitialized(true);
      setLotteryId(master.lastId); 
      
      const currentLotteryAddress = await getLotteryAddress(master.lastId); 
      setLotteryAddress(currentLotteryAddress);
      
      const currentLottery = await program.account.lottery.fetch(currentLotteryAddress) as Lottery;
      setLottery(currentLottery);

      if (!wallet?.publicKey) return; 
      const userTickets = await program.account.ticket.all()
      const userWin = userTickets.some( 
        (t) => t.account.id === lottery?.winnerId
      ); 
      if (userWin) { 
        console.log("there is a used winning id: ", lottery?.winnerId)
        setUserWinningId(lottery?.winnerId)
        setIsUserWinner(true)
      } else { 
        console.log(userWin)
      }
      
    } catch(err) { 
      console.log("Error updating state:", err);
      setInitialized(false);
    }
  };

  const getPot = async (): Promise<void> => { 
    if (!lottery) { 
      return
    } else { 
      const looker = getTotalPrize(lottery); 
      const thing = Number(looker); 
      setLotteryPot(thing); 
      console.log("successfully got the lottery pot: ", looker)
    };
  };

  // Call solana program instructions 
  const initMaster = async (): Promise<void> => { 
    if (!program || !wallet?.publicKey) {
      throw new Error("Program or wallet not available");
    }

    try { 
      const currentMasterAddress = masterAddress || await getMasterAddress();
      
      const txHash = await program.methods
        .initMaster()
        .accounts({
          master: currentMasterAddress,
          payer: wallet.publicKey,
          systemProgram: SystemProgram.programId
        }) 
        .rpc();
        
      await confirmTx(txHash, connection);
      await updateState();
      
    } catch (err) { 
      console.error("Error initializing master:", err);
      throw err;
    }
  };

  const getHistory = async () => {
  console.log("here at getHistory function")
  if (!lotteryId) {
    console.log("dont have lottery id") 
    return
  }  

  const history = [] 

  for (const i in new Array(lotteryId).fill(null)) { 
    const id = lotteryId - parseInt(i)
    if (!id) break 

    try {
      const LotteryAddress = await getLotteryAddress(id)
      const lottery = await program?.account.lottery.fetch(LotteryAddress); 
      const winnerId = lottery?.winnerId; 
      if (!winnerId) continue; 

      const ticketAddress = await getTicketAddress(LotteryAddress, winnerId); // Fixed variable name
      
      // Add check if ticket exists before fetching
      try {
        const ticket = await program?.account.ticket.fetch(ticketAddress)
        
        history.push({ 
          lotteryId: id, 
          winnerId, 
          winnerAddress: ticket?.authority, 
          prize: getTotalPrize(lottery)
        })
      } catch (ticketError) {
        console.log(`Ticket not found for lottery ${id}, winnerId ${winnerId}:`, ticketError)
        // Continue to next iteration instead of breaking
        continue;
      }
      
    } catch (lotteryError) {
      console.log(`Error fetching lottery ${id}:`, lotteryError)
      continue;
    }
  }

  console.log("u and me got a whole lot of history", history)
  setLotteryHistory(history)
}

  const createLottery = async (): Promise<void> => { 
    if (!program || !wallet?.publicKey || !masterAddress || lotteryId === null) {
      throw new Error("Required data not available");
    }

    try { 
      console.log("Creating lottery...");
      
      const newLotteryId = lotteryId + 1;
      const newLotteryAddress = await getLotteryAddress(newLotteryId); 
      
      const txHash = await program.methods
        .createLottery(new BN(1).mul(new BN(LAMPORTS_PER_SOL)))
        .accounts({ 
          lottery: newLotteryAddress, 
          master: masterAddress, 
          authority: wallet.publicKey, 
          systemProgram: SystemProgram.programId,  
        })
        .rpc();
        
      await confirmTx(txHash, connection); 
      await updateState();

      console.log("Lottery created successfully!");
      toast("Lottery created successfully!")

    } catch(err) { 
      console.error("Error creating lottery:", err);
      throw err;
    }
  };

  const buyTicket = async (): Promise<void> => { 
    if (!program || !wallet?.publicKey || !lotteryAddress || !lottery || lotteryId === null) {
      throw new Error("Required data not available");
    }

    try { 
      console.log("Buying ticket...");
      
      // The ticket address derivation should match exactly what's in your Rust program
      // Your Rust program uses: lottery.last_ticket_id + 1 in the seeds
      const nextTicketId = lottery.lastTicketId + 1;
      const ticketAddress = await getTicketAddress(lotteryAddress, nextTicketId);
      
      console.log("Lottery ID:", lotteryId);
      console.log("Current Last Ticket ID:", lottery.lastTicketId);
      console.log("Next Ticket ID:", nextTicketId);
      console.log("Lottery Address:", lotteryAddress.toString());
      console.log("Expected Ticket Address:", ticketAddress.toString());
      
      const txHash = await program.methods
        .buyTicket(lotteryId)
        .accounts({ 
          lottery: lotteryAddress, 
          ticket: ticketAddress, 
          buyer: wallet.publicKey, 
          systemProgram: SystemProgram.programId  
        })
        .rpc(); 
        
      await confirmTx(txHash, connection); 
      console.log("Ticket purchased successfully!");
      
      await updateState();
      
    } catch(err) { 
      console.error("Error buying ticket:", err);
      console.error("Full error details:", JSON.stringify(err, null, 2));
      throw err;
    }
  };

  const pickWinner = async () => { 
  try { 
    if (!lotteryAddress) {
      console.error("No lottery address available");
      return;
    }
    
    if (!wallet?.publicKey) {
      console.error("Wallet not connected");
      return;
    }

    const txHash = await program?.methods
      .pickWinner(lotteryId)
      .accounts({ 
        lottery: lotteryAddress,  
        authority: wallet.publicKey
      })
      .rpc(); 
      
    await confirmTx(txHash, connection);
    updateState(); 
    console.log("picked a winner");
    toast("picked a winner!!")
  } catch(err) { 
    console.error("Error picking winner:", err);
    toast("there are no tickets")
  }
}

const claimPrize = async () => {
  try { 
    const txHash = await program?.methods
    .claimPrize(lotteryId,userWinningId)
    .accounts({
      lottery: lotteryAddress, 
      ticket: await getTicketAddress(lotteryAddress, userWinningId), 
      authority: wallet?.publicKey, 
      systemProgram: SystemProgram.programId
    })
    .rpc()
    await confirmTx(txHash, connection); 
    updateState() 
    console.log("claiming the prize")
  } catch(err) { 
    console.error(err, "there was a freaky error")
  }
}
  

  const value: AppContextType = {
    connected: !!wallet?.publicKey,
    isMasterInitialized: initialized, 
    initMaster, 
    createLottery, 
    lotteryId, 
    lotteryPot, 
    buyTicket, 
    isLotteryAuthority: wallet && lottery && wallet.publicKey.equals(lottery.authority), 
    isFinished: lottery && lottery.winnerId, 
    canClaim: lottery && !lottery.claimed && isUserWinner, 
    pickWinner, 
    lotteryHistory, 
    claimPrize
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

