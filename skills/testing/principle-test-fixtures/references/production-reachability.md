# Production reachability

Use this reference when reachability is in doubt or a fixture can use several construction paths. The production contract decides whether the state is honest; each test need not replay its entire history.

## Do not grant the code the state it failed to create

Suppose a resolver should fall back to a system policy when no tenant policy matches. Production creates the system policy without a tenant identifier.

```text
# Bad: the fixture stamps the request tenant onto the system policy so the
# resolver's tenant filter accepts it.
system = Policy(kind="system", tenant_id=request.tenant_id)
result = resolve(request, [system])
assert result == system
```

That test is green only because its setup erases the defect.

```text
# Good: use the same seeder production uses.
system = seed_system_policy()
result = resolve(request, [system])
assert result == system
```

If the second test is red, the resolver or production representation is wrong. Do not alter the fixture to conceal that defect.

A state such as `verified`, `approved`, or `admin` follows the same honesty rule. Exercise the production transition when the claim includes earning that state. A later behavior test can begin with a valid restored snapshot when the production contract or existing evidence establishes its reachability. It proves that later behavior, not the earlier transition. Preserve required companion facts and use a construction path the model permits.

## Make a negative reach the named gate

A password-strength test must use a value long enough to pass the length rule. Otherwise it only proves length rejection. Start with a valid value and remove exactly the property under test.

```text
valid          = "StrongEnough1!"
missing_upper  = "strongenough1!"  # still long enough and otherwise valid
expect_failure(missing_upper, field="password", rule="password_strength")
```

## Bypass fixtures have a separate job

A hydration backstop intentionally constructs state no public behavior permits. Say so in the test name and call the whole-object validator directly. This proves defense against untrusted stored data. It does not prove the normal behavior path.
