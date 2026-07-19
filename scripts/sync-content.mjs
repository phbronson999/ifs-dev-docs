#!/usr/bin/env node
// Mirrors the sections listed in sync.config.json from the IFS-Tech-Docs vault
// into content/. Local, on-demand only — never commits or pushes.
import { promises as fs } from "node:fs"
import path from "node:path"
import matter from "gray-matter"

const repoRoot = process.cwd()
const configPath = path.join(repoRoot, "sync.config.json")

// Obsidian/OneDrive leave sync-conflict duplicates behind as
// "<name>.<hexhash>" with no real extension (e.g. "Thinking in Marble.ea829027b878").
// Only recognized content extensions are synced — everything else is ignored.
const ALLOWED_EXTENSIONS = new Set([
  ".md",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".webp",
  ".pdf",
])

async function loadConfig() {
  const raw = await fs.readFile(configPath, "utf8")
  return JSON.parse(raw)
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(full)))
    } else {
      files.push(full)
    }
  }
  return files
}

// Opt-in: a markdown note only syncs if its frontmatter has `publish: true`.
// Non-markdown assets (images, etc.) have no frontmatter to opt in with, so
// they always sync — they're only ever referenced by an already-published note.
function isPublishable(filePath, content) {
  if (!filePath.endsWith(".md")) return true
  const { data } = matter(content)
  return data.publish === true
}

async function syncFolder(vaultPath, contentPath, folderName, summary) {
  const srcDir = path.join(vaultPath, folderName)
  const destDir = path.join(contentPath, folderName)

  try {
    const srcStat = await fs.stat(srcDir)
    if (!srcStat.isDirectory()) throw new Error("not a directory")
  } catch {
    console.warn(`  ! Skipping "${folderName}" — not found in vault at ${srcDir}`)
    return
  }

  const srcFiles = await walk(srcDir)
  const keptRelPaths = new Set()

  for (const srcFile of srcFiles) {
    if (!ALLOWED_EXTENSIONS.has(path.extname(srcFile).toLowerCase())) {
      continue // e.g. OneDrive/Obsidian sync-conflict duplicates — never synced, never counted
    }

    const relPath = path.relative(srcDir, srcFile)
    const content = await fs.readFile(srcFile)

    if (!isPublishable(srcFile, content.toString("utf8"))) {
      summary.skipped.push(path.join(folderName, relPath))
      continue
    }

    keptRelPaths.add(relPath)
    const destFile = path.join(destDir, relPath)

    let isNew = true
    try {
      const existing = await fs.readFile(destFile)
      isNew = false
      if (Buffer.compare(existing, content) === 0) continue // unchanged
    } catch {
      // destFile doesn't exist yet
    }

    await fs.mkdir(path.dirname(destFile), { recursive: true })
    await fs.writeFile(destFile, content)
    summary[isNew ? "added" : "updated"].push(path.join(folderName, relPath))
  }

  let destFiles = []
  try {
    destFiles = await walk(destDir)
  } catch {
    destFiles = []
  }
  for (const destFile of destFiles) {
    const relPath = path.relative(destDir, destFile)
    if (!keptRelPaths.has(relPath)) {
      await fs.rm(destFile)
      summary.removed.push(path.join(folderName, relPath))
    }
  }
}

async function main() {
  const config = await loadConfig()
  const vaultPath = path.resolve(repoRoot, config.vaultPath)
  const contentPath = path.join(repoRoot, "content")

  const summary = { added: [], updated: [], removed: [], skipped: [] }

  for (const folderName of config.include) {
    console.log(`Syncing "${folderName}"...`)
    await syncFolder(vaultPath, contentPath, folderName, summary)
  }

  console.log("\n--- Sync summary ---")
  console.log(`Added:   ${summary.added.length}`)
  console.log(`Updated: ${summary.updated.length}`)
  console.log(`Removed: ${summary.removed.length}`)
  console.log(`Skipped (missing publish: true): ${summary.skipped.length}`)

  for (const [label, list] of Object.entries(summary)) {
    if (list.length === 0) continue
    console.log(`\n${label}:`)
    for (const f of list) console.log(`  ${f}`)
  }

  console.log(
    "\nNothing was committed. Review with `git status` / `git diff`, then commit and push when ready to publish."
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
