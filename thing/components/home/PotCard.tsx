"use client"

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import style from "../styles/PotCard.module.css";
// import { useAppContext } from "../context/context";
// import { shortenPk } from "../utils/helper";
import { shortenPk } from "@/app/utils/helper";
// Temp imports
import { PublicKey } from '@solana/web3.js';
import { useState } from "react"
import { useAppContext } from "@/context/context";

const PotCard = () => {

  const { 
    connected, 
    isMasterInitialized, 
    initMaster
  } = useAppContext(); 
  console.log(connected, "connection status")



  // Static Data
  const lotteryId = 3
  const lotteryPot = 1000

  const lotteryHistory = [
    { lotteryId: 3, winnerId: 3, winnerAddress: new PublicKey("11111111111111111111111111111111"), prize: '15' }
  ]

  // Static States:

  // Is Wallet connected?
  // const [connected, setConnected] = useState(true)
  // Did the connected wallet create the lottery?
  const isLotteryAuthority = true
  // Is the master created for smart contract?
  // Is there already a winner for the lottery?
  const [isFinished, setIsFinished] = useState(false)
  // If there is a winner can that winner claim the prize?
  const [canClaim, setCanClaim] = useState(false)


  const createLottery = () => {
    // updates the lottery id
    console.log("Creating a new lottery")
  }

  const buyTicket = () => {
    // buys a ticket for the current lottery displayed
    console.log("Purchasing ticket for current lottery")
  }

  const pickWinner = () => {
    setCanClaim(true)
    console.log("Picking a winner and allowing that winner to claim the ticket")
  }

  const claimPrize = () => {
    setCanClaim(false)
    console.log("You're the winner! Claiming your prize now...")
  }

  if (!isMasterInitialized)
    return (
      <div className="flex flex-col justify-center items-center w-fit p-4 bg-gray-500">
        <div >
          Lottery <span >#{lotteryId}</span>
        </div>
        {connected ? (
          <>
            <button className=" btn btn-primary" onClick={initMaster}>
              Initialize master
            </button>
          </>
        ) : (
          <WalletMultiButton />
        )}
      </div>
    );

  return (
    <div className="flex flex-col justify-center items-center w-fit p-4 bg-gray-500">
      <div >
        Lottery <span>#{lotteryId}</span>
      </div>
      <div >Pot 🍯: {lotteryPot} SOL</div>
      <div>🏆Recent Winner🏆</div>
      <div>
        {lotteryHistory?.length &&
          shortenPk(
            lotteryHistory[lotteryHistory.length - 1].winnerAddress.toBase58()
          )}
      </div>
      {connected ? (
        <>
          {!isFinished && (
            <button className="btn btn-primary m-2" onClick={buyTicket}>
              Enter
            </button>
          )}

          {isLotteryAuthority && !isFinished && (
            <button className="btn btn-primary m-2" onClick={pickWinner}>
              Pick Winner
            </button>
          )}

          {canClaim && (
            <button className="btn btn-primary m-2" onClick={claimPrize}>
              Claim prize
            </button>
          )}

          <button className="btn btn-primary m-2" onClick={createLottery}>
            Create lottery
          </button>
        </>
      ) : (
        <WalletMultiButton />
      )}
    </div>
  );
};

export default PotCard;
