# Plan: Grade Average Calculator

## 1. Objective
Build a simple program that:
- Takes a list of grades (each between 0 and 10).
- Calculates the arithmetic mean.
- Classifies the mean into one of three categories:
  - **Bad** (0 – 4)
  - **Good** (5 – 7)
  - **Great** (8 – 10)

## 2. Input
- A static list of grades: `[2, 5, 8, 9, 7, 6, 9, 8, 4, 6]`
- (Future enhancement: allow dynamic input from the user or a file.)

## 3. Output
- The computed average (as a float).
- The corresponding classification string.

## 4. Functions (Specifications)

### `calculateAverage(grades)`
- **Purpose:** Compute the arithmetic mean of a list of numbers.
- **Parameter:** `grades` – a list of integers/floats.
- **Return:** `float` – the average.
- **Edge case:** If the list is empty, return `0` (or raise an error, but we'll return 0 for simplicity).
- **Formula:** `sum(grades) / len(grades)`

### `classifyAverage(avg)`
- **Purpose:** Map a numeric average to a qualitative label.
- **Parameter:** `avg` – a float (expected 0–10).
- **Return:** `string` – one of `"Bad"`, `"Good"`, `"Great"`.
- **Rules:**
  - `0 <= avg <= 4` → `"Bad"`
  - `5 <= avg <= 7` → `"Good"`
  - `8 <= avg <= 10` → `"Great"`
- **Edge case:** If `avg` is outside 0–10, return `"Invalid"` (safety check).

## 5. Program Flow (Main Routine)

1. **Define** the grades list.
2. **Call** `calculateAverage` with the list → store result.
3. **Call** `classifyAverage` with the average → store result.
4. **Print** both values clearly to the user.

## 6. Test Plan

| Test Case | Input (grades)                    | Expected Avg | Expected Classification |
|-----------|-----------------------------------|--------------|--------------------------|
| 1         | `[2, 5, 8, 9, 7, 6, 9, 8, 4, 6]` | 6.4          | "Good"                   |
| 2         | `[0, 0, 0, 0]`                    | 0.0          | "Bad"                    |
| 3         | `[10, 10, 10, 10]`                | 10.0         | "Great"                  |
| 4         | `[5, 6, 7]`                       | 6.0          | "Good"                   |
| 5         | `[]`                              | 0.0          | "Invalid" (avg 0 → Bad?) |
| 6         | `[2, 3]`                          | 2.5          | "Bad"                    |
| 7         | `[8, 9]`                          | 8.5          | "Great"                  |

*(Note: For edge case #5, we might want to handle empty lists separately, but our function returns 0, which falls into "Bad". This is acceptable for the scope of the exercise.)*

## 7. Implementation Steps (in order)

1. **Write** the `calculateAverage` function.
2. **Write** the `classifyAverage` function.
3. **Write** the main script that uses the provided list.
4. **Run** the program and verify output against the expected result (6.4 → "Good").
5. **Test** with other hardcoded lists to ensure logic works correctly.
6. (Optional) Add input validation to ensure grades are within 0–10.

## 8. Success Criteria
- The average is computed correctly with decimal precision.
- The classification matches the rules exactly.
- The code is readable, well-named, and follows simple modular design.

## 9. Future Improvements
- Allow the user to enter grades interactively.
- Support for weighted averages.
- Handle invalid inputs (non‑numeric, out‑of‑range values) gracefully.
- Provide a graphical or web interface.