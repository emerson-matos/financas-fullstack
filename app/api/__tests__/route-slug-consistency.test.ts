import { describe, it, expect } from "vitest";
import { readdirSync, statSync } from "fs";
import { join } from "path";

/**
 * Next.js App Router requires that all dynamic route segments at the same
 * directory level use the same slug name. Mixing [id] and [token] as siblings
 * causes a build error:
 *   "You cannot use different slug names for the same dynamic path"
 *
 * This test walks the entire `app/` directory and asserts that no parent
 * directory contains two or more dynamic segment children with different names.
 */

const APP_DIR = join(process.cwd(), "app");
const DYNAMIC_SEGMENT = /^\[(.+)\]$/; // matches [id], [token], [[...id]], etc

function getSlugName(dirName: string): string | null {
  // Strip optional catch-all brackets: [[...id]] -> id, [...id] -> id, [id] -> id
  const match = dirName.match(/^\[+\.{0,3}([^\]]+)\]+$/);
  return match ? match[1] : null;
}

function collectConflicts(
  dir: string,
  conflicts: { path: string; slugs: string[] }[],
) {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }

  const dynamicChildren = entries.filter(
    (e) =>
      DYNAMIC_SEGMENT.test(e) &&
      statSync(join(dir, e)).isDirectory(),
  );

  const slugNames = [
    ...new Set(dynamicChildren.map(getSlugName).filter(Boolean)),
  ] as string[];

  if (slugNames.length > 1) {
    conflicts.push({
      path: dir.replace(process.cwd() + "/", ""),
      slugs: slugNames,
    });
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory() && entry !== "node_modules") {
      collectConflicts(fullPath, conflicts);
    }
  }
}

describe("Next.js dynamic route slug consistency", () => {
  it("has no sibling dynamic segments with different slug names", () => {
    const conflicts: { path: string; slugs: string[] }[] = [];
    collectConflicts(APP_DIR, conflicts);

    if (conflicts.length > 0) {
      const details = conflicts
        .map((c) => `  ${c.path}: [${c.slugs.join(", ")}]`)
        .join("\n");
      throw new Error(
        `Found dynamic route slug conflicts (Next.js will fail to build):\n${details}`,
      );
    }

    expect(conflicts).toHaveLength(0);
  });
});
