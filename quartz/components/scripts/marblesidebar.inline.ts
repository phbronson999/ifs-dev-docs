document.addEventListener("nav", () => {
  const btn = document.getElementById("marble-menu-btn")
  const sidebar = document.getElementById("marble-sidebar")
  if (!btn || !sidebar) return

  function toggle() {
    sidebar?.classList.toggle("open")
  }

  btn.addEventListener("click", toggle)
  window.addCleanup(() => btn.removeEventListener("click", toggle))
})

// Breadcrumbs use position:fixed so they stay visible for the entire scroll
// (position:sticky only sticks within .page-header's own short box, which
// scrolls out of view quickly on long pages). Since fixed positioning drops
// out of the grid layout, measure .center's actual rendered bounds and match
// them, keeping it correctly aligned between the two sidebars at any width.
document.addEventListener("nav", () => {
  const center = document.querySelector(".center") as HTMLElement | null
  const crumbs = document.querySelector(".breadcrumb-container") as HTMLElement | null
  if (!center || !crumbs) return

  function reposition() {
    if (!center || !crumbs) return
    const rect = center.getBoundingClientRect()
    crumbs.style.left = `${rect.left}px`
    crumbs.style.width = `${rect.width}px`
  }

  reposition()
  window.addEventListener("resize", reposition)
  window.addCleanup(() => window.removeEventListener("resize", reposition))
})
