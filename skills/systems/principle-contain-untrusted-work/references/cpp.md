# C++

Application checks narrow requests. Kernel, container, database-role, and network policy enforce capabilities the process must not hold.

## Structured input

```cpp
/** @file containment.cpp
 *  @brief Limits lower-trust jobs to receiver-owned operations and resources.
 */
#include <cstddef>
#include <stdexcept>
#include <string>

/** @brief Represents the only operation lower-trust input may select. */
struct Job {
  /** @brief Fixed receiver-owned operation, for example render. */ std::string operation;
  /** @brief Data passed through the interpreter's parameter API. */ std::string template_text;
  /** @brief Resource checked against current authenticated authority. */ std::string resource_id;
};

/** @brief Carries receiver-trusted identity, never authority claimed by input data. */
struct AuthenticatedJobActor {
  /** @brief Tenant bound by authentication middleware. */ std::string tenant_id;
  /** @brief Accountable authenticated caller. */ std::string subject_id;
};

/** @brief Checks current receiver-owned authority before interpretation. */
class JobAuthorization {
 public:
  /** @brief Binds actor, tenant, resource, and operation at the receiver. */
  virtual bool may_use_resource(const AuthenticatedJobActor& actor,
                                const std::string& resource_id,
                                const std::string& operation) = 0;
  /** @brief Allows destruction through the authorization interface. */
  virtual ~JobAuthorization() = default;
};

/** @brief Validates declared behavior and checks current receiver authority. */
Job authorize_job(Job parsed, const AuthenticatedJobActor& actor,
                  JobAuthorization& authorization) {
  if (parsed.operation != "render") {
    throw std::invalid_argument("operation is not allowed");
  }
  if (!authorization.may_use_resource(actor, parsed.resource_id,
                                      parsed.operation)) {
    throw std::invalid_argument("resource is not authorized");
  }
  return parsed;
}
```

Use the maintained parser already adopted for the input format. A `Job` constructed before parsing is not boundary validation. Keep `template_text` in a parameter or data API and never concatenate it into source, SQL, shell, or query text.

## Network fetch

```cpp
#include <string>
#include <vector>
/** @brief Represents a syntactically validated HTTPS URL. */
struct HttpsTarget { /** @brief Exact target revalidated after every redirect. */ std::string value; };
/** @brief Owns resolution, connect, redirects, and deployed egress enforcement. */
class FetchPolicy { public: /** @brief Rejects private targets and binds connection to approved resolution. */ virtual std::vector<std::byte> open_verified(const HttpsTarget& target) = 0; /** @brief Allows destruction through the adapter. */ virtual ~FetchPolicy() = default; };
```

Build `HttpsTarget` with the maintained URL parser already in the repository. The real policy rejects loopback, private, link-local, metadata, unapproved ports, rebinding, and redirect targets, then uses deployed egress controls. String prefixes and one DNS result do not earn that guarantee.

## Restricted execution

```cpp
#include <map>
#include <string>
#include <vector>
/** @brief Contains trusted executable choice, immutable arguments, input, and allowlisted environment. */
struct LaunchRequest { /** @brief Selected by trusted configuration. */ std::string executable; /** @brief Passed as an argument vector without a shell. */ std::vector<std::string> arguments; /** @brief Only job content exposed to the worker. */ std::vector<std::byte> input; /** @brief Complete environment, not additions to inherited secrets. */ std::map<std::string, std::string> environment; };
/** @brief Owns the named OS or container restrictions and bounded output. */
class Sandbox { public: /** @brief Enforces claimed filesystem, network, syscall, process, CPU, memory, time, and output limits. */ virtual std::vector<std::byte> run(const LaunchRequest& request) = 0; /** @brief Allows destruction through the adapter. */ virtual ~Sandbox() = default; };
```

Use the project's argument-vector process API for launch hygiene and supply a complete environment allowlist. That launch is not a sandbox. Only the named implementation behind `Sandbox` can earn the containment claim.

## Tenant authority

```cpp
#include <cstdint>
#include <string>
/** @brief Carries tenant authority derived from verified credentials. */
struct Actor { /** @brief Server-bound tenant, never copied from request data. */ std::string tenant_id; /** @brief Accountable authenticated caller. */ std::string subject_id; };
/** @brief Enforces tenant and version scope at the authoritative state change. */
class TenantStore { public: /** @brief Changes one row only when tenant, resource, and version match. */ virtual bool update_owned(const std::string& tenant_id, const std::string& resource_id, std::int64_t expected_version) = 0; /** @brief Allows destruction through the adapter. */ virtual ~TenantStore() = default; };
```

## Proof

Exercise malformed inputs, unauthorized resources, and injection strings against the real parser, authorization service, and interpreter. Test private, loopback, metadata, rebinding, and redirects through deployed egress. Prove environment absence separately from real sandbox filesystem, network, process, and resource denials. Exercise cross-tenant references and capacity at the receiver and database policy. Mark unavailable infrastructure claims unverified; fakes can check application routing but not containment.
