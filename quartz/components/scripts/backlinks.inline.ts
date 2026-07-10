function toggleBacklinks(this: HTMLElement) {
  this.classList.toggle("collapsed")
  this.setAttribute(
    "aria-expanded",
    this.getAttribute("aria-expanded") === "true" ? "false" : "true",
  )
  const content = this.nextElementSibling as HTMLElement | undefined
  if (!content) return
  content.classList.toggle("collapsed")
}

function setupBacklinks() {
  for (const backlinks of document.getElementsByClassName("backlinks")) {
    const button = backlinks.querySelector(".backlinks-header")
    const content = backlinks.querySelector("ul")
    if (!button || !content) continue
    button.addEventListener("click", toggleBacklinks)
    window.addCleanup(() => button.removeEventListener("click", toggleBacklinks))
  }
}

document.addEventListener("nav", setupBacklinks)
