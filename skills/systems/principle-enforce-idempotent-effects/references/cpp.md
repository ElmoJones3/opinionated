# C++ reference

This example emits the same canonical request bytes as the other languages: `CAP1`, unsigned 64-bit
amount cents, length-prefixed UTF-8 currency, then length-prefixed UTF-8 order ID. C++ has no
standard SHA-256. Use the maintained cryptographic library already selected by the repository.

```cpp
/** This excerpt builds receiver input; the production receiver owns atomic arbitration. */
#include <array>
#include <cstddef>
#include <cstdint>
#include <stdexcept>
#include <string>
#include <vector>

/** Is the meaning protected by one idempotency identity. */
struct CaptureRequest {
  std::uint64_t amount_cents; ///< Uses positive integer minor units.
  std::string currency;       ///< Uses the receiver's normalized uppercase currency code.
  std::string order_id;       ///< Binds the effect to one business obligation.
};

/** Scopes a stable key to one receiver namespace. */
struct ReceiverIdentity {
  std::string receiver_account; ///< Selects the provider-owned account.
  std::string environment;      ///< Prevents test and production collisions.
  std::string operation;        ///< Prevents a key from naming another operation.
  std::string effect_key;       ///< Remains stable across every equivalent delivery.
};

/** Appends one unsigned 16-bit integer in network byte order. */
void append_u16(std::vector<std::byte>& output, std::uint16_t value) {
  output.push_back(static_cast<std::byte>((value >> 8) & 0xff));
  output.push_back(static_cast<std::byte>(value & 0xff));
}

/** Appends one unsigned 64-bit integer in network byte order. */
void append_u64(std::vector<std::byte>& output, std::uint64_t value) {
  /** Shift visits each network-order byte from most to least significant. */
  for (int shift = 56; shift >= 0; shift -= 8) {
    output.push_back(static_cast<std::byte>((value >> shift) & 0xff));
  }
}

/** Appends one bounded UTF-8 field without separator ambiguity. */
void append_field(std::vector<std::byte>& output, const std::string& value) {
  if (value.size() > 0xffff) throw std::invalid_argument("canonical field exceeds 65535 bytes");
  append_u16(output, static_cast<std::uint16_t>(value.size()));
  /** Byte preserves the already-normalized UTF-8 representation. */
  for (const unsigned char byte : value) output.push_back(static_cast<std::byte>(byte));
}

/** Creates the versioned byte identity shared by every implementation. */
std::vector<std::byte> canonical_capture_bytes(const CaptureRequest& request) {
  if (request.amount_cents == 0) throw std::invalid_argument("amount cents must be positive");
  /** Output begins with the canonical-format version and preserves fixed field order. */
  std::vector<std::byte> output{
      std::byte{'C'}, std::byte{'A'}, std::byte{'P'}, std::byte{'1'}};
  append_u64(output, request.amount_cents);
  append_field(output, request.currency);
  append_field(output, request.order_id);
  return output;
}

/** Is the fixed-size digest returned by the repository's maintained SHA-256 implementation. */
using Sha256Digest = std::array<std::byte, 32>;

/** Delegates hashing to the maintained cryptographic library already used by the project. */
Sha256Digest sha256(const std::vector<std::byte>& input);

/** Identifies the receiver authority's arbitration result. */
enum class SettlementKind {
  committed, ///< Covers the winner and equivalent replays.
  conflict,  ///< Rejects one key carrying a changed digest.
  pending,   ///< Requires an authoritative in-flight owner.
};

/** Carries the stored response for committed calls. */
struct SettlementResult {
  SettlementKind kind;        ///< Identifies committed, conflict, or pending state.
  std::string ledger_entry_id;///< Is stable for the winner and equivalent replays.
  bool replay;                ///< Says whether an earlier call created the entry.
};

/** Owns unique arbitration, ledger mutation, and stored response. */
class PaymentLedger {
 public:
  /** Allows cleanup through the receiver boundary. */
  virtual ~PaymentLedger() = default;
  /** Performs all receiver-owned changes in one transaction or equivalent protocol. */
  virtual SettlementResult settle_once(
      const ReceiverIdentity& identity,
      const CaptureRequest& request,
      const Sha256Digest& digest) = 0;
};
```

Use the production SQL client already in the project, such as libpqxx only when it is already the
PostgreSQL choice. The receiver transaction owns scoped uniqueness, digest comparison, ledger
mutation, and stored response. The abstract class does not. Never imply that this local transaction
covers an unrelated provider call.

Use one shared golden vector: 4,000 cents, `USD`, and `order-123` encode as
`434150310000000000000fa0000355534400096f726465722d313233` and hash to
`d2c10eb12de108dcea8788149a7770b038b513a19f8338af27286a90549a3e78`. Exercise concurrent first
calls, replay, conflict,
transaction fault points, authoritative pending behavior, and post-retention reuse against the
deployed store. If its uniqueness, isolation, or retention behavior cannot run, call it unverified.
