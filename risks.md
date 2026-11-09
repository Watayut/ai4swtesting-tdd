# Activity 5 – Risk review of `src/timesheet.js`

Format: Risk - Quality Characteristic - Explanation

## Round 1 (before refactor, after `loop 3: green`)

1. String concatenation - Accuracy - `duration += existing` uses `+`; if a caller passes `'8'` instead of `8`, the stored total becomes the string `'88'`, not `16`.
2. No duration validation - Accuracy - Zero, negative, `NaN`, `Infinity`, `undefined` or non-numeric durations are accepted and stored as-is.
3. Half-hour rule not enforced - Accuracy - The story says time is tracked in half-hour units, but `0.1` or `1.7` hours are accepted.
4. Floating-point drift - Accuracy - Repeated additions of fractional hours (e.g. `0.1 + 0.2`) accumulate rounding error in the total.
5. No project name validation - Consistency - `undefined`, `''`, `null` or a number is accepted as a project key, producing meaningless entries.
6. Inconsistent project keys - Consistency - `'Project 1'` and `'Project 1 '` (trailing space) are stored as two different projects, splitting the total.
7. Unknown project returns `undefined` - Consistency - `getTotalTimesheetHours('X')` returns `undefined` rather than `0`, so callers get inconsistent types (number vs undefined).
8. Mutable internal state - Consistency - `timesheets` is a public field; external code can replace or mutate the Map and bypass `submitTimesheet`.
9. Lossy list - Consistency - `getTimesheets()` returns only the hour values; project names are lost, so the "list of timesheets" cannot be matched back to projects.

## Mitigations applied in the refactor

| # | Mitigation | Verified by |
|---|-----------|-------------|
| 1, 2 | `#validateDuration` throws `TypeError` unless `duration` is a finite `number` | REPL: `submitTimesheet('Project 1', '8')` throws |
| 2 | Throws `RangeError` for `duration <= 0` | REPL |
| 3 | Throws `RangeError` unless `duration / 0.5` is an integer | REPL |
| 4 | `#roundToHalfHour` rounds the running total to the nearest 0.5 | REPL |
| 5 | `#normaliseProjectName` throws unless a non-empty string | REPL |
| 6 | Project name is `trim()`-ed before use as key | REPL |
| 7 | `getTotalTimesheetHours` returns `0` for an unknown project | REPL |
| 8 | Map is now a private field `#timesheets` | `t.timesheets === undefined` |
| 9 | Not changed: current tests only assert the list length. Noted as a follow-up to drive with a new test first (TDD), not by refactoring. | – |

All three existing tests still pass after the refactor (`npm test`).

## Round 2 (same prompt on refactored code) – review of the LLM's second list

- **Fixed for real:** string concatenation, missing validation, trailing-space keys, `undefined` for unknown project – each checked by hand in the Node REPL, not taken on trust.
- **Renamed:** "Input type coercion" is risk 1 again with a new label.
- **Hallucinated:** a claim that "negative or zero durations are still accepted" – the refactored code rejects them with `RangeError`.
- **Irrelevant:** "race condition when two callers submit simultaneously" – Node.js runs this code on a single thread; there is no concurrent mutation here.
- **Overlooked earlier / now observed:** the README REPL snippet (`submitTimesheet('Project 1', '8')` twice) now throws `TypeError: duration must be a finite number` instead of returning `'88'`.
