#!/usr/bin/env node
/**
 * Seed test data for E2E test user on the wallet backend.
 *
 * Usage:
 *   node e2e/setup/seed-test-data.mjs
 *   TEST_EMAIL=... TEST_PASSWORD=... API_BASE=https://... node e2e/setup/seed-test-data.mjs
 *
 * Idempotent-ish: skips wallet/category creation when they already exist,
 * always tops up transactions so dashboard/transactions pages have data.
 */
const API_BASE = process.env.API_BASE || 'https://chinhnt-portfolio-platform.fly.dev'
const EMAIL = process.env.TEST_EMAIL || 'e2e-test@example.com'
const PASSWORD = process.env.TEST_PASSWORD || 'Test1234!'

const api = `${API_BASE}/api/v1`
let token = ''

async function req(method, path, body) {
  const resp = await fetch(`${api}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await resp.text()
  let data
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!resp.ok) {
    console.warn(`  ✗ ${method} ${path} → ${resp.status}: ${text.slice(0, 200)}`)
    return null
  }
  return data
}

// Backend expects Instant (ISO datetime with Z) for txn `date` and group `dueDate`
function isoInstant(daysAgo) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10) + 'T07:00:00Z'
}

// Recurring `startDate` is a LocalDate (YYYY-MM-DD)
function isoDate(daysAgo) {
  return isoInstant(daysAgo).slice(0, 10)
}

async function main() {
  console.log(`Seeding data for ${EMAIL} on ${API_BASE}`)

  // ── Login ──
  const auth = await req('POST', '/auth/login', { email: EMAIL, password: PASSWORD })
  if (!auth?.accessToken) {
    console.error('Login failed — register the user first.')
    process.exit(1)
  }
  token = auth.accessToken
  console.log('✓ Logged in')

  // ── Wallets ──
  let wallets = (await req('GET', '/wallet/wallets')) || []
  if (Array.isArray(wallets?.content)) wallets = wallets.content
  if (wallets.length < 2) {
    await req('POST', '/wallet/wallets', { name: 'Tiền mặt', type: 'CASH', icon: '💵', color: '#7ed957', initialBalance: 2500000 })
    await req('POST', '/wallet/wallets', { name: 'Vietcombank', type: 'BANK', icon: '🏦', color: '#4a9eff', initialBalance: 18500000 })
    await req('POST', '/wallet/wallets', { name: 'Momo', type: 'E_WALLET', icon: '📱', color: '#d82d8b', initialBalance: 750000 })
    wallets = (await req('GET', '/wallet/wallets')) || []
    if (Array.isArray(wallets?.content)) wallets = wallets.content
  }
  console.log(`✓ Wallets: ${wallets.length}`)
  const cashId = wallets.find((w) => w.type === 'CASH')?.id ?? wallets[0]?.id
  const bankId = wallets.find((w) => w.type === 'BANK')?.id ?? wallets[0]?.id

  // ── Categories ──
  let cats = (await req('GET', '/wallet/categories')) || []
  if (Array.isArray(cats?.content)) cats = cats.content
  const wanted = [
    { name: 'Ăn uống', icon: '🍜', color: '#ffb648', type: 'EXPENSE' },
    { name: 'Di chuyển', icon: '🛵', color: '#4a9eff', type: 'EXPENSE' },
    { name: 'Mua sắm', icon: '🛍️', color: '#d82d8b', type: 'EXPENSE' },
    { name: 'Hóa đơn', icon: '🧾', color: '#ff5e4a', type: 'EXPENSE' },
    { name: 'Giải trí', icon: '🎮', color: '#9b6dff', type: 'EXPENSE' },
    { name: 'Lương', icon: '💰', color: '#7ed957', type: 'INCOME' },
    { name: 'Thưởng', icon: '🎁', color: '#c8f53a', type: 'INCOME' },
  ]
  for (const c of wanted) {
    if (!cats.some((x) => x.name === c.name)) await req('POST', '/wallet/categories', c)
  }
  cats = (await req('GET', '/wallet/categories')) || []
  if (Array.isArray(cats?.content)) cats = cats.content
  console.log(`✓ Categories: ${cats.length}`)
  const catId = (name) => cats.find((c) => c.name === name)?.id

  // ── Transactions (this month + last month) ──
  let txns = (await req('GET', '/wallet/transactions?page=0&size=1')) || {}
  const txnCount = txns.totalElements ?? (Array.isArray(txns) ? txns.length : 0)
  if (txnCount < 15) {
    const plan = [
      { walletId: bankId, categoryId: catId('Lương'), amount: 25000000, type: 'INCOME', note: 'Lương tháng 6', date: isoInstant(11) },
      { walletId: bankId, categoryId: catId('Thưởng'), amount: 3000000, type: 'INCOME', note: 'Thưởng dự án', date: isoInstant(8) },
      { walletId: cashId, categoryId: catId('Ăn uống'), amount: 65000, type: 'EXPENSE', note: 'Phở bò', date: isoInstant(0) },
      { walletId: cashId, categoryId: catId('Ăn uống'), amount: 45000, type: 'EXPENSE', note: 'Cà phê sữa', date: isoInstant(1) },
      { walletId: cashId, categoryId: catId('Di chuyển'), amount: 120000, type: 'EXPENSE', note: 'Xăng xe', date: isoInstant(2) },
      { walletId: bankId, categoryId: catId('Mua sắm'), amount: 1250000, type: 'EXPENSE', note: 'Áo khoác', date: isoInstant(3) },
      { walletId: bankId, categoryId: catId('Hóa đơn'), amount: 850000, type: 'EXPENSE', note: 'Tiền điện tháng 6', date: isoInstant(4) },
      { walletId: cashId, categoryId: catId('Giải trí'), amount: 300000, type: 'EXPENSE', note: 'Xem phim', date: isoInstant(5) },
      { walletId: cashId, categoryId: catId('Ăn uống'), amount: 220000, type: 'EXPENSE', note: 'Lẩu cuối tuần', date: isoInstant(6) },
      { walletId: bankId, categoryId: catId('Hóa đơn'), amount: 250000, type: 'EXPENSE', note: 'Internet', date: isoInstant(7) },
      { walletId: cashId, categoryId: catId('Ăn uống'), amount: 55000, type: 'EXPENSE', note: 'Bún chả', date: isoInstant(9) },
      { walletId: bankId, categoryId: catId('Lương'), amount: 25000000, type: 'INCOME', note: 'Lương tháng 5', date: isoInstant(40) },
      { walletId: bankId, categoryId: catId('Mua sắm'), amount: 2400000, type: 'EXPENSE', note: 'Tai nghe', date: isoInstant(35) },
      { walletId: cashId, categoryId: catId('Ăn uống'), amount: 180000, type: 'EXPENSE', note: 'Ăn ngoài', date: isoInstant(33) },
      { walletId: bankId, categoryId: catId('Hóa đơn'), amount: 820000, type: 'EXPENSE', note: 'Tiền điện tháng 5', date: isoInstant(32) },
    ]
    for (const t of plan) {
      if (t.walletId && t.categoryId) await req('POST', '/wallet/transactions', t)
    }
    console.log(`✓ Transactions seeded: ${plan.length}`)
  } else {
    console.log(`✓ Transactions already present: ${txnCount}`)
  }

  // ── Budgets (current period) ──
  const period = new Date().toISOString().slice(0, 7)
  let budgets = (await req('GET', `/wallet/budgets?period=${period}`)) || []
  if (Array.isArray(budgets?.content)) budgets = budgets.content
  if (!Array.isArray(budgets)) budgets = []
  if (budgets.length === 0) {
    await req('POST', '/wallet/budgets', { categoryId: catId('Ăn uống'), monthlyLimit: 3000000, alertThreshold: 80, period })
    await req('POST', '/wallet/budgets', { categoryId: catId('Mua sắm'), monthlyLimit: 2000000, alertThreshold: 80, period })
    console.log('✓ Budgets seeded')
  } else {
    console.log(`✓ Budgets already present: ${budgets.length}`)
  }

  // ── Debt groups ──
  let groups = (await req('GET', '/wallet/groups')) || []
  if (Array.isArray(groups?.content)) groups = groups.content
  if (!Array.isArray(groups)) groups = []
  if (groups.length === 0) {
    await req('POST', '/wallet/groups', { title: 'Vay anh Tuấn', groupType: 'DEBT', totalAmount: 5000000, walletId: bankId, counterparty: 'Anh Tuấn', dueDate: isoInstant(-30) })
    await req('POST', '/wallet/groups', { title: 'Cho Linh mượn', groupType: 'LOAN_GIVEN', totalAmount: 1500000, walletId: cashId, counterparty: 'Linh', dueDate: isoInstant(-14) })
    console.log('✓ Debt groups seeded')
  } else {
    console.log(`✓ Debt groups already present: ${groups.length}`)
  }

  // ── Recurring rules ──
  let recurring = (await req('GET', '/wallet/recurring')) || []
  if (Array.isArray(recurring?.content)) recurring = recurring.content
  if (!Array.isArray(recurring)) recurring = []
  if (recurring.length === 0) {
    await req('POST', '/wallet/recurring', { walletId: bankId, categoryId: catId('Lương'), amount: 25000000, type: 'INCOME', frequency: 'MONTHLY', startDate: isoDate(11), note: 'Lương hàng tháng' })
    await req('POST', '/wallet/recurring', { walletId: bankId, categoryId: catId('Hóa đơn'), amount: 250000, type: 'EXPENSE', frequency: 'MONTHLY', startDate: isoDate(7), note: 'Internet FPT' })
    console.log('✓ Recurring rules seeded')
  } else {
    console.log(`✓ Recurring already present: ${recurring.length}`)
  }

  // ── Wishlist ──
  let wishlist = (await req('GET', '/wallet/wishlist')) || []
  if (Array.isArray(wishlist?.content)) wishlist = wishlist.content
  if (!Array.isArray(wishlist)) wishlist = []
  if (wishlist.length === 0) {
    await req('POST', '/wallet/wishlist', { name: 'MacBook Air M4', estimatedPrice: 28000000, priority: 'HIGH' })
    await req('POST', '/wallet/wishlist', { name: 'Ghế công thái học', estimatedPrice: 4500000, priority: 'MEDIUM' })
    console.log('✓ Wishlist seeded')
  } else {
    console.log(`✓ Wishlist already present: ${wishlist.length}`)
  }

  console.log('\nDone. Test user data ready.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
