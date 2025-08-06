"use client"

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

import { useRouter } from "next/navigation";


export default function Header() {

    const router = useRouter(); 
    

    return ( 
        <div className="flex items-center justify-between flex-row px-4 py-4 border-b shadow">
            <div className="text-2xl font-bold"> 
                Lottery app
            </div>
            <WalletMultiButton />
        </div>
    )
}