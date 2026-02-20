#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PaymentRecord {
    pub sender: Address,
    pub receiver: Address,
    pub amount: i128,
    pub memo: String,
    pub timestamp: u64,
}

#[contracttype]
pub enum DataKey {
    Payment(u32),
    Count,
}

#[contract]
pub struct PaymentTracker;

#[contractimpl]
impl PaymentTracker {
    /// Records a payment in the contract state
    pub fn record_payment(
        env: Env,
        sender: Address,
        receiver: Address,
        amount: i128,
        memo: String,
    ) -> u32 {
        // Authenticate the sender
        sender.require_auth();

        let timestamp = env.ledger().timestamp();

        let record = PaymentRecord {
            sender: sender.clone(),
            receiver,
            amount,
            memo,
            timestamp,
        };

        // Get current count
        let mut count: u32 = env.storage().persistent().get(&DataKey::Count).unwrap_or(0);
        count += 1;

        // Save the record
        env.storage().persistent().set(&DataKey::Payment(count), &record);
        
        // Update count
        env.storage().persistent().set(&DataKey::Count, &count);

        // Emit an event
        env.events().publish(
            (symbol_short!("payment"), sender, count),
            amount,
        );

        count
    }

    /// Returns the total number of payments recorded
    pub fn get_total_payments(env: Env) -> u32 {
        env.storage().persistent().get(&DataKey::Count).unwrap_or(0)
    }

    /// Fetches a specific payment record by its index
    pub fn get_payment(env: Env, id: u32) -> Option<PaymentRecord> {
        env.storage().persistent().get(&DataKey::Payment(id))
    }

    /// Fetches the last N payments
    pub fn get_recent_payments(env: Env, count: u32) -> Vec<PaymentRecord> {
        let total = Self::get_total_payments(env.clone());
        let start = if total > count { total - count + 1 } else { 1 };
        
        let mut recent = Vec::new(&env);
        for i in start..=total {
            if let Some(record) = Self::get_payment(env.clone(), i) {
                recent.push_back(record);
            }
        }
        recent
    }
}

mod test;
