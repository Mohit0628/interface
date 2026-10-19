import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { DOCS_URL, REPO_URL, SITE_NAME, SITE_URL, SOCIAL_URLS } from "./site-identity"

describe("canonical product identity (#846)", () => {
  it("uses the documented SO4 website, repository, and community channels", () => {
    expect(SITE_NAME).toBe("SO4 Market")
    expect(SITE_URL).toBe("https://so4.market")
    expect(REPO_URL).toBe("https://github.com/SO4-Markets/interface")
    expect(DOCS_URL).toBe("https://docs.so4.market")
    expect(SOCIAL_URLS).toMatchObject({
      github: REPO_URL,
      x: "https://twitter.com/so4market",
      discord: "https://discord.gg/so4market",
      telegram: "https://t.me/so4market",
    })
  })

  it("does not keep the competing domain or repository links in runtime sources", () => {
    const files = [
      "../../routes/__root.tsx",
      "../../ui/landing/roadmap-section.tsx",
      "../../ui/landing/social-section.tsx",
      "../../features/changelog/components/ChangelogEntry.tsx",
      "../../features/gallery/components/gallery-page.tsx",
      "../../../public/og-image.svg",
      "../../../public/manifest.json",
    ]

    for (const path of files) {
      const source = readFileSync(new URL(path, import.meta.url), "utf8")
      expect(source, path).not.toMatch(/Levee-HQ|levee\.market/)
    }
  })
})
