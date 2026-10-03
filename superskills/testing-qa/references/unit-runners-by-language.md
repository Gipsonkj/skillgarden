# Unit and integration test runners by language

> Distilled from: python-testing-patterns and javascript-testing-patterns (wshobson/agents, MIT), pytest-coverage and java-junit (github/awesome-copilot, MIT), vitest (antfu/skills, MIT), golang-testing (samber/cc-skills-golang, MIT), swift-testing-pro (twostraws/Swift-Testing-Agent-Skill, MIT)

Use the runner the project already has; find it in `pyproject.toml`, `package.json`, `go.mod`, `pom.xml` / `build.gradle`, `Package.swift`. Match the naming, folder layout and assertion style of 2-3 nearby tests. General rules are in [tdd-and-unit-tests.md](tdd-and-unit-tests.md).

## Commands at a glance

| Stack | Run all | One test | Watch | Coverage |
|---|---|---|---|---|
| pytest | `pytest` | `pytest tests/test_cart.py::test_rejects_expired -x` | `ptw` (if installed) | `pytest --cov=pkg --cov-report=term-missing` |
| Vitest | `npx vitest run` | `npx vitest run cart -t "rejects expired"` | `npx vitest` | `npx vitest run --coverage` |
| Jest | `npx jest` | `npx jest cart -t "rejects expired"` | `npx jest --watch` | `npx jest --coverage` |
| Go | `go test ./...` | `go test ./cart -run 'TestApply/expired'` | n/a | `go test -cover -coverprofile=c.out ./...` |
| JUnit (Maven/Gradle) | `mvn test` / `./gradlew test` | `mvn test -Dtest=CartTest#rejectsExpired` / `./gradlew test --tests CartTest` | `./gradlew test --continuous` | JaCoCo plugin |
| Swift Testing | `swift test` | `swift test --filter CartTests` | n/a | `swift test --enable-code-coverage` |

## Python: pytest

- Layout: `tests/` mirroring the package; shared fixtures in `conftest.py`; files `test_*.py`, functions `test_*`.
- Fixtures over setup methods; choose the narrowest scope (`function` by default; `session` only for expensive, read-only resources). Use `yield` fixtures for teardown. Built-ins: `tmp_path`, `monkeypatch`, `capsys`, `caplog`.
- Parametrise with ids: `@pytest.mark.parametrize("raw,expected", [...], ids=["empty", "unicode", ...])`.
- Errors: `with pytest.raises(ValueError, match="expired"):`.
- Mocking: `unittest.mock.patch("pkg.module.name_where_used")`, patching where the name is looked up, not where it's defined. `autospec=True` so signatures match. HTTP: `responses`, `respx` or `pytest-httpx`.
- Async: `pytest-asyncio` (or `anyio`) with `@pytest.mark.asyncio`.
- Time: `freezegun` or `time-machine`. Property-based: `hypothesis`.
- Markers for slow / integration tests (`@pytest.mark.integration`), registered in config, deselected with `-m "not integration"`.
- Coverage annotate mode to see uncovered lines: `pytest --cov=pkg --cov-report=annotate:cov_annotate`; lines starting with `!` are uncovered. Use it to find risky gaps, not to chase 100%.

## JavaScript / TypeScript: Vitest (and Jest)

- Vitest is Jest-compatible: `describe`, `it`/`test`, `expect`, `beforeEach`. Prefer it on Vite projects; keep Jest where it's already set up.
- Environment per file or project: `node` by default; `jsdom` or `happy-dom` for DOM; Vitest browser mode for real-browser component tests.
- Mocks: `vi.fn()`, `vi.spyOn(obj, 'method')`, `vi.mock('./api', () => ({...}))` (hoisted; use `vi.hoisted` for shared values). Restore with `vi.restoreAllMocks()` in `afterEach` or `restoreMocks: true` in config.
- HTTP: Mock Service Worker (`msw`) at the network layer beats mocking fetch.
- Timers and dates: `vi.useFakeTimers()`, `vi.setSystemTime(new Date('2026-01-31'))`, `vi.advanceTimersByTime(1000)`; `vi.useRealTimers()` after.
- Fixtures: `test.extend({ db: async ({}, use) => { ...; await use(db); ...cleanup } })`.
- Tables: `it.each([[1, 'one'], [2, 'two']])('formats %i', ...)`.
- Snapshots: only for stable, reviewed output; prefer `toMatchInlineSnapshot` for small values. A snapshot nobody reads is a change detector.
- React components: Testing Library (`render`, `screen.getByRole`, `userEvent`), asserting what the user sees, not component state.
- Type tests: `expectTypeOf(fn).returns.toEqualTypeOf<Money>()`.
- Monorepos: `projects` in `vitest.config.ts`; CI sharding with `--shard=1/3`.

## Go: testing package

- Files `x_test.go` beside the code; `package x` for internals, `package x_test` for black-box tests of the public API (prefer this).
- Table-driven tests with **named** cases and `t.Run(tc.name, ...)`; call `t.Parallel()` in independent tests and subtests.
- Use `t.Helper()` in helpers, `t.Cleanup()` for teardown, `t.TempDir()`, `t.Setenv()`.
- Compare structs with `github.com/google/go-cmp/cmp` (`cmp.Diff(want, got)`); testify `require` for preconditions, `assert` otherwise, if the project uses it.
- HTTP handlers: `httptest.NewRecorder()` and `httptest.NewServer()`.
- Mock interfaces, not concrete types; define the small interface at the consumer.
- Concurrency: always run `go test -race` in CI; `goleak.VerifyTestMain` for goroutine leaks; `testing/synctest` for deterministic time-based concurrent code.
- Integration tests behind a build tag (`//go:build integration`) and run with `-tags=integration`.
- Fuzzing: `func FuzzParse(f *testing.F)`, run with `go test -fuzz=FuzzParse -fuzztime=30s`; failing inputs land in `testdata/fuzz/` and become regression cases.
- Benchmarks: `func BenchmarkX(b *testing.B)` with `b.Loop()` (Go 1.24+), compared with `benchstat`.
- Repeat to expose flakes: `go test -run TestX -count=200 -race`.

## Java: JUnit 5

- Tests in `src/test/java`, class name `<Subject>Test`, AAA structure, `@DisplayName` for readable reports.
- Names like `apply_rejectsExpiredCode` or `methodName_should_expected_when_scenario`; one behaviour per test.
- `@BeforeEach` / `@AfterEach` per test; `@BeforeAll` / `@AfterAll` static, for expensive shared setup only.
- Parameterised: `@ParameterizedTest` with `@ValueSource`, `@CsvSource`, `@MethodSource`, `@EnumSource`.
- `assertThrows(IllegalArgumentException.class, () -> ...)`; `assertAll(...)` to report every failing field; AssertJ (`assertThat(x).isEqualTo(...)`) for fluent assertions when present.
- Mockito: `@ExtendWith(MockitoExtension.class)`, `@Mock`, `@InjectMocks`; mock interfaces at boundaries.
- `@Nested` classes to group scenarios; `@Tag("integration")` to split suites. `@Disabled("reason + issue link")` only with a reason; avoid `@Order` unless the order is the thing under test.
- Integration with real databases: Testcontainers.

## Swift: Swift Testing

- New unit and integration tests use Swift Testing (`import Testing`); UI tests still use XCTest.
- Suites are `struct`s, not `XCTestCase` subclasses; setup in `init()`, teardown in `deinit` (use a class or actor only if you need `deinit`).
- `@Test("Rejects expired codes") func rejectsExpired()`; `#expect(cart.total == 42)` for checks; `try #require(users.first)` for preconditions that should stop the test (no force unwraps).
- Parameterised: `@Test(arguments: [...])`, or two collections with `zip` to avoid a cartesian product.
- Errors: `#expect(throws: CartError.expired) { try cart.apply(code) }`.
- Async: mark tests `async`; use `confirmation()` for callbacks/events instead of expectations and waits; `.timeLimit(.minutes(1))` traits.
- Traits: `.tags(.networking)`, `.disabled("reason")`, `.bug("URL")`, `.serialized` only when shared state truly requires it (tests run in parallel by default).
- Migrating from XCTest: `XCTAssertEqual(a, b)` -> `#expect(a == b)`; `XCTUnwrap` -> `#require`; `setUp` -> `init`. Migrate file by file; both can coexist in one target.
- Review output: findings grouped by file, each with line, rule, and a short before/after; end with a prioritised summary.
