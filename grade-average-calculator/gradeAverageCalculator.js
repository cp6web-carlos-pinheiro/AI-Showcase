/**
 * Grade Average Calculator
 *
 * Run:
 *   node gradeAverageCalculator.js
 */

/**
 * Calculates the arithmetic mean of a list of grades.
 *
 * @param {number[]} grades
 * @returns {number}
 */
function calculateAverage(grades) {
  if (!Array.isArray(grades) || grades.length === 0) {
    return 0;
  }

  const sum = grades.reduce((total, grade) => total + grade, 0);
  return sum / grades.length;
}

/**
 * Classifies the average.
 *
 * @param {number} avg
 * @returns {string}
 */
function classifyAverage(avg) {
  if (avg < 0 || avg > 10) {
    return "Invalid";
  }

  if (avg >= 0 && avg <= 4) {
    return "Bad";
  }

  if (avg >= 5 && avg <= 7) {
    return "Good";
  }

  if (avg >= 8 && avg <= 10) {
    return "Great";
  }

  // Handles averages between 4 and 5 or between 7 and 8
  // that are not covered by the specification.
  return "Invalid";
}

/**
 * Displays the result for a list of grades.
 *
 * @param {number[]} grades
 */
function runTest(grades) {
  const average = calculateAverage(grades);
  const classification = classifyAverage(average);

  console.log("--------------------------------");
  console.log("Grades:", grades);
  console.log("Average:", average.toFixed(1));
  console.log("Classification:", classification);
}

// Main
const grades = [2, 5, 8, 9, 7, 6, 9, 8, 4, 6];

console.log("Grade Average Calculator");
runTest(grades);

// Additional test cases
console.log("\nAdditional Tests");

runTest([0, 0, 0, 0]);
runTest([10, 10, 10, 10]);
runTest([5, 6, 7]);
runTest([]);
runTest([2, 3]);
runTest([8, 9]);