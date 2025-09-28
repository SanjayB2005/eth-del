"use client";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

// Import Dynamic components directly - we'll handle SSR issues with the provider wrapper
import { DynamicContextProvider, DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { QueryClient } from "@tanstack/react-query";
import { http } from "viem";
import { createConfig } from "wagmi";
import { sepolia } from "viem/chains";
import { AuthProvider } from "@/hooks/useAuth";

// Define Filecoin Calibration testnet chain
const filecoinCalibration = {
  id: 314159,
  name: 'Filecoin Calibration',
  network: 'filecoin-calibration',
  nativeCurrency: {
    decimals: 18,
    name: 'Testnet Filecoin',
    symbol: 'tFIL',
  },
  rpcUrls: {
    default: {
      http: ['https://api.calibration.node.glif.io/rpc/v1'],
      webSocket: ['wss://wss.calibration.node.glif.io/apigw/lotus/rpc/v1'],
    },
    public: {
      http: ['https://api.calibration.node.glif.io/rpc/v1'],
      webSocket: ['wss://wss.calibration.node.glif.io/apigw/lotus/rpc/v1'],
    },
  },
  blockExplorers: {
    default: { name: 'Filfox', url: 'https://calibration.filfox.info' },
  },
  testnet: true,
} as const;

// Create HTTP transport with retry logic
const createHttpTransport = (url: string) => {
  return http(url, {
    batch: {
      batchSize: 1024,
      wait: 16,
    },
    retryCount: 3,
  });
};

const NavContent = () => {
  const { primaryWallet, user } = useDynamicContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleWalletConnection = async () => {
      try {
        if (primaryWallet && user && pathname === '/') {
          const walletAddress = primaryWallet.address;
          console.log('🔗 Wallet connected:', walletAddress.substring(0, 6) + '...');
          router.push('/reports');
        }
      } catch (error) {
        console.error('❌ Error handling wallet connection:', error);
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
  const [hasError, setHasError] = useState(false);

  const config = createConfig({
    chains: [sepolia, filecoinCalibration],
    multiInjectedProviderDiscovery: false,
    transports: {
      [sepolia.id]: createHttpTransport('https://ethereum-sepolia.publicnode.com'),
      [filecoinCalibration.id]: createHttpTransport('https://api.calibration.node.glif.io/rpc/v1'),
    },
  });
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          // Don't retry RPC errors
          if (error instanceof Error && error.message.includes('HTTP request failed')) {
            return false;
          }
          return failureCount < 3;
        },
      },
    },
  });

  // Error boundary effect
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('HTTP request failed') || 
          event.error?.message?.includes('fetch failed')) {
        console.warn('🔧 RPC connection issue detected, continuing with limited functionality');
        setHasError(true);
        // Don't let this crash the app
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <DynamicContextProvider
      settings={{
        environmentId: "33eedafd-f5f1-4a2b-942e-21a41512f381",
        walletConnectors: [EthereumWalletConnectors],
        initialAuthenticationMode: 'connect-only',
        // Add network configurations
        overrides: {
          evmNetworks: [
            {
              blockExplorerUrls: ['https://sepolia.etherscan.io/'],
              chainId: 11155111,
              chainName: 'Sepolia',
              iconUrls: ['https://app.dynamic.xyz/assets/networks/eth.svg'],
              name: 'Sepolia',
              nativeCurrency: {
                decimals: 18,
                name: 'Ether',
                symbol: 'ETH',
              },
              networkId: 11155111,
              rpcUrls: ['https://ethereum-sepolia.publicnode.com'],
              vanityName: 'Sepolia Testnet',
            },
            {
              blockExplorerUrls: ['https://calibration.filfox.info/'],
              chainId: 314159,
              chainName: 'Filecoin Calibration',
              iconUrls: ['https://cryptologos.cc/logos/filecoin-fil-logo.svg'],
              name: 'Filecoin Calibration Testnet',
              nativeCurrency: {
                decimals: 18,
                name: 'Testnet Filecoin',
                symbol: 'tFIL',
              },
              networkId: 314159,
              rpcUrls: [
                'https://api.calibration.node.glif.io/rpc/v1',
                'https://rpc.ankr.com/filecoin_testnet',
                'https://filecoin-calibration.chainstacklabs.com/rpc/v1'
              ],
              vanityName: 'Filecoin Calibration',
            },
          ],
        },
      }}
    >
      {/* <AuthProvider> */}

      <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {hasError && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg shadow-lg">
            <p className="text-sm">
              ⚠️ Network connectivity issues detected. Some features may be limited.
            </p>
          </div>
        )}
        <NavContent />
        <main className="pt-16" style={{ backgroundImage: 'radial-gradient(#e5e5e5 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
          {children}
        </main>
      </div>
      {/* </AuthProvider> */}
    </DynamicContextProvider>
  );
};

export default ClientWrapper;