#!/usr/bin/env node
// One-off/reusable utility: adds `publish: true` to every vault note under
// sync.config.json's included folders that doesn't already have a `publish`
// field. Run this after adding a new folder to `include` so its existing
// notes keep publishing under the opt-in model sync-content.mjs enforces.
// Edits the VAULT directly (the source of truth), not content/.
import { promises as fs } from "node:fs"
import path from "node:path"
import matter from "gray-matter"

const repoRoot = process.cwd()

async function loadConfig() {
  const raw = await fs.readFile(path.join(repoRoot, "sync.config.json"), "utf8")
  return JSON.parse(raw)
}

async function walkMarkdown(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walkMarkdown(full)))
    } else if (entry.name.endsWith(".md")) {
      files.push(full)
    }
  }
  return files
}

// Reinsert `publish` right after `title` (or first) so frontmatter stays readable
// instead of gray-matter tacking it onto the end of the key order.
function withPublishTrue(data) {
  const ordered = {}
  if ("title" in data) ordered.title = data.title
  ordered.publish = true
  for (const [key, value] of Object.entries(data)) {
    if (key === "title" || key === "publish") continue
    ordered[key] = value
  }
  return ordered
}

async function main() {
  const config = await loadConfig()
  const vaultPath = path.resolve(repoRoot, config.vaultPath)

  const touched = []
  const alreadySet = []

  for (const folderName of config.include) {
    const dir = path.join(vaultPath, folderName)
    let files
    try {
      files = await walkMarkdown(dir)
    } catch {
      console.warn(`  ! Skipping "${folderName}" — not found at ${dir}`)
      continue
    }

    for (const file of files) {
      const raw = await fs.readFile(file, "utf8")
      const parsed = matter(raw)

      if (parsed.data.publish === true) {
        alreadySet.push(path.relative(vaultPath, file))
        continue
      }

      const newData = withPublishTrue(parsed.data)
      const rebuilt = matter.stringify(parsed.content, newData)
      await fs.writeFile(file, rebuilt, "utf8")
      touched.push(path.relative(vaultPath, file))
    }
  }

  console.log(`Added publish: true to ${touched.length} note(s):`)
  for (const f of touched) console.log(`  ${f}`)
  console.log(`\nAlready had publish: true — left alone: ${alreadySet.length}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
