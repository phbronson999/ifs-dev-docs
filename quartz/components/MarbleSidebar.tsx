import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { resolveRelative, FullSlug } from "../util/path"
import style from "./styles/marbleSidebar.scss"
// @ts-ignore
import script from "./scripts/marblesidebar.inline"

interface NavLink {
  label: string
  slug: string
}

interface NavGroup {
  icon: string
  label: string
  links: NavLink[]
}

interface NavSection {
  key: "learn" | "client" | "proj" | "base"
  label: string
  standalone?: { icon: string; label: string; slug: string }[]
  groups: NavGroup[]
}

const sections: NavSection[] = [
  {
    key: "learn",
    label: "Start Here",
    standalone: [
      { icon: "🧠", label: "Thinking in Marble", slug: "Marble-Language-Reference/Thinking-in-Marble" },
      { icon: "📖", label: "Glossary", slug: "Marble-Language-Reference/Glossary" },
    ],
    groups: [
      {
        icon: "📚",
        label: "Learn Path",
        links: [
          { label: "Build Your First Screen", slug: "Marble-Language-Reference/Learn/Build-Your-First-Screen" },
          { label: "Common Patterns", slug: "Marble-Language-Reference/Learn/Common-Patterns" },
        ],
      },
    ],
  },
  {
    key: "client",
    label: "Client Layer",
    standalone: [
      { icon: "📋", label: "Property Index", slug: "Marble-Language-Reference/Client/Property-Index" },
    ],
    groups: [
      {
        icon: "📂",
        label: "Overview",
        links: [
          { label: "Client File Structure", slug: "Marble-Language-Reference/Client/Overview/Client-File-Structure" },
          { label: "Fragment", slug: "Marble-Language-Reference/Client/Overview/Fragment" },
          { label: "Declaration Order Rules", slug: "Marble-Language-Reference/Client/Overview/Declaration-Order-Rules" },
        ],
      },
      {
        icon: "🖥",
        label: "Screens",
        links: [
          { label: "Pages", slug: "Marble-Language-Reference/Client/Screens/Pages" },
          { label: "Dialog", slug: "Marble-Language-Reference/Client/Screens/Dialog" },
          { label: "Assistant", slug: "Marble-Language-Reference/Client/Screens/Assistant" },
          { label: "Navigator", slug: "Marble-Language-Reference/Client/Screens/Navigator" },
        ],
      },
      {
        icon: "⬜",
        label: "Layout",
        links: [
          { label: "List", slug: "Marble-Language-Reference/Client/Layout/List" },
          { label: "Group", slug: "Marble-Language-Reference/Client/Layout/Group" },
          { label: "Layout Controls", slug: "Marble-Language-Reference/Client/Layout/Layout-Controls" },
          { label: "Card and Sheet", slug: "Marble-Language-Reference/Client/Layout/Card-and-Sheet" },
        ],
      },
      {
        icon: "🧩",
        label: "Controls",
        links: [
          { label: "Fields and LOV", slug: "Marble-Language-Reference/Client/Controls/Fields-and-LOV" },
          { label: "Advanced Controls", slug: "Marble-Language-Reference/Client/Controls/Advanced-Controls" },
          { label: "Display Controls", slug: "Marble-Language-Reference/Client/Controls/Display-Controls" },
          { label: "Input Controls", slug: "Marble-Language-Reference/Client/Controls/Input-Controls" },
          { label: "Charts", slug: "Marble-Language-Reference/Client/Controls/Charts" },
          { label: "Data Views", slug: "Marble-Language-Reference/Client/Controls/Data-Views" },
          { label: "Utility Controls", slug: "Marble-Language-Reference/Client/Controls/Utility-Controls" },
        ],
      },
      {
        icon: "💡",
        label: "Concepts",
        links: [
          { label: "Commands and Expressions", slug: "Marble-Language-Reference/Client/Concepts/Commands-and-Expressions" },
          { label: "Emphasis and Colors", slug: "Marble-Language-Reference/Client/Concepts/Emphasis-and-Colors" },
          { label: "Selector and Search Context", slug: "Marble-Language-Reference/Client/Concepts/Selector-and-Search-Context" },
        ],
      },
    ],
  },
  {
    key: "proj",
    label: "Projection Layer",
    groups: [
      {
        icon: "📄",
        label: "Overview",
        links: [
          { label: "Projection File Structure", slug: "Marble-Language-Reference/Projection/Overview/Projection-File-Structure" },
        ],
      },
      {
        icon: "🗄",
        label: "Entities",
        links: [
          { label: "Entity", slug: "Marble-Language-Reference/Projection/Entities/Entity" },
          { label: "Entityset", slug: "Marble-Language-Reference/Projection/Entities/Entityset" },
          { label: "Virtual", slug: "Marble-Language-Reference/Projection/Entities/Virtual" },
          { label: "Query", slug: "Marble-Language-Reference/Projection/Entities/Query" },
          { label: "Structure", slug: "Marble-Language-Reference/Projection/Entities/Structure" },
        ],
      },
      {
        icon: "🏷",
        label: "Attributes",
        links: [
          { label: "Enumeration", slug: "Marble-Language-Reference/Projection/Attributes/Enumeration" },
          { label: "References and Arrays", slug: "Marble-Language-Reference/Projection/Attributes/References-and-Arrays" },
          { label: "Attribute Modifiers", slug: "Marble-Language-Reference/Projection/Attributes/Attribute-Modifiers" },
        ],
      },
      {
        icon: "⚡",
        label: "Operations",
        links: [
          { label: "Action", slug: "Marble-Language-Reference/Projection/Operations/Action" },
          { label: "Function", slug: "Marble-Language-Reference/Projection/Operations/Function" },
        ],
      },
    ],
  },
  {
    key: "base",
    label: "Base Server",
    standalone: [{ icon: "📑", label: "README", slug: "Base-Server-Reference/README" }],
    groups: [
      {
        icon: "🔷",
        label: "Constructs",
        links: [
          { label: "Entity", slug: "Base-Server-Reference/Constructs/Entity-(Base-Server)" },
          { label: "Enumeration", slug: "Base-Server-Reference/Constructs/Enumeration-(Base-Server)" },
          { label: "Utility", slug: "Base-Server-Reference/Constructs/Utility-(Base-Server)" },
          { label: "Overview Diagram", slug: "Base-Server-Reference/Constructs/Overview-Diagram" },
        ],
      },
      {
        icon: "🔖",
        label: "Metadata",
        links: [
          { label: "Attribute Control Flags", slug: "Base-Server-Reference/Metadata/Attribute-Control-Flags" },
          { label: "PL/SQL Annotations", slug: "Base-Server-Reference/Metadata/PL-SQL-Annotations" },
          { label: "Declaration Order Rules", slug: "Base-Server-Reference/Metadata/Declaration-Order-Rules" },
        ],
      },
    ],
  },
]

const MarbleSidebar: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const currentSlug = fileData.slug ?? ""

  return (
    <div class={classNames(displayClass, "marble-sidebar")} id="marble-sidebar">
      <button
        type="button"
        id="marble-menu-btn"
        aria-label="Toggle navigation"
        aria-controls="marble-sidebar-nav"
      >
        ☰
      </button>
      <div class="marble-sidebar-brand">
        <div class="marble-sidebar-brand-name">IFS Cust Developer Docs</div>
        <div class="marble-sidebar-brand-sub">Marble &amp; PLVC Language Reference</div>
      </div>
      <div class="marble-sidebar-nav" id="marble-sidebar-nav">
        {sections.map((section) => (
          <div class={classNames(undefined, "marble-nav-section", section.key)}>
            <div class="marble-nav-section-label">{section.label}</div>
            {section.standalone?.map((link) => (
              <a
                class={classNames(
                  undefined,
                  "marble-nav-link-standalone",
                  ...(currentSlug === link.slug ? ["active"] : []),
                )}
                href={resolveRelative(fileData.slug!, link.slug as FullSlug)}
              >
                <span style="font-size:13px;">{link.icon}</span> {link.label}
              </a>
            ))}
            {section.groups.map((group) => {
              const isActive = group.links.some((l) => l.slug === currentSlug)
              return (
                <details class="marble-nav-group" open={isActive || group.label === "Learn Path"}>
                  <summary>
                    <span style="font-size:11px;">{group.icon}</span> {group.label}{" "}
                    <span class="marble-chevron">▶</span>
                  </summary>
                  <div class="marble-nav-sub">
                    {group.links.map((link) => (
                      <a
                        class={classNames(
                          undefined,
                          "marble-nav-link",
                          ...(link.slug === currentSlug ? ["active"] : []),
                        )}
                        href={resolveRelative(fileData.slug!, link.slug as FullSlug)}
                      >
                        <span class="marble-dot"></span>
                        {link.label}
                      </a>
                    ))}
                  </div>
                </details>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

MarbleSidebar.css = style
MarbleSidebar.afterDOMLoaded = script

export default (() => MarbleSidebar) satisfies QuartzComponentConstructor
