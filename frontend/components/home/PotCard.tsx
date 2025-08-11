"use client"

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { shortenPk } from "@/app/utils/helper";
import { useEffect } from "react"
import { useAppContext } from "@/context/context";

const PotCard = () => {

  const { 
    connected, 
    initMaster, 
    createLottery, 
    lotteryId, 
    lotteryPot, 
    buyTicket, 
    isLotteryAuthority, 
    canClaim, 
    isFinished, 
    lotteryHistory, 
    pickWinner, 
    claimPrize
  } = useAppContext(); 
  console.log(connected, "connection status")

  const isMasterInitialized = true

  useEffect( 
  () => { 
    console.log("this is the lottery History", lotteryHistory)
    console.log("master initializign status: ", isMasterInitialized)
  }
  , [lotteryHistory, isMasterInitialized])

  const lastWinner = lotteryHistory?.[lotteryHistory.length - 1];

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
    <div className="card card-border mt-10 w-96 shadow bg-base-200">
      <div className="card-body">
        <div className="card-title">
          Lottery <span>#{lotteryId}</span>
        </div>
        <div>Pot 🍯: {lotteryPot} SOL</div>
        <div className="flex flex-col justify-center items-center gap-1">
            <div className="font-black text-2xl">🏆Recent Winner🏆</div>
            <div className=" text-accent font-bold text-xl">
                {!lotteryHistory ? (
                  <span className="text-gray-400">Loading winners...</span>
                ) : lotteryHistory.length === 0 ? (
                  <span className="text-gray-400">No winners yet</span>
                ) : lastWinner?.winnerAddress?.toBase58 ? (
                  shortenPk(lastWinner.winnerAddress.toBase58())
                ) : (
                  <span className="text-gray-400">Winner data unavailable</span>
                )}
            </div>
        </div>
            {connected ? (
              <>
                {!isFinished && (
                  <button className="btn btn-primary m-2 rounded" onClick={buyTicket}>
                    Enter
                  </button>
                )}

                {isLotteryAuthority && !isFinished && (
                  <button className="btn btn-primary m-2 rounded" onClick={pickWinner}>
                    Pick Winner
                  </button>
                )}

                {canClaim && (
                  <button className="btn btn-primary m-2 rounded" onClick={claimPrize}>
                    Claim prize
                  </button>
                )}

                <button className="btn btn-primary m-2 rounded" onClick={createLottery}>
                  Create lottery
                </button>
              </>
            ) : (
              <WalletMultiButton />
            )}
      </div>
    </div>
  );
};

export default PotCard;
