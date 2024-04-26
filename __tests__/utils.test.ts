import { add } from "../lib/utils";

test("Test functions that import server-only", () => {
  expect(add(1, 4)).toBe(5);
});
