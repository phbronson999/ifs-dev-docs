import { QuartzTransformerPlugin } from "../types"
import rehypePrettyCode, { Options as CodeOptions, Theme as CodeTheme } from "rehype-pretty-code"
import { getSingletonHighlighter } from "shiki"
import fs from "fs"
import path from "path"

interface Theme extends Record<string, CodeTheme> {
  light: CodeTheme
  dark: CodeTheme
}

interface Options {
  theme?: Theme
  keepBackground?: boolean
}

const defaultOptions: Options = {
  theme: {
    light: "github-light",
    dark: "github-dark",
  },
  keepBackground: false,
}

// Register the Marble/PLVC TextMate grammar (shared with the VS Code extension in
// ifs-marble-lang-server) as a custom Shiki language, so ```marble/```plvc/```ifs-marble
// code blocks get real syntax highlighting instead of falling back to plaintext.
const repoRoot = process.cwd()

function loadGrammar(fileName: string, langName: string, aliases: string[] = []) {
  const raw = JSON.parse(fs.readFileSync(path.join(repoRoot, fileName), "utf-8"))
  return { ...raw, name: langName, aliases }
}

const marbleLang = loadGrammar("marble-syntax.json", "marble", ["plvc", "ifs-marble"])
const plsqlLang = loadGrammar("plsql-syntax.json", "marble-plsql")

async function customGetHighlighter(options: any) {
  return getSingletonHighlighter({
    ...options,
    langs: [...(options.langs ?? []), marbleLang, plsqlLang],
  })
}

export const SyntaxHighlighting: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts: CodeOptions = { ...defaultOptions, ...userOpts, getHighlighter: customGetHighlighter }

  return {
    name: "SyntaxHighlighting",
    htmlPlugins() {
      return [[rehypePrettyCode, opts]]
    },
  }
}
