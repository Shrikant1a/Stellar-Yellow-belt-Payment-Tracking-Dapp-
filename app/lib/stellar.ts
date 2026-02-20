import { Horizon, Networks, rpc } from '@stellar/stellar-sdk'

export const server = new Horizon.Server(
  'https://horizon-testnet.stellar.org'
)

export const rpcServer = new rpc.Server(
  'https://soroban-testnet.stellar.org'
)

export const NETWORK_PASSPHRASE = Networks.TESTNET
