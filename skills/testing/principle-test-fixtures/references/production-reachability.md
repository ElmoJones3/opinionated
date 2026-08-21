# Production reachability

Use this reference when a fixture can be assembled directly or created through a production path. The production path decides whether the state is honest.

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

If the second test is red, the resolver or production representation is wrong. Do not change the fixture until it passes.

A state such as `verified`, `approved`, or `admin` follows the same rule. Establish it through the production transition before testing later behavior. Loading a literal with that state tests hydration only; it does not prove the transition works.

## Make a negative reach the named gate

A password-strength test must use a value long enough to pass the length rule. Otherwise it only proves length rejection. Start with a valid value and remove exactly the property under test.

```text
valid          = "StrongEnough1!"
missing_upper  = "strongenough1!"  # still long enough and otherwise valid
expect_failure(missing_upper, field="password", rule="password_strength")
```

## Bypass fixtures have a separate job

A hydration backstop intentionally constructs state no public behavior permits. Say so in the test name and call the whole-object validator directly. This proves defense against untrusted stored data. It does not prove the normal behavior path.
