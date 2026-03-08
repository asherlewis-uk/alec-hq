import { expect, test } from '@playwright/test'

const passcode = process.env.E2E_PASSCODE

test.describe('Production smoke flow', () => {
  test.skip(!passcode, 'Set E2E_PASSCODE to run smoke tests')

  test('owner login, CRUD basics, public share visibility', async ({ page }) => {
    const assetName = `E2E Asset ${Date.now()}`

    await page.goto('/login')
    await page.getByLabel('Passcode').fill(passcode as string)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

    await page.getByRole('button', { name: 'Add Item' }).click()
    await page.getByLabel('Name').fill(assetName)
    await page.getByRole('button', { name: 'Create Asset' }).click()
    await expect(page.getByText(assetName)).toBeVisible()

    await page.getByText(assetName).first().click()
    await expect(page.getByRole('heading', { name: assetName })).toBeVisible()

    await page.getByRole('button', { name: 'Add Component' }).click()
    await page.getByPlaceholder('e.g., GPU').fill('GPU')
    await page.getByPlaceholder('e.g., NVIDIA').fill('NVIDIA')
    await page.getByRole('button', { name: 'Add Component' }).last().click()
    await expect(page.getByText('GPU')).toBeVisible()

    await page.getByRole('tab', { name: /Logs/i }).click()
    await page.getByRole('button', { name: 'Add Log Entry' }).click()
    await page.getByPlaceholder('e.g., Oil change').fill('E2E Maintenance')
    await page.getByRole('button', { name: 'Add Entry' }).click()
    await expect(page.getByText('E2E Maintenance')).toBeVisible()

    await page.getByRole('tab', { name: /Wishlist/i }).click()
    await page.getByRole('button', { name: 'Add Wishlist Item' }).click()
    await page.getByPlaceholder('e.g., RTX 5090').fill('E2E Upgrade')
    await page.getByRole('button', { name: 'Add Item' }).click()
    await expect(page.getByText('E2E Upgrade')).toBeVisible()

    await page.getByRole('button', { name: 'Private' }).click()
    await expect(page.getByRole('button', { name: 'Public' })).toBeVisible()

    const detailUrl = page.url()
    const id = detailUrl.split('/').pop()
    await page.goto(`/share/${id}`)
    await expect(page.getByRole('heading', { name: assetName })).toBeVisible()
    await expect(page.getByText('Specifications')).toBeVisible()
  })
})
