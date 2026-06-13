import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { useUser } from '@/hooks/useUser'
import { Skeleton } from '@/components/ui/Skeleton'
import { SectionLabel } from '@/design-system'
import { Pill } from '@/design-system'
import { APP_VERSION } from '@/lib/app-meta'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const clearToken = useAuthStore((s) => s.clearToken)
  const { data: user, isLoading, isError } = useUser()

  const handleLogout = () => {
    clearToken()
    localStorage.removeItem('wallet_theme')
    localStorage.removeItem('wallet_refresh_token')
    localStorage.removeItem('wallet_onboarding_done')
    window.location.href = '/login'
  }

  const menuItems = [
    { label: t('profile.menuExport'), meta: t('profile.menuExportMeta'), href: '/export' },
    { label: t('profile.menuRecurring'), meta: t('profile.menuRecurringMeta'), href: '/recurring' },
    { label: t('profile.menuBudget'), meta: t('profile.menuBudgetMeta'), href: '/budgets' },
  ]

  return (
    <div className="page-enter space-y-6">
      {/* Page header — one page-title recipe (serif italic + mono eyebrow) */}
      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-secondary mb-0.5">{t('profile.account')}</p>
        <h2 className="font-display italic text-2xl text-primary leading-tight">{t('profile.title')}</h2>
      </div>

      {/* ── Profile section ──────────────────────────────── */}
      <section className="space-y-3">
        <SectionLabel>{t('profile.profileSection')}</SectionLabel>

        <div className="bg-surface border border-border rounded-lg p-4">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ) : user ? (
            <div className="flex items-center gap-3">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name ?? 'Avatar'}
                  className="w-12 h-12 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-xl text-accent font-mono font-bold">
                  {(user.name ?? user.email ?? '?')[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">
                  {user.name ?? t('profile.noName')}
                </p>
                <p className="font-mono text-[11px] text-muted truncate">{user.email}</p>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-surface-2 text-muted shrink-0">
                {user.provider ?? 'local'}
              </span>
            </div>
          ) : (
            <div className="text-center space-y-2 py-2">
              {isError ? (
                <>
                  <p className="text-sm text-negative">{t('profile.loadError')}</p>
                  <button
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['user-profile'] })}
                    className="font-mono text-[11px] text-accent hover:underline"
                  >
                    {t('common.retry')}
                  </button>
                </>
              ) : (
                <p className="text-sm text-muted">{t('profile.loadFailed')}</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Preferences section ──────────────────────────── */}
      <section className="space-y-3">
        <SectionLabel>{t('profile.preferences')}</SectionLabel>

        <div className="bg-surface border border-border rounded-lg divide-y divide-border">
          {menuItems.map((item) => (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-2 transition-colors"
            >
              <span className="text-sm text-primary">{item.label}</span>
              <span className="font-mono text-[11px] text-muted">{item.meta}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Connected accounts section ───────────────────── */}
      <section className="space-y-3">
        <SectionLabel>{t('profile.connectedAccounts')}</SectionLabel>

        <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
          {user?.provider ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary capitalize">{user.provider}</span>
              <span className="font-mono text-[11px] text-positive">{t('profile.linked')}</span>
            </div>
          ) : (
            <p className="font-mono text-[11px] text-muted">{t('profile.noLinkedAccounts')}</p>
          )}
        </div>
      </section>

      {/* ── Danger zone ──────────────────────────────────── */}
      <section className="space-y-3">
        <SectionLabel>{t('profile.dangerZone')}</SectionLabel>

        <div className="bg-surface border border-negative/40 rounded-lg p-4 space-y-3">
          <p className="font-mono text-[11px] text-muted leading-relaxed">
            {t('profile.logoutDesc')}
          </p>
          <Pill ghost onClick={handleLogout} className="text-negative shadow-[inset_0_0_0_1px_rgb(var(--color-negative)/0.5)] hover:bg-negative/5">
            {t('profile.logoutThisDevice')}
          </Pill>
        </div>
      </section>

      {/* App version */}
      <p className="font-mono text-[10px] text-faint text-center pb-2">
        {t('profile.versionFooter', { version: APP_VERSION })}
      </p>
    </div>
  )
}
