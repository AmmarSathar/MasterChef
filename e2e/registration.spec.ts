import { test, expect } from "@playwright/test";

test("user can register and reaches preferences flow", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Get Started" }).click();
  await expect(page).toHaveURL(/\/login/);

  await page.getByRole("button", { name: "Sign-Up" }).click();

  await expect(page.getByLabel("Full Name")).toBeVisible();

  const email = `alice+${Date.now()}@test.com`;
  await page.getByLabel("Full Name").fill("Alice Tester");
  await page.getByLabel("Email Address").fill(email);
  await page.getByLabel("Password").fill("Password1!");

  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(
    page.getByText("Customize Your Culinary Experience")
  ).toBeVisible();
});
