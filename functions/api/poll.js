const OPTIONS = [
  "pokeland-legends",
  "pokeland-world",
  "origin-reborn",
  "legends-revolution",
  "pokeverse"
];

async function ensurePollTable(db) {
  // Avoid schema writes and seed inserts on every results refresh.
  const table = await db.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?"
  ).bind("game_poll_votes").first();
  if (table) return;

  await db.prepare(
    "CREATE TABLE IF NOT EXISTS game_poll_votes (option_id TEXT PRIMARY KEY, votes INTEGER NOT NULL DEFAULT 0)"
  ).run();
  const statements = OPTIONS.map(option => db.prepare(
    "INSERT OR IGNORE INTO game_poll_votes (option_id, votes) VALUES (?, 0)"
  ).bind(option));
  await db.batch(statements);
}

async function getResults(db) {
  const result = await db.prepare(
    "SELECT option_id, votes FROM game_poll_votes"
  ).all();
  const counts = {};
  let total = 0;
  for (const option of OPTIONS) counts[option] = 0;
  for (const row of result.results || []) {
    if (Object.prototype.hasOwnProperty.call(counts, row.option_id)) {
      counts[row.option_id] = Number(row.votes) || 0;
      total += counts[row.option_id];
    }
  }
  return { counts, total };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: "Poll database binding DB is missing." }, 503);
  if (request.method !== "GET" && request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  try {
    await ensurePollTable(env.DB);
    if (request.method === "POST") {
      let body;
      try { body = await request.json(); } catch (error) { return json({ error: "Invalid request." }, 400); }
      const options = body && body.options;
      if (!Array.isArray(options) || options.length < 1 || options.length > 2 ||
          new Set(options).size !== options.length || options.some(option => !OPTIONS.includes(option))) {
        return json({ error: "Select one or two valid games." }, 400);
      }
      await env.DB.batch(options.map(option => env.DB.prepare(
        "UPDATE game_poll_votes SET votes = votes + 1 WHERE option_id = ?"
      ).bind(option)));
    }
    return json(await getResults(env.DB));
  } catch (error) {
    return json({ error: "The poll could not be loaded right now." }, 500);
  }
}
