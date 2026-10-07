import "dotenv/config";
import assert from "node:assert/strict";
import { readFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "../lib/prisma";
const require = createRequire(process.cwd() + "/package.json");
const {
  chromium,
} = require("C:/Users/ASUS/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
async function main() {
  assert.equal(
    new URL(process.env.DATABASE_URL!).hostname,
    new URL((await readFile(".local/erp-test-url.txt", "utf8")).trim())
      .hostname,
  );
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const token = randomBytes(32).toString("base64url");
  const user = await prisma.user.findFirstOrThrow({
    where: { role: "SUPER_ADMIN", email: { contains: "erp-" } },
  });
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: createHash("sha256").update(token).digest("hex"),
      expiresAt: new Date(Date.now() + 3600000),
    },
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    await context.addCookies([
      { name: "dihliz_session", value: token, url: "http://localhost:3110" },
    ]);
    const page = await context.newPage();
    page.setDefaultTimeout(30000);
    const errors: string[] = [];
    page.on("pageerror", (e: Error) => errors.push(e.message));
    const exam = await prisma.exam.findFirstOrThrow({
      where: { title: { startsWith: "erp-" }, status: "DRAFT" },
      orderBy: { createdAt: "desc" },
      include: { cohort: true },
    });
    const base = "http://localhost:3110/dashboard";
    await page.goto(base + "/exams/" + exam.id + "?tab=marks");
    const marks = page.locator('input[name^="mark:"]');
    const first = marks.first();
    await first.waitFor();
    const original = await first.inputValue();
    await first.fill("999999");
    assert.equal(
      await first.evaluate((e: HTMLInputElement) => e.checkValidity()),
      false,
    );
    await first.fill("1e2");
    assert.equal(
      await first.evaluate((e: HTMLInputElement) => e.checkValidity()),
      false,
    );
    await first.fill("0");
    assert.equal(
      await first.evaluate((e: HTMLInputElement) => e.checkValidity()),
      true,
    );
    await first.press("Enter");
    const target = await page.locator(":focus").getAttribute("name");
    assert.ok(target?.startsWith("mark:"));
    assert.notEqual(target, await first.getAttribute("name"));
    await first.fill(original);
    await page
      .getByLabel("Student search", { exact: true })
      .fill("no-matching-student");
    assert.equal(await page.locator("tbody tr:visible").count(), 0);
    assert.ok(page.url().includes("student=no-matching-student"));
    await page.getByLabel("Student search", { exact: true }).fill("");
    const subject = await first
      .getAttribute("name")
      .then((n: string) => n.split(":").at(-1));
    await page
      .getByLabel("Visible subject", { exact: true })
      .selectOption(subject);
    assert.ok((await page.locator("[data-exam-subject]:visible").count()) > 0);
    await page.screenshot({
      path: ".local/erp-preview/mark-entry.png",
      fullPage: true,
    });
    await page.goto(base + "/exams/" + exam.id);
    await page
      .getByRole("button", { name: "Edit exam schedule", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByLabel("Mark entry due date", { exact: true })
      .fill("2026-09-19");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Save schedule", exact: true })
      .click();
    await page
      .getByRole("alert")
      .filter({ hasText: "Use exam date" })
      .waitFor();
    assert.equal(
      (await prisma.exam.findUniqueOrThrow({ where: { id: exam.id } }))
        .revision,
      exam.revision,
    );
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: "Discard changes", exact: true })
      .click();
    await page.goto(base + "/exams");
    await page
      .getByRole("button", { name: "Create examination", exact: true })
      .click();
    for (const [width, height] of [
      [1440, 900],
      [768, 700],
      [390, 640],
    ]) {
      await page.setViewportSize({ width, height });
      const dialog = page.getByRole("dialog");
      const box = await dialog.boundingBox();
      assert.ok(
        box.x >= 0 &&
          box.y >= 0 &&
          box.x + box.width <= width &&
          box.y + box.height <= height,
      );
      assert.ok(
        await dialog.evaluate(
          (el: HTMLElement) => el.scrollWidth <= el.clientWidth + 1,
        ),
      );
      await page.screenshot({
        path: ".local/erp-preview/exam-dialog-" + width + ".png",
      });
    }
    await page.keyboard.press("Escape");
    await page.setViewportSize({ width: 1440, height: 1000 });
    const attendance = await prisma.attendanceRegister.findFirstOrThrow({where:{date:new Date("2026-09-08"),entries:{some:{status:"OFF"}}}});
    await page.goto(
      base +
        "/attendance/entry?cohort=" +
        attendance.cohortId +
        "&mode=weekly&date=2026-09-09",
    );
    const grid = page.locator("table").locator("..");
    const height = await grid.evaluate((e: HTMLElement) => e.clientHeight);
    assert.ok(
      height <= 650,
      "Attendance grid must stay within 65 percent of viewport, got " + height,
    );
    const off = page
      .getByRole("checkbox")
      .filter({ has: page.locator(":scope") });
    const black = await page
      .locator('[role="checkbox"][aria-checked="true"]')
      .all();
    assert.ok(black.length > 0);
    await page.screenshot({
      path: ".local/erp-preview/weekly-attendance.png",
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    console.log(
      "PASS mark validation, keyboard navigation, search and subject filters, schedule ordering, responsive dialogs and bounded attendance grid",
    );
  } finally {
    await browser.close();
    await prisma.session.delete({ where: { id: session.id } });
    await prisma.$disconnect();
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
