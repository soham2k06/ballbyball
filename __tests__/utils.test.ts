import { add, cn } from "../lib/utils";

test("Basic js sum function", () => {
  expect(add(1, 4)).toBe(5);
});

test("cn utility function", () => {
  expect(cn("text-primary text-white")).toBe("text-white");
  expect(cn({ "py-4": true, "py-8": false })).toBe("py-4");
});
