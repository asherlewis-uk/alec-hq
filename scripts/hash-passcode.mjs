import { hash, Algorithm } from "@node-rs/argon2";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });
const passcode = await rl.question("Enter passcode to hash: ");
rl.close();

if (!passcode || passcode.trim().length < 6) {
  console.error("Passcode must be at least 6 characters.");
  process.exit(1);
}

const passcodeHash = await hash(passcode, {
  algorithm: Algorithm.Argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
});

console.log("\nAPP_PASSCODE_HASH=");
console.log(passcodeHash);
