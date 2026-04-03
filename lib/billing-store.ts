import { Invoice } from '@/types/invoice'
import { Payment, Quote, ReportSnapshot, UserAccess } from '@/types/billing'
import { getSupabaseClient } from '@/lib/supabase'

const STORAGE_KEYS = {
  invoices: 'billingInvoices',
  payments: 'billingPayments',
  quotes: 'quotes',
  users: 'billingUsers',
  reports: 'billingReports',
}

interface DataRow<T> {
  id: string
  user_id: string
  created_at: string
  data: T
}

const MIGRATION_VERSION = 'v1'

function isDueDatePast(dueDate: string): boolean | null {
  if (!dueDate) return null

  const due = new Date(dueDate)
  if (Number.isNaN(due.getTime())) return null

  const dueDay = new Date(due)
  dueDay.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return dueDay.getTime() < today.getTime()
}

function normalizeInvoiceStatus(invoice: Invoice): Invoice {
  const rawStatus = (invoice as any).status as string | undefined
  let nextStatus: Invoice['status'] = invoice.status

  if (rawStatus === 'draft') {
    nextStatus = 'sent'
  } else if (rawStatus === 'sent' || rawStatus === 'paid' || rawStatus === 'overdue') {
    nextStatus = rawStatus
  }

  if (nextStatus !== 'paid') {
    const pastDue = isDueDatePast(invoice.dueDate)
    if (pastDue === true && nextStatus === 'sent') {
      nextStatus = 'overdue'
    }
    if (pastDue === false && nextStatus === 'overdue') {
      nextStatus = 'sent'
    }
  }

  if (nextStatus !== invoice.status) {
    return {
      ...invoice,
      status: nextStatus,
    }
  }

  return invoice
}

function isBrowser() {
  return typeof window !== 'undefined'
}

function readLocal<T>(key: string): T[] {
  if (!isBrowser()) return []
  const raw = localStorage.getItem(key)
  if (!raw) return []

  try {
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

function writeLocal<T>(key: string, value: T[]): void {
  if (!isBrowser()) return
  localStorage.setItem(key, JSON.stringify(value))
}

function emitBillingDataChanged(): void {
  if (!isBrowser()) return
  window.dispatchEvent(new CustomEvent('billing:data-changed'))
}

function getMigrationKey(scope: string) {
  return `billingMigrated:${scope}:${MIGRATION_VERSION}`
}

async function migrateUsersToSupabaseIfNeeded(): Promise<void> {
  const supabase = getSupabaseClient()
  if (!supabase || !isBrowser()) return

  const migrationKey = getMigrationKey('users')
  if (localStorage.getItem(migrationKey) === '1') return

  const localUsers = readLocal<UserAccess>(STORAGE_KEYS.users)
  if (localUsers.length > 0) {
    await supabase.from('user_permissions').upsert(
      localUsers.map((user) => ({
        id: user.id,
        email: user.email,
        password: user.password,
        role: user.role,
        access_level: user.accessLevel,
        created_at: user.createdAt,
        company_name: user.companyName || null,
      })),
      { onConflict: 'id' }
    )
  }

  localStorage.setItem(migrationKey, '1')
}

export async function migrateLocalDataToSupabaseIfNeeded(userId: string): Promise<void> {
  const supabase = getSupabaseClient()
  if (!supabase || !isBrowser()) return

  await migrateUsersToSupabaseIfNeeded()

  const migrationKey = getMigrationKey(`data:${userId}`)
  if (localStorage.getItem(migrationKey) === '1') return

  const invoices = readLocal<Invoice>(STORAGE_KEYS.invoices)
  if (invoices.length > 0) {
    await supabase.from('invoices').upsert(
      invoices.map((invoice) => {
        const normalizedInvoice = normalizeInvoiceStatus(invoice)
        return {
          id: normalizedInvoice.id,
          user_id: userId,
          created_at: normalizedInvoice.createdAt || new Date().toISOString(),
          data: normalizedInvoice,
        }
      }),
      { onConflict: 'id' }
    )
  }

  const payments = readLocal<Payment>(STORAGE_KEYS.payments)
  if (payments.length > 0) {
    await supabase.from('payments').upsert(
      payments.map((payment) => ({
        id: payment.id,
        user_id: userId,
        created_at: payment.createdAt || payment.date || new Date().toISOString(),
        data: payment,
      })),
      { onConflict: 'id' }
    )
  }

  const quotes = readLocal<Quote>(STORAGE_KEYS.quotes)
  if (quotes.length > 0) {
    await supabase.from('quotes').upsert(
      quotes.map((quote) => ({
        id: quote.id,
        user_id: userId,
        created_at: quote.createdAt || new Date().toISOString(),
        data: quote,
      })),
      { onConflict: 'id' }
    )
  }

  const reports = readLocal<ReportSnapshot>(STORAGE_KEYS.reports)
  if (reports.length > 0) {
    await supabase.from('reports').upsert(
      reports.map((report) => ({
        id: report.id,
        user_id: report.userId || userId,
        created_at: report.createdAt || new Date().toISOString(),
        data: report,
      })),
      { onConflict: 'id' }
    )
  }

  localStorage.setItem(migrationKey, '1')
}

export async function getInvoices(userId: string): Promise<Invoice[]> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return readLocal<Invoice>(STORAGE_KEYS.invoices).map(normalizeInvoiceStatus)
  }

  await migrateLocalDataToSupabaseIfNeeded(userId)

  const { data, error } = await supabase
    .from('invoices')
    .select('id,user_id,created_at,data')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error || !data) {
    return readLocal<Invoice>(STORAGE_KEYS.invoices).map(normalizeInvoiceStatus)
  }

  const invoices = (data as DataRow<Invoice>[]).map((row) => normalizeInvoiceStatus(row.data))
  writeLocal(STORAGE_KEYS.invoices, invoices)
  return invoices
}

export async function upsertInvoice(userId: string, invoice: Invoice): Promise<void> {
  const supabase = getSupabaseClient()
  const normalizedInvoice = normalizeInvoiceStatus(invoice)

  const local = readLocal<Invoice>(STORAGE_KEYS.invoices)
  const exists = local.find((inv) => inv.id === normalizedInvoice.id)
  const nextLocal = exists
    ? local.map((inv) => (inv.id === normalizedInvoice.id ? normalizedInvoice : inv))
    : [...local, normalizedInvoice]
  writeLocal(STORAGE_KEYS.invoices, nextLocal)

  if (!supabase) return

  await supabase.from('invoices').upsert(
    {
      id: normalizedInvoice.id,
      user_id: userId,
      created_at: normalizedInvoice.createdAt || new Date().toISOString(),
      data: normalizedInvoice,
    },
    { onConflict: 'id' }
  )

  emitBillingDataChanged()
}

export async function deleteInvoice(userId: string, id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const local = readLocal<Invoice>(STORAGE_KEYS.invoices).filter((inv) => inv.id !== id)
  writeLocal(STORAGE_KEYS.invoices, local)

  if (!supabase) return
  await supabase.from('invoices').delete().eq('id', id).eq('user_id', userId)

  emitBillingDataChanged()
}

export async function setInvoicePaidByNumber(userId: string, invoiceNumber: string): Promise<void> {
  const invoices = await getInvoices(userId)
  const target = invoices.find((inv) => inv.invoiceNumber === invoiceNumber)
  if (!target) return

  await upsertInvoice(userId, {
    ...target,
    status: 'paid',
  })
}

export async function setInvoiceStatusByNumber(
  userId: string,
  invoiceNumber: string,
  status: Invoice['status']
): Promise<void> {
  const invoices = await getInvoices(userId)
  const target = invoices.find((inv) => inv.invoiceNumber === invoiceNumber)
  if (!target) return

  await upsertInvoice(userId, {
    ...target,
    status,
  })
}

export async function getPayments(userId: string): Promise<Payment[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return readLocal<Payment>(STORAGE_KEYS.payments)

  await migrateLocalDataToSupabaseIfNeeded(userId)

  const { data, error } = await supabase
    .from('payments')
    .select('id,user_id,created_at,data')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error || !data) {
    return readLocal<Payment>(STORAGE_KEYS.payments)
  }

  const payments = (data as DataRow<Payment>[]).map((row) => row.data)
  writeLocal(STORAGE_KEYS.payments, payments)
  return payments
}

export async function addPayment(userId: string, payment: Payment): Promise<void> {
  const supabase = getSupabaseClient()
  const local = readLocal<Payment>(STORAGE_KEYS.payments)
  writeLocal(STORAGE_KEYS.payments, [...local, payment])

  if (!supabase) return
  await supabase.from('payments').insert({
    id: payment.id,
    user_id: userId,
    created_at: payment.createdAt || new Date().toISOString(),
    data: payment,
  })

  emitBillingDataChanged()
}

export async function upsertPayment(userId: string, payment: Payment): Promise<void> {
  const supabase = getSupabaseClient()
  const local = readLocal<Payment>(STORAGE_KEYS.payments)
  const exists = local.find((pay) => pay.id === payment.id)
  const nextLocal = exists
    ? local.map((pay) => (pay.id === payment.id ? payment : pay))
    : [...local, payment]
  writeLocal(STORAGE_KEYS.payments, nextLocal)

  if (!supabase) return
  await supabase.from('payments').upsert(
    {
      id: payment.id,
      user_id: userId,
      created_at: payment.createdAt || payment.date || new Date().toISOString(),
      data: payment,
    },
    { onConflict: 'id' }
  )

  emitBillingDataChanged()
}

export async function deletePayment(userId: string, id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const local = readLocal<Payment>(STORAGE_KEYS.payments).filter((pay) => pay.id !== id)
  writeLocal(STORAGE_KEYS.payments, local)

  if (!supabase) return
  await supabase.from('payments').delete().eq('id', id).eq('user_id', userId)

  emitBillingDataChanged()
}

export async function getQuotes(userId: string): Promise<Quote[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return readLocal<Quote>(STORAGE_KEYS.quotes)

  await migrateLocalDataToSupabaseIfNeeded(userId)

  const { data, error } = await supabase
    .from('quotes')
    .select('id,user_id,created_at,data')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error || !data) {
    return readLocal<Quote>(STORAGE_KEYS.quotes)
  }

  const quotes = (data as DataRow<Quote>[]).map((row) => row.data)
  writeLocal(STORAGE_KEYS.quotes, quotes)
  return quotes
}

export async function upsertQuote(userId: string, quote: Quote): Promise<void> {
  const supabase = getSupabaseClient()
  const local = readLocal<Quote>(STORAGE_KEYS.quotes)
  const exists = local.find((q) => q.id === quote.id)
  const nextLocal = exists ? local.map((q) => (q.id === quote.id ? quote : q)) : [...local, quote]
  writeLocal(STORAGE_KEYS.quotes, nextLocal)

  if (!supabase) return
  await supabase.from('quotes').upsert(
    {
      id: quote.id,
      user_id: userId,
      created_at: quote.createdAt || new Date().toISOString(),
      data: quote,
    },
    { onConflict: 'id' }
  )
}

export async function deleteQuote(userId: string, id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const local = readLocal<Quote>(STORAGE_KEYS.quotes).filter((q) => q.id !== id)
  writeLocal(STORAGE_KEYS.quotes, local)

  if (!supabase) return
  await supabase.from('quotes').delete().eq('id', id).eq('user_id', userId)
}

export async function getUsers(): Promise<UserAccess[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return readLocal<UserAccess>(STORAGE_KEYS.users)

  await migrateUsersToSupabaseIfNeeded()

  const { data, error } = await supabase
    .from('user_permissions')
    .select('id,email,password,role,access_level,created_at,company_name')
    .order('created_at', { ascending: true })

  if (error || !data) {
    return readLocal<UserAccess>(STORAGE_KEYS.users)
  }

  const users = data.map((row: any) => ({
    id: row.id,
    email: row.email,
    password: row.password,
    role: row.role,
    accessLevel: row.access_level,
    createdAt: row.created_at,
    companyName: row.company_name,
  })) as UserAccess[]

  writeLocal(STORAGE_KEYS.users, users)
  return users
}

export async function addUser(user: UserAccess): Promise<void> {
  const supabase = getSupabaseClient()
  const local = readLocal<UserAccess>(STORAGE_KEYS.users)
  writeLocal(STORAGE_KEYS.users, [...local, user])

  if (!supabase) return
  await supabase.from('user_permissions').insert({
    id: user.id,
    email: user.email,
    password: user.password,
    role: user.role,
    access_level: user.accessLevel,
    created_at: user.createdAt,
    company_name: user.companyName || null,
  })
}

export async function removeUser(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const local = readLocal<UserAccess>(STORAGE_KEYS.users).filter((u) => u.id !== id)
  writeLocal(STORAGE_KEYS.users, local)

  if (!supabase) return
  await supabase.from('user_permissions').delete().eq('id', id)
}

export async function findUserByCredentials(email: string, password: string): Promise<UserAccess | null> {
  const supabase = getSupabaseClient()

  if (supabase) {
    await migrateUsersToSupabaseIfNeeded()

    const { data, error } = await supabase
      .from('user_permissions')
      .select('id,email,password,role,access_level,created_at,company_name')
      .eq('email', email)
      .eq('password', password)
      .maybeSingle()

    if (!error && data) {
      return {
        id: data.id,
        email: data.email,
        password: data.password,
        role: data.role,
        accessLevel: data.access_level,
        createdAt: data.created_at,
        companyName: data.company_name,
      }
    }
  }

  const local = readLocal<UserAccess>(STORAGE_KEYS.users)
  return local.find((u) => u.email === email && u.password === password) || null
}

export async function saveReportSnapshot(snapshot: ReportSnapshot): Promise<void> {
  const supabase = getSupabaseClient()
  const local = readLocal<ReportSnapshot>(STORAGE_KEYS.reports).filter((r) => r.id !== snapshot.id)
  writeLocal(STORAGE_KEYS.reports, [...local, snapshot])

  if (!supabase) return
  await supabase.from('reports').upsert(
    {
      id: snapshot.id,
      user_id: snapshot.userId,
      created_at: snapshot.createdAt,
      data: snapshot,
    },
    { onConflict: 'id' }
  )
}
