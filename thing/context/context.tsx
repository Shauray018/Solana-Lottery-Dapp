"use client"

import { createContext, useContext, useMemo, ReactNode, useEffect, useState } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { getMasterAddress, getProgram } from "@/app/utils/program";
import { confirmTx, mockWallet } from "@/app/utils/helper";
import { SystemProgram } from "@solana/web3.js";

// Define the context type
interface AppContextType {
  connected: boolean;
  isMasterInitialized?: any;
  initMaster: any;
}

// Create context with initial value
export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {

  const [masterAddress, setMasterAddress] = useState(); 
  const [initialized, setInitialized] = useState(false); 

  const { connection } = useConnection(); 
  const wallet = useAnchorWallet(); 
  const program = useMemo(() => {
    if (connection) { 
      //@ts-ignore
      return getProgram(connection, wallet ?? mockWallet()); 
    }
    return undefined;
  }, [connection, wallet]);

  useEffect(()=> { 
    updateState()
  }, [program])

  const updateState = async () => { 
    if (!program) return; 

    try { 
      if(!masterAddress) {
        const ma = await getMasterAddress() 
        //@ts-ignore
        setMasterAddress(ma); 
        console.log(masterAddress); 
      }

      const master = await program.account.master.fetch(
        masterAddress ?? (await getMasterAddress())
      )
      setInitialized(true);
    } catch(err) { 
      console.log("there was an error")
    }
  }

  
  // call solana program instructions 
  const initMaster = async () => { 
    try { 
      const txHash = await program?.methods
      .initMaster()
      .accounts({
        master: masterAddress,
        payer: wallet?.publicKey,
        systemProgram: SystemProgram.programId
      }) 
      .rpc()
      await confirmTx(txHash, connection)

      updateState()
    } catch (err) { 
      console.log(err, "fuck u errror u can suck my terror??")
    }
  }

  const createLottery = async () => { 
    try { 

    } catch(err) { 
      console.log(err, "this is the error u red head")
    }
  }

  
  const value: AppContextType = {
    connected: wallet?.publicKey ? true : false,
    isMasterInitialized: initialized, 
    initMaster, 
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
