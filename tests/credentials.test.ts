import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, renameSync } from "node:fs";
import { normalizeApiKey, keySituation, credentialsPath, piTinySearchDir } from "../src/credentials.js";

describe("credentials", () => {
  it("normalizeApiKey accepts valid keys", () => {
    const key = "monid_live_abcdefghijklmnop";
    assert.equal(normalizeApiKey(key), key);
  });

  it("normalizeApiKey trims whitespace", () => {
    const key = "  monid_live_abcdefghijklmnop  ";
    assert.equal(normalizeApiKey(key), "monid_live_abcdefghijklmnop");
  });

  it("normalizeApiKey rejects short keys", () => {
    assert.throws(() => normalizeApiKey("short"), /does not look like/);
  });

  it("normalizeApiKey rejects keys with spaces", () => {
    assert.throws(() => normalizeApiKey("monid live_abcdefghijklmnop"), /does not look like/);
  });

  it("piTinySearchDir returns a path", () => {
    const dir = piTinySearchDir();
    assert.ok(dir.includes("pi-tiny-search"));
  });

  it("credentialsPath returns auth.json inside piTinySearchDir", () => {
    const path = credentialsPath();
    assert.ok(path.endsWith("auth.json"));
    assert.ok(path.includes("pi-tiny-search"));
  });

  it("keySituation returns missing when no key is set", () => {
    const saved = process.env.TINYSEARCH_API_KEY;
    delete process.env.TINYSEARCH_API_KEY;
    // Temporarily move auth.json aside so stored key doesn't interfere
    const credPath = credentialsPath();
    const backup = credPath + ".test-backup";
    const hadFile = existsSync(credPath);
    if (hadFile) renameSync(credPath, backup);
    try {
      const situation = keySituation();
      assert.equal(situation.kind, "missing");
    } finally {
      if (hadFile) renameSync(backup, credPath);
      if (saved !== undefined) process.env.TINYSEARCH_API_KEY = saved;
    }
  });

  it("keySituation returns environment when env var is set", () => {
    const saved = process.env.TINYSEARCH_API_KEY;
    process.env.TINYSEARCH_API_KEY = "monid_live_testkey";
    const situation = keySituation();
    assert.equal(situation.kind, "environment");
    if (saved !== undefined) process.env.TINYSEARCH_API_KEY = saved;
    else delete process.env.TINYSEARCH_API_KEY;
  });
});
