"use client"

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useEffect, useState } from "react"


export default function Header() {
    const [mounted, setMounted] = useState(false);

    useEffect(()=> { 
        setMounted(true); 
    },[])

    return ( 
        <div className="flex items-center justify-between flex-row px-4 py-4 bg-base-300 shadow">
            <div className="text-2xl font-bold"> 
                Lottery app
            </div>
            { mounted && <WalletMultiButton /> } 
        </div>
    )
}