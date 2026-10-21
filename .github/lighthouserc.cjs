// Lighthouse CI turns a budgets file into assertions that pass when the best run
// passes. These are the same budgets as assertions on the median of the runs.
const budgets = require("./budget.json");

const assertMatrix = budgets.map(
  ({ path, timings = [], resourceSizes = [], resourceCounts = [] }) => {
    if (path !== "/*")
      throw new Error(`budget.json path ${path}: only /* is supported`);
    const assertions = {};
    for (const { metric, budget } of timings) {
      assertions[metric] = ["error", { maxNumericValue: budget }];
    }
    for (const { resourceType, budget } of resourceCounts) {
      assertions[`resource-summary:${resourceType}:count`] = [
        "error",
        { maxNumericValue: budget },
      ];
    }
    for (const { resourceType, budget } of resourceSizes) {
      assertions[`resource-summary:${resourceType}:size`] = [
        "error",
        { maxNumericValue: budget * 1024 },
      ];
    }
    return {
      matchingUrlPattern: ".*",
      aggregationMethod: "median",
      assertions,
    };
  },
);

module.exports = { ci: { assert: { assertMatrix } } };
