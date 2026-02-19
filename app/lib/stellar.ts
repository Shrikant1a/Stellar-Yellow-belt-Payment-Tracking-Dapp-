import { Horizon, Networks } from '@stellar/stellar-sdk'

export const server = new Horizon.Server(
  'https://horizon-testnet.stellar.org'
)

export const NETWORK_PASSPHRASE = Networks.TESTNET
