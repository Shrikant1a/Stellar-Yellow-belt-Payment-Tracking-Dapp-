import {
  Asset,
  BASE_FEE,
  Operation,
  TransactionBuilder,
  Memo,
  Contract,
  xdr,
  scValToNative,
  rpc
} from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";
import { server, rpcServer, NETWORK_PASSPHRASE } from "./stellar";
import type { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit';

// TODO: Replace with your actual deployed Contract ID
export const CONTRACT_ID = "CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

export async function createPayment(from: string, to: string, amount: number, memo: string, kit?: StellarWalletsKit) {
  try {
    if (!to) throw new Error("Invalid recipient address");
    if (amount <= 0) throw new Error("Amount must be positive");

    // 1. Load source account
    let source;
    try {
      source = await server.loadAccount(from);
    } catch (e: any) {
      if (e.message && e.message.includes("404")) {
        throw new Error("Account not found on Testnet. Please fund your account using the Stellar Friendbot.");
      }
      throw e;
    }

    // 2. Build transaction
    const transaction = new TransactionBuilder(source, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.payment({
          destination: to,
          asset: Asset.native(),
          amount: amount.toString(),
        })
      )
      .addMemo(memo ? Memo.text(memo) : Memo.none())
      .setTimeout(30)
      .build();

    // 3. Sign
    let signedXdrString: string;

    if (kit) {
      // Multi-Wallet Signing
      const { signedTxXdr } = await kit.signTransaction(
        transaction.toXDR()
      );
      signedXdrString = signedTxXdr;
    } else {
      // Fallback to Freighter direct (Legacy)
      const signedXdrResponse = await signTransaction(transaction.toXDR(), {
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      if (typeof signedXdrResponse === 'string') {
        signedXdrString = signedXdrResponse;
      } else if (typeof signedXdrResponse === 'object') {
        if ('error' in signedXdrResponse && signedXdrResponse.error) {
          console.error("Freighter Error:", signedXdrResponse.error);
          throw new Error(typeof signedXdrResponse.error === 'string' ? signedXdrResponse.error : "Signing failed");
        }
        if ('signedTxXdr' in signedXdrResponse) {
          signedXdrString = signedXdrResponse.signedTxXdr as string;
        } else {
          console.error("Unexpected Freighter response:", signedXdrResponse);
          throw new Error("Unexpected response from wallet");
        }
      } else {
        throw new Error("Invalid response from wallet");
      }
    }

    // 4. Submit to network
    const txToSubmit = TransactionBuilder.fromXDR(signedXdrString, NETWORK_PASSPHRASE);
    const result = await server.submitTransaction(txToSubmit);

    console.log("Transaction Result:", result);

    return {
      success: true,
      hash: result.hash,
    };

  } catch (e: any) {
    console.error("Payment Error:", e);
    // Extract useful error message
    let errorMessage = e.message || "Transaction failed";
    if (e.response?.data?.extras?.result_codes) {
      errorMessage += `: ${JSON.stringify(e.response.data.extras.result_codes)}`;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function checkBalance(address: string) {
  try {
    const account = await server.loadAccount(address);
    // Find Native Balance (XLM)
    const balance = account.balances.find((b: any) => b.asset_type === 'native');

    return {
      success: true,
      balance: balance ? balance.balance : '0',
    };
  } catch (e: any) {
    return {
      success: false,
      error: e.message || "Failed to fetch balance",
    };
  }
}

export async function getTransactionHistory(address: string) {
  try {
    const history = await server.operations()
      .forAccount(address)
      .includeFailed(true)
      .limit(10)
      .order('desc')
      .call();

    return {
      success: true,
      records: history.records
    };
  } catch (e: any) {
    return {
      success: false,
      error: e.message
    };
  }
}
export async function getAnalyticsHistory(address: string) {
  try {
    const history = await server.operations()
      .forAccount(address)
      .includeFailed(false)
      .limit(100)
      .order('desc')
      .call();

    return {
      success: true,
      records: history.records
    };
  } catch (e: any) {
    return {
      success: false,
      error: e.message
    };
  }
}

export async function getTransactionDetails(hash: string) {
  try {
    const tx = await server.transactions().transaction(hash).call();
    return {
      success: true,
      transaction: tx
    };
  } catch (e: any) {
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Soroban Contract Call: Records a payment in the smart contract
 */
export async function recordOnChain(from: string, to: string, amount: number, memo: string, kit: StellarWalletsKit) {
  try {
    const contract = new Contract(CONTRACT_ID);
    const source = await server.loadAccount(from);

    // Build the Soroban invocation
    const transaction = new TransactionBuilder(source, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call("record_payment",
          xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccount(xdr.PublicKey.publicKeyTypeEd25519(Buffer.from(from)))), // sender
          xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccount(xdr.PublicKey.publicKeyTypeEd25519(Buffer.from(to)))),   // receiver
          xdr.ScVal.scvI128(new xdr.Int128Parts({
            lo: xdr.Uint64.fromString((BigUint64Array.from([BigInt(amount * 10_000_000)])[0]).toString()),
            hi: xdr.Int64.fromString("0")
          })), // amount (stroops)
          xdr.ScVal.scvString(memo) // memo
        )
      )
      .setTimeout(30)
      .build();

    const { signedTxXdr } = await kit.signTransaction(transaction.toXDR());
    const txToSubmit = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);

    // Simulate first to get footprint
    const simulation = await rpcServer.simulateTransaction(txToSubmit);
    if (rpc.Api.isSimulationError(simulation)) {
      throw new Error("Simulation failed");
    }

    // Rebuild with resource data
    const transactionWithResources = rpc.assembleTransaction(txToSubmit, simulation).build();
    const { signedTxXdr: signedFinalXdr } = await kit.signTransaction(transactionWithResources.toXDR());
    const finalTxSubmit = TransactionBuilder.fromXDR(signedFinalXdr, NETWORK_PASSPHRASE);

    const result = await rpcServer.sendTransaction(finalTxSubmit);

    return {
      success: true,
      hash: result.hash,
    };
  } catch (e: any) {
    console.error("Contract Error:", e);
    return {
      success: false,
      error: e.message || "Failed to call contract"
    };
  }
}

/**
 * Real-time Event Integration: Poll for payment events from the contract
 */
export async function getEvents() {
  try {
    const ledger = await rpcServer.getLatestLedger();
    const response = await rpcServer.getEvents({
      startLedger: ledger.sequence - 100,
      filters: [
        {
          type: "contract",
          contractIds: [CONTRACT_ID],
        },
      ],
    });

    return response.events.map(event => ({
      ...event,
      decodedData: scValToNative(xdr.ScVal.fromXDR(event.value.toXDR()))
    }));
  } catch (e) {
    console.error("Failed to fetch events:", e);
    return [];
  }
}
