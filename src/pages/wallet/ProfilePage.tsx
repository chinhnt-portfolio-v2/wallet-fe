import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import {
  Download, RefreshCw, PiggyBank,
  Bell, FileText, ChevronRight,
  LogOut, Pencil,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/theme-store'
import { useUser } from '@/hooks/useUser'
import { Skeleton } from '@/components/ui/Skeleton'
import { SectionLabel } from '@/design-system'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { APP_VERSION } from '@/lib/app-meta'

// ─── Types ───────────────────────────────────────────────

interface MenuItem {
  labelKey: string
  metaKey?: string
  href: string
  icon: React.ReactNode
  badge?: string
}

// ─── Sub-components ──────────────────────────────────────

function UserCard() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: user, isLoading, isError } = useUser()

  if (isLoading) {
    return (
      <div className="bg-surface border border-line rounded-xl p-5 flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-surface border border-line rounded-xl p-5 text-center space-y-2 py-4">
        {isError ? (
          <>
            <p className="text-sm text-negative">{t('profile.loadError')}</p>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['user-profile'] })}
              className="text-[11px] text-primary hover:underline"
            >
              {t('common.retry')}
            </button>
          </>
        ) : (
          <p className="text-sm text-muted">{t('profile.loadFailed')}</p>
        )}
      </div>
    )
  }

  const initial = (user.name ?? user.email ?? '?')[0].toUpperCase()

  return (
    <div className="bg-surface border border-line rounded-xl p-5">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name ?? 'Avatar'}
            className="w-14 h-14 rounded-full object-cover border border-line shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-primary-soft flex items-center justify-center text-2xl text-primary font-extrabold shrink-0">
            {initial}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-base font-bold text-ink truncate">
            {user.name ?? t('profile.noName')}
          </p>
          <p className="text-xs text-muted truncate">{user.email}</p>
          {/* Provider chip */}
          {user.provider && (
            <div className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-full bg-primary-soft">
              <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-[10px] font-bold text-primary capitalize">
                {t('profile.googleLogin')}
              </span>
            </div>
          )}
        </div>

        {/* Edit button */}
        <button
          aria-label={t('common.edit')}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-hover hover:text-ink transition-colors shrink-0"
        >
          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

function MenuRow({ item, onClick }: { item: MenuItem; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-hover transition-colors text-left min-h-[44px]"
    >
      <span className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center text-sub shrink-0">
        {item.icon}
      </span>
      <span className="flex-1 text-sm text-ink font-medium">{item.labelKey}</span>
      {item.badge && (
        <span className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary-soft text-primary">
          {item.badge}
        </span>
      )}
      <ChevronRight className="w-4 h-4 text-muted shrink-0" aria-hidden="true" />
    </button>
  )
}

// ─── Main component ───────────────────────────────────────

export default function ProfilePage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const clearToken = useAuthStore((s) => s.clearToken)

  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  const handleLogout = () => {
    clearToken()
    localStorage.removeItem('wallet_theme')
    localStorage.removeItem('wallet_refresh_token')
    localStorage.removeItem('wallet_onboarding_done')
    window.location.href = '/login'
  }

  const financeItems: MenuItem[] = [
    { labelKey: t('profile.menuExport'), href: '/export', icon: <Download className="w-3.5 h-3.5" aria-hidden="true" /> },
    { labelKey: t('profile.menuRecurring'), href: '/recurring', icon: <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />, badge: t('profile.badgeAuto') },
    { labelKey: t('profile.menuBudget'), href: '/budgets', icon: <PiggyBank className="w-3.5 h-3.5" aria-hidden="true" /> },
  ]

  const otherItems: MenuItem[] = [
    { labelKey: t('profile.menuNotifications'), href: '/notifications', icon: <Bell className="w-3.5 h-3.5" aria-hidden="true" />, badge: t('profile.badgeNew') },
    { labelKey: t('profile.menuTerms'), href: '#', icon: <FileText className="w-3.5 h-3.5" aria-hidden="true" /> },
  ]

  const themeOptions = [
    { value: 'light' as const, label: t('theme.light') },
    { value: 'dark' as const, label: t('theme.dark') },
  ]

  const langOptions = [
    { value: 'vi', label: 'VI' },
    { value: 'en', label: 'EN' },
  ]

  return (
    <div className="page-enter space-y-6">
      {/* Page header */}
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mb-0.5">
          {t('profile.account')}
        </p>
        <h1 className="text-xl font-extrabold tracking-[-0.02em] text-ink">{t('profile.title')}</h1>
      </div>

      {/* ── Profile card ──────────────────────────────────── */}
      <UserCard />

      {/* ── Tài chính section ─────────────────────────────── */}
      <section className="space-y-2">
        <SectionLabel>{t('profile.sectionFinance')}</SectionLabel>
        <div className="bg-surface border border-line rounded-xl overflow-hidden divide-y divide-line">
          {financeItems.map((item) => (
            <MenuRow key={item.href} item={item} onClick={() => navigate(item.href)} />
          ))}
        </div>
      </section>

      {/* ── Giao diện section ─────────────────────────────── */}
      <section className="space-y-2">
        <SectionLabel>{t('theme.label')}</SectionLabel>
        <div className="bg-surface border border-line rounded-xl overflow-hidden divide-y divide-line">
          {/* Theme toggle */}
          <div className="flex items-center justify-between px-4 py-3.5 min-h-[44px]">
            <span className="text-sm text-ink font-medium">{t('theme.label')}</span>
            <SegmentedControl
              options={themeOptions}
              value={theme}
              onChange={setTheme}
              size="sm"
              ariaLabel={t('theme.label')}
            />
          </div>

          {/* Language toggle */}
          <div className="flex items-center justify-between px-4 py-3.5 min-h-[44px]">
            <span className="text-sm text-ink font-medium">{t('profile.language')}</span>
            <SegmentedControl
              options={langOptions}
              value={i18n.language.startsWith('vi') ? 'vi' : 'en'}
              onChange={(lang) => i18n.changeLanguage(lang)}
              size="sm"
              ariaLabel={t('profile.language')}
            />
          </div>
        </div>
      </section>

      {/* ── Khác section ──────────────────────────────────── */}
      <section className="space-y-2">
        <SectionLabel>{t('profile.sectionOther')}</SectionLabel>
        <div className="bg-surface border border-line rounded-xl overflow-hidden divide-y divide-line">
          {otherItems.map((item) => (
            <MenuRow
              key={item.href}
              item={item}
              onClick={() => item.href !== '#' ? navigate(item.href) : undefined}
            />
          ))}
        </div>
      </section>

      {/* ── Danger — Logout ───────────────────────────────── */}
      <section>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                     border border-negative/30 text-negative text-sm font-semibold
                     hover:bg-negative/5 transition-colors min-h-[44px]"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          {t('profile.logoutThisDevice')}
        </button>
      </section>

      {/* App version */}
      <p className="text-[10px] text-muted text-center pb-4">
        {t('profile.versionFooter', { version: APP_VERSION })}
      </p>
    </div>
  )
}
