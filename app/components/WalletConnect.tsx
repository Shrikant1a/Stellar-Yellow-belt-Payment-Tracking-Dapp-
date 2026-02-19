'use client'

import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
} from '@creit.tech/stellar-wallets-kit';

interface WalletConnectProps {
  setAddress: (address: string) => void
  setKit: (kit: StellarWalletsKit) => void
  setWalletName: (name: string) => void
  className?: string
  children?: React.ReactNode
}

export default function WalletConnect({ setAddress, setKit, setWalletName, className, children }: WalletConnectProps) {

  const connect = async () => {
    try {
      const kit = new StellarWalletsKit({
        network: WalletNetwork.TESTNET,
        selectedWalletId: 'freighter',
        modules: allowAllModules(),
      });

      await kit.openModal({
        onWalletSelected: async (option) => {
          kit.setWallet(option.id);
          const { address } = await kit.getAddress();
          setAddress(address);
          setKit(kit);
          setWalletName(option.name);
        }
      });
    } catch (e: any) {
      alert(e.message || "Connection failed.");
    }
  }

  return (
    <button
      onClick={connect}
      className={className || "px-4 py-2 bg-black text-white rounded-lg"}
    >
      {children || 'Connect Wallet'}
    </button>
  )
}
