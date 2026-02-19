import {
    StellarWalletsKit,
    WalletNetwork,
    allowAllModules,
    XBULL_MODULE_NAME,
    FREIGHTER_MODULE_NAME,
    ALBEDO_MODULE_NAME,
} from '@creit.tech/stellar-wallets-kit';

export const kit = new StellarWalletsKit({
    network: WalletNetwork.TESTNET,
    selectedWalletId: FREIGHTER_MODULE_NAME,
    modules: allowAllModules(),
});
