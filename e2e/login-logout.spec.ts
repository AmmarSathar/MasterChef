import { test, expect } from "@playwright/test";

test("user can log in, stay logged in, and log out", async ({ page }) => {
  const email = `login+${Date.now()}@test.com`;
  const password = "Password1!";

  // Create a non-customized user via BetterAuth sign-up API
  await page.request.post("http://localhost:4000/api/auth/sign-up/email", {
    data: {
      email,
      password,
      name: "Login User",
    },
  });

  await page.goto("/login?register=false");

  await page.getByLabel("Email Address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log In" }).click();

  // Wait for the customization screen to appear (transitions take ~3s)
  await expect(
    page.getByText("Customize Your Culinary Experience")
  ).toBeVisible({ timeout: 20000 });

  // Select the first available cuisine badge
  await page.getByText("Favorite Cuisines").locator("..").locator(".cursor-pointer").first().click();

  // Advance to step 2
  await page.getByRole("button", { name: "Next: Personal Details" }).click();

  // Fill in age and complete setup
  await page.getByLabel(/^Age/).fill("20");
  await page.getByRole("button", { name: "Complete Setup" }).click();

  // Verify user lands on /dashboard
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

  // Navigate away and back — cookie session keeps user logged in
  await page.goto("/");
  await expect(page).not.toHaveURL(/\/login/);

  // Log out
  await page.getByRole("button", { name: "Logout" }).click();
  await page.waitForURL(/\/(login|)$/, { timeout: 10000 });
});
