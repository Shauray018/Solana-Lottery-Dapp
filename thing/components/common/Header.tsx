"use client"

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

export default function Header() { 
    return ( 
        <div className="flex items-center justify-between flex-row px-4 py-4 border-b">
            <div className="text-2xl font-bold"> 
                Lottery app
            </div>
            <WalletMultiButton />
        </div>
    )
}