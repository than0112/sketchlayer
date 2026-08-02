import { expect, test } from "@playwright/test";

test("draws an annotation and exposes structured feedback", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "SketchLayer" })).toBeVisible();
  await expect(page.getByRole("img", { name: "SketchLayer drawing canvas" })).toBeVisible();
  await expect(page.getByText("5 annotations", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Highlighter (H)" }).click();
  const canvas = page.getByRole("img", { name: "SketchLayer drawing canvas" });
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas is not measurable.");
  await page.mouse.move(box.x + 140, box.y + 140);
  await page.mouse.down();
  await page.mouse.move(box.x + 260, box.y + 180, { steps: 5 });
  await page.mouse.up();

  await expect(page.getByText("6 annotations", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Send to Agent" }).click();
  await expect(page.getByRole("status")).toContainText("6 annotations sent to agent");
});

test("Pro AI shape resolves a target, saves a note, and sends agent JSON", async ({ page }) => {
  await page.goto("/#pro");
  await page.getByRole("button", { name: "Shape" }).click();
  await page.getByRole("button", { name: /Problem Circle/ }).click();
  const canvas = page.getByRole("img", { name: "Pro annotation canvas" });
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Pro canvas did not render.");
  await page.mouse.move(box.x + 120, box.y + 100);
  await page.mouse.down();
  await page.mouse.move(box.x + 260, box.y + 210, { steps: 4 });
  await page.mouse.up();
  await page.getByLabel("Note").fill("Increase emphasis");
  await page.getByRole("button", { name: "Save instruction" }).click();
  await page.getByRole("button", { name: "Send to Agent" }).click();
  await expect(page.getByText("Sent 1 annotation(s) to Agent.")).toBeVisible();
});
