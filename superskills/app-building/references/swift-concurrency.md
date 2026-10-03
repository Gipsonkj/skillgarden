> Distilled from: swift-concurrency (avdlee/swift-concurrency-agent-skill, MIT), write-swift (emilkowalski/skills, MIT)

# Swift language and concurrency

Swift rewards the simplest, most static, most single-threaded code that works. Move to concurrency, reference types, existentials or unsafe code only with a reason you can state.

| Need | Start with | Move on only when |
|---|---|---|
| Data | `struct` / `enum` | You need identity, sharing or inheritance |
| Abstraction | Concrete type | Code repeats across types |
| Polymorphism | `some P` | You must store mixed types → `any P` |
| Execution | Main actor, synchronous | Instruments shows a hang → `async` → `@concurrent` → `actor` |
| Safety | Safe APIs | C interop or a measured hot path |

## 1. Read the project settings first

Before giving any concurrency advice, check `Package.swift` or the `.pbxproj`:

| Setting | SwiftPM | Xcode |
|---|---|---|
| Language mode | `swiftLanguageVersions` / `-swift-version` | Swift Language Version |
| Strict concurrency | `.enableExperimentalFeature("StrictConcurrency=targeted")` | `SWIFT_STRICT_CONCURRENCY` |
| Default isolation | `.defaultIsolation(MainActor.self)` | `SWIFT_DEFAULT_ACTOR_ISOLATION` |
| Upcoming features | `.enableUpcomingFeature("NonisolatedNonsendingByDefault")` | `SWIFT_UPCOMING_FEATURE_*` |
| Approachable Concurrency | individual features | `SWIFT_APPROACHABLE_CONCURRENCY` |

If unknown, ask; don't guess. Recommended: Approachable Concurrency on everywhere; MainActor default isolation for app and UI modules (Xcode 26 default for new apps); **not** for general-purpose libraries, which ship `nonisolated` APIs and let callers decide.

## 2. The Swift 6.2 model

- **`async` no longer leaves the caller's actor.** An `async` function runs where it is called unless marked otherwise.
- `@concurrent`: always runs on the concurrent pool. Put it on your own CPU-heavy work, after a profile shows a hang.
- `nonisolated`: runs wherever it is called from; the right default for library APIs. `nonisolated` on a type applies to all members.
- Progression, in order: single-threaded on the main actor → `async/await` to hide latency (SDK calls like `URLSession` already offload) → `@concurrent` for your heavy work → `actor` when main-actor state forces constant hops.
- `await` is a suspension point: state may change while suspended. Re-check assumptions after every `await`; never hold a lock across one.
- Don't create a task for trivial work. One task per end-to-end operation.

## 3. Choosing the tool

| Need | Tool |
|---|---|
| One async operation | `async/await` |
| Fixed number in parallel | `async let` |
| Dynamic number in parallel | `withTaskGroup` (bounded: start N, add one as each finishes); `withDiscardingTaskGroup` when children return nothing |
| Bridge from sync code (button, delegate) | `Task { }` (inherits actor and priority; you own cancellation) |
| Shared mutable state | `actor` |
| UI state | `@MainActor` (only when truly UI-bound) |
| Callback API → async | `withCheckedThrowingContinuation`, resumed exactly once on every path |
| Delegate or handler stream → async | `AsyncStream`, cleanup in `onTermination` |
| Context down the task tree | `@TaskLocal` (optional, with a sensible default) |

`Task.detached` almost never: it inherits nothing. Cancellation is cooperative: check `try Task.checkCancellation()` before expensive steps.

**Task entry isolation**: look at the code before the first `await`. If it touches main-actor state, keep the inherited start. If not, start off-main and hop back only for the UI write:

```swift
Task { @concurrent in
    let data = try await fetchData()
    await MainActor.run { self.items = data }
}
```

## 4. Actors

- Actors give mutual exclusion, not transactions. Mutate state in synchronous actor methods (they run to completion); keep async actor methods thin.
- Classic reentrancy bug: check cache → `await` download → write cache; two callers both download. Re-check after the `await` or keep a dictionary of in-flight tasks.
- Actors are not FIFO. For ordering, use one task or an `AsyncStream`.
- Protocol conformance on an isolated type: prefer isolated conformance (`extension Foo: @MainActor SomeProtocol`).

## 5. Sendable and data-race errors

Fix in this order:
1. **Don't share it**: give each concurrent job its own instance (fixes most real errors).
2. Make it a `Sendable` value type (sharing becomes copying).
3. Isolate it to an actor (main or your own).
4. Only then `Mutex`/`Atomic` from `Synchronization` (in `let` properties) or `@unchecked Sendable` for types with real internal locking.

- Value types are `Sendable` when their storage is (inferred for non-public types; public types must declare it). Actors and `@MainActor` classes are implicitly `Sendable`.
- Most model classes should be neither `@MainActor` nor `Sendable`; to leave the main actor make them `nonisolated`. A non-Sendable value can be *sent* if the sender stops using it.
- Globals: `let` → `@MainActor` → `Mutex` → `nonisolated(unsafe)` (last resort).
- Legacy delegates you don't own: `nonisolated` method + `MainActor.assumeIsolated { }`, or `@preconcurrency` on the conformance. `@preconcurrency import` only as a temporary bridge.
- Any `@preconcurrency`, `@unchecked Sendable` or `nonisolated(unsafe)` needs a written safety invariant and a removal plan. Never `@MainActor` as a blanket fix; justify UI-boundness.

| Diagnostic | First fix |
|---|---|
| Main actor-isolated … from a nonisolated context | If truly UI-bound, isolate the caller; else move the work off the main actor |
| Sending non-Sendable value risks data races | Keep access in one domain, or send an immutable value |
| Actor-isolated type does not conform to protocol | Isolated conformance |
| `wait(...)` unavailable from async contexts | `await fulfillment(of:)` or Swift Testing |
| Core Data objects crossing contexts | Pass `NSManagedObjectID` or a value snapshot |
| SwiftLint `async_without_await` | Remove `async`; never add a fake `await` |

## 6. SwiftUI specifics

- Views and their `@State` are main-actor isolated; with MainActor default isolation, delete redundant `@MainActor` annotations.
- `@Sendable` closures (`visualEffect`, `Shape.path`, `Layout`, `onGeometryChange`) may run off main: capture the one value you need (`{ [pulse] effect, proxy in … }`), not `self`.
- Start animations synchronously in the event callback; open a `Task` only for the long work after.

## 7. Migration to Swift 6 (loop)

Build → fix one category of diagnostics (e.g. all Sendable) → rebuild clean → run tests → next module. Small, separate commits; no unrelated refactors.

## 8. General Swift

- Enums for mutually exclusive state instead of piles of optionals. Copy-on-write when a struct wraps a class.
- `throw` for recoverable errors (enum errors with associated values); `precondition` for programmer mistakes; `guard` for exits; force-unwrap only with a stated invariant. Typed throws for internal code, untyped for public API.
- Write concrete types first; extract a protocol when code repeats; `some` before `any`; composition over inheritance; `final` on classes not meant for subclassing.
- Performance: fix the algorithm first (`remove(at:)` in a loop is O(n²)), then profile with Time Profiler and Allocations against a test.
- Tests: Swift Testing (`@Test`, `#expect`, `#require`) for new code.

## Verification

Re-check settings before reading diagnostics; build clean one category at a time; run actor-, lifetime- and cancellation-sensitive tests; confirm long-lived tasks are cancelled and objects deallocate; use Instruments for any speed claim; no semaphores in async code.
