#![cfg(test)]
use super::*;
use soroban_sdk::testutils::{Address as _, Events};
use soroban_sdk::{vec, Env, IntoVal, String};

#[test]
fn test_record_payment() {
    let env = Env::default();
    let contract_id = env.register_contract(None, PaymentTracker);
    let client = PaymentTrackerClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let amount: i128 = 1000;
    let memo = String::from_str(&env, "Test Payment");

    env.mock_all_auths();

    let id = client.record_payment(&sender, &receiver, &amount, &memo);
    assert_eq!(id, 1);

    let total = client.get_total_payments();
    assert_eq!(total, 1);

    let record = client.get_payment(&1).unwrap();
    assert_eq!(record.sender, sender);
    assert_eq!(record.amount, amount);
    assert_eq!(record.memo, memo);

    // Check events
    let events = env.events().all();
    assert_eq!(events.len(), 1);
}
