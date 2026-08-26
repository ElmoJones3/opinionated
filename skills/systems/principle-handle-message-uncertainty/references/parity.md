# Worked-example parity contract

- **Scenario:** a payment request may commit while its reply is lost; cancellation races completion; one ordered event can be redelivered.
- **Invariant:** elapsed time, transport failure, and cancellation request never become proof of remote absence.
- **Identity and state:** transport delivery, source sequence, logical effect, and receiver evidence stay distinct; knowledge is confirmed, refused, pending, or unknown.
- **Enforcement boundary:** the receiver defines evidence; one local transaction commits inbox receipt with the resulting state.
- **Required failures:** lost request, lost refusal, lost success reply, pending work, duplicate, sequence gap, and cancellation-before/after-commit race.
- **Required proof:** deterministic transport schedule plus the production database for inbox atomicity, or an explicit unverified dependency claim.
- **Language freedom:** cancellation and async syntax may differ; their proof scope may not.
