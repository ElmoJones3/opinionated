# Worked-example parity contract

Every branch shares one invariant: accepted and recovery work remain inside the capacity, cost, and overload behavior the claim names. Implement only the branches the language reference claims to support.

## Admission and concurrency

- **Scenario:** ordinary and recovery payment calls share finite provider slots.
- **Enforcement:** one atomic local gate for process scope or the deployed coordinator for global scope; reject invalid capacity configuration and represent an intentional closed gate explicitly.
- **Failures and proof:** full capacity returns a refusal that cannot collide with a successful call value, every exit releases once, cancellation does not leak a slot, and controlled concurrency proves the exact peak without sleeps.

A released local permit proves only that the adapter call returned or unwound. It does not prove already-sent remote work stopped, so capacity claims must say whether they cover local calls, provider-side work, or both.

## Retry amplification

- **Scenario:** workflow, client, and recovery retries can multiply provider calls.
- **Enforcement:** shared or allocated nested budgets with one stated worst-case bound.
- **Failures and proof:** unknown outcomes, exhausted layers, and recovery scans never exceed the physical-call or cost bound.

## Circuit breaking

- **Scenario:** dependency failure opens a circuit and later permits one probe.
- **Enforcement:** serialized breaker state with injected time and coordinated half-open ownership at the promised scope.
- **Failures and proof:** simultaneous probes, failed probe, and coordinator outage follow the stated fallback without settling abandoned effects.

## Global limits and operating objectives

- **Scenario:** several instances serve tenants under a global provider limit and measured delivery objective.
- **Enforcement:** deployed coordinator plus an indicator with named population, measurement point, exclusions, and window.
- **Failures and proof:** instance multiplication and coordinator loss cannot silently exceed the claim; labels remain bounded and objective calculations use the named population.

Local semaphore idioms may vary; C++ uses C++20 where `std::counting_semaphore` appears.
