"use client";
import { ReactNode, useEffect, useState, createContext, useContext } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import { DynamicContextProvider, DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

const NavContent = () => {
  const { primaryWallet, user } = useDynamicContext();
  const router  = useRouter();
  const pathname = usePathname();

   useEffect(() => {
    const handleWalletConnection = async () => {
      if (primaryWallet && user && pathname === '/') {
        const walletAddress = primaryWallet.address;

        router.push('/reorts');
      }
    };

    handleWalletConnection();
  }, [primaryWallet, user, pathname, router]);
  

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-[90vw] md:max-w-5xl px-4 md:px-6 py-3 flex justify-between items-center bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <Link href="/" className="flex items-center gap-2 md:gap-3 group">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 text-xl md:text-2xl font-bold tracking-wider group-hover:from-gray-700 group-hover:to-gray-500 transition-all duration-300">
          PLAY
        </span>
      </Link>

      <div className="flex items-center gap-3">

        <div className="relative group">
          <div className="relative bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <DynamicWidget />
          </div>
        </div>
      </div>
    </nav>
  );
};

const ClientWrapper = ({ children }: { children: ReactNode }) => {

  return (
    <DynamicContextProvider
      settings={{
        environmentId: "33eedafd-f5f1-4a2b-942e-21a41512f381",

        walletConnectors: [EthereumWalletConnectors],
      }}
    >
        <div className="relative min-h-screen  bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <NavContent />
          <main className="pt-16" style={{ backgroundImage: 'radial-gradient(#e5e5e5 1px, transparent 1px)', backgroundSize: '30px 30px' }}>{children}</main>
        </div>
    </DynamicContextProvider>

  );
};

export default ClientWrapper;