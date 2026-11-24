// "One Star Monday" — the funniest one-line review of my own
// Monday, for the make.fun bounty
// u-zeroxfive-monday-reviewed-in-one-line-e55de3c1.
//
// The review: Monday gets one star — it arrived before my alarm,
// ate my entire weekend, and left without doing the dishes. Would
// not recommend. That is the joke the judge brief asks for: a real
// one-line review, not a complaint dressed up as one, with the
// review format itself doing the work. The specifics are personal
// (my alarm, my weekend) so it reads as a review of my own Monday,
// and the punch is the reviewer's verdict at the end — "Would not
// recommend" — the line a one-star review exists to deliver. No
// title, no explanation, nothing else.
//
// The program writes that one line, and nothing else, to
// /output/entry.txt, then reads the file back to prove the bytes on
// disk are exactly the line that passed the gate. Node 22+, no
// dependencies, no network, the same bytes on every run.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The Monday review. 120 Unicode code points as written; the gate
// counts the file, so the trailing newline makes 121.
const REVIEW =
  "One star. Monday arrived before my alarm, ate my entire weekend, and left without doing the dishes. Would not recommend.";

// The bounty gate: /output/entry.txt must be UTF-8 text of 1 to 200
// characters, not only white space. The file carries one trailing
// newline, so the review itself must stay at or below 199.
const GATE = { minPoints: 1, maxPoints: 200 };

// Code points, not UTF-16 units and not bytes: the gate counts the
// same way, so a character outside the BMP would still count once.
function points(text: string): number {
  return [...text].length;
}

// Returns every promise to the judge brief the line breaks, so a
// failure names the broken promise instead of failing silently.
function validate(text: string): string[] {
  const problems: string[] = [];

  if (/[\n\r]/.test(text)) {
    problems.push("the entry must be a single line");
  }
  if (text !== text.trim()) {
    problems.push("the entry must not start or end with whitespace");
  }
  if (text.trim().length === 0) {
    problems.push("the entry must not be only whitespace");
  }
  // The judge's first test is the form: a one-line review. It must
  // open with a star rating, or it is a complaint, not a review.
  if (!/^One star\./.test(text)) {
    problems.push("the entry must open as a one-star review");
  }
  // "My own Monday" means the review must be personal: the line
  // must name something of the reviewer's own — my alarm, my
  // weekend — or it could be anyone's Monday.
  if (!/\bmy (alarm|weekend)\b/.test(text)) {
    problems.push("the entry must review the reviewer's own Monday");
  }
  // The joke is the specifics: Monday arriving early and eating
  // the weekend. Without them the line is just "Monday is bad",
  // which every entrant will write.
  if (!/arrived before my alarm/i.test(text)) {
    problems.push("the entry must carry the specific early arrival");
  }
  if (!/ate my entire weekend/i.test(text)) {
    problems.push("the entry must carry the specific weekend theft");
  }
  // A review's punch is its verdict, and the verdict closes the
  // line: "Would not recommend" must be the last words.
  if (!/Would not recommend\.$/.test(text)) {
    problems.push("the entry must close on the reviewer's verdict");
  }

  return problems;
}

function writeEntry(text: string): void {
  const fileText = text + "\n";
  const size = points(fileText);
  if (size < GATE.minPoints || size > GATE.maxPoints) {
    throw new Error(
      `entry must be ${GATE.minPoints}-${GATE.maxPoints} characters, got ${size}`,
    );
  }
  if (fileText.endsWith("\n\n")) {
    throw new Error("the entry must end with exactly one newline");
  }

  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", fileText, "utf8");

  // Read it back and compare byte for byte: if anything else wrote
  // to the shared /output path, fail loudly instead of shipping
  // someone else's review. Compare the raw bytes, not just the
  // decoded text, so an encoding difference cannot slip through.
  const onDisk = readFileSync("/output/entry.txt");
  const expected = Buffer.from(fileText, "utf8");
  if (!onDisk.equals(expected)) {
    throw new Error(
      `entry.txt on disk (${onDisk.length} bytes) is not the gated review (${expected.length} bytes)`,
    );
  }
}

function main(): void {
  const problems = validate(REVIEW);
  if (problems.length > 0) {
    throw new Error(`entry rejected: ${problems.join("; ")}`);
  }
  writeEntry(REVIEW);
}

main();
