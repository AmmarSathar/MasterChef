import { test, expect } from "@playwright/test";

test("user can log in, stay logged in, and log out", async ({ page }) => {
  const email = `login+${Date.now()}@test.com`;
  const password = "Password1!";

  await page.request.post("http://localhost:4000/api/auth/register", {
    data: { email, password, name: "Login User" },
  });

  await page.goto("/login?register=false");

  await page.getByLabel("Email Address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log In" }).click();

  await expect(
    page.getByText("Customize Your Culinary Experience")
  ).toBeVisible();

  const storedBefore = await page.evaluate(() =>
    window.localStorage.getItem("user")
  );
  expect(storedBefore).toContain(email);

  await page.goto("/");
  const storedAfterNav = await page.evaluate(() =>
    window.localStorage.getItem("user")
  );
  expect(storedAfterNav).toContain(email);

  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page).toHaveURL(/\/login/);

  const storedAfterLogout = await page.evaluate(() =>
    window.localStorage.getItem("user")
  );
  expect(storedAfterLogout).toBeNull();
});
