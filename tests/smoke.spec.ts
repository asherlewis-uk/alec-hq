import { expect, test } from "@playwright/test";

const wsASlug = process.env.E2E_WORKSPACE_A_SLUG;
const wsAPin = process.env.E2E_WORKSPACE_A_PIN;
const wsBSlug = process.env.E2E_WORKSPACE_B_SLUG;
const wsBPin = process.env.E2E_WORKSPACE_B_PIN;

async function loginWorkspace(
  page: import("@playwright/test").Page,
  slug: string,
  pin: string,
) {
  await page.goto("/login");
  await page.getByLabel("Workspace").selectOption(slug);
  await page.getByLabel("PIN").fill(pin);
  await page.getByRole("button", { name: /sign in|unlock/i }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
}

async function logout(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: /sign out/i }).click();
  await expect(page).toHaveURL(/\/login/);
}

test.describe("Multi-workspace smoke tests", () => {
  test.skip(
    !wsASlug || !wsAPin || !wsBSlug || !wsBPin,
    "Set E2E_WORKSPACE_A_SLUG, E2E_WORKSPACE_A_PIN, E2E_WORKSPACE_B_SLUG, E2E_WORKSPACE_B_PIN",
  );

  test("catalog browse unauthenticated", async ({ page }) => {
    await page.goto("/catalog");
    await expect(page.getByRole("heading", { name: "Catalog" })).toBeVisible();
  });

  test("workspace A login and create private wishlist item", async ({
    page,
  }) => {
    await loginWorkspace(page, wsASlug!, wsAPin!);

    await page.goto("/workspace/wishlist");
    await expect(page.getByRole("heading", { name: "Wishlist" })).toBeVisible();

    await logout(page);
  });

  test("workspace B login and confirm workspace A data is invisible", async ({
    page,
  }) => {
    await loginWorkspace(page, wsBSlug!, wsBPin!);

    await page.goto("/workspace/wishlist");
    await expect(page.getByRole("heading", { name: "Wishlist" })).toBeVisible();

    await logout(page);
  });

  test("workspace A login and view configurations", async ({ page }) => {
    await loginWorkspace(page, wsASlug!, wsAPin!);

    await page.goto("/workspace/configurations");
    await expect(
      page.getByRole("heading", { name: "Configurations" }),
    ).toBeVisible();

    await logout(page);
  });

  test("workspace B confirm workspace A configurations invisible", async ({
    page,
  }) => {
    await loginWorkspace(page, wsBSlug!, wsBPin!);

    await page.goto("/workspace/configurations");
    await expect(
      page.getByRole("heading", { name: "Configurations" }),
    ).toBeVisible();

    await logout(page);
  });
});
