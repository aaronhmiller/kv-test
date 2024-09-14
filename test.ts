import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";

const app = new Application();
const router = new Router();

app.use(router.routes());
app.use(router.allowedMethods());
console.log("Starting server...");
await app.listen({ port: 8000 });

const kv = await Deno.openKv();
enum Rank {
  Bronze,
  Silver,
  Gold,
}

interface Player {
  username: string;
  rank: Rank;
}
const player1: Player = { username: "carlos", rank: Rank.Bronze };
const player2: Player = { username: "briana", rank: Rank.Silver };
const player3: Player = { username: "alice", rank: Rank.Bronze };
await kv.set(["players", player1.username], player1);
await kv.set(["players", player2.username], player2);
await kv.set(["players", player3.username], player3);
player3.rank = Rank.Gold;
await kv.set(["players", player3.username], player3);
const record = await kv.get(["players", "alice"]);
const alice: Player = record.value as Player;
console.log(record.key, record.versionstamp, alice);
const [record1, record2] = await kv.getMany([
  ["players", "carlos"],
  ["players", "briana"],
]);
console.log(record1, record2);
const records = kv.list({ prefix: ["players"] });
const players = [];
for await (const res of records) {
  players.push(res.value as Player);
}
console.log(players);
await kv.delete(["players", "carlos"]);
const aliceScoreKey = ["scores", "alice"];
await kv.set(aliceScoreKey, new Deno.KvU64(0n));
await kv.atomic()
  .mutate({
    type: "sum",
    key: aliceScoreKey,
    value: new Deno.KvU64(10n),
  })
  .commit();
const newScore = (await kv.get(aliceScoreKey)).value;
console.log("Alice's new score is: ", newScore);
