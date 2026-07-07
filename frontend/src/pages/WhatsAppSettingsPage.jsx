import { useEffect, useState } from 'react'
import ScreenHeader from '@/components/ScreenHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  getNotificationSettings,
  updateNotificationSettings,
} from '@/services/notificationService'

const LOCAL_PREFS_KEY = 'finpme_alert_prefs'

// Alertas ainda sem campo no backend — guardados localmente por enquanto.
const LOCAL_ALERTS = [
  { key: 'weeklySummary', title: 'Resumo semanal', subtitle: 'Toda segunda às 8h' },
  { key: 'dasnReminder', title: 'Lembrete DASN-SIMEI', subtitle: 'Aviso antes do prazo da declaração anual' },
  { key: 'monthlySummary', title: 'Resumo mensal', subtitle: 'Fechamento do mês no primeiro dia útil' },
  { key: 'debtorReminders', title: 'Cobrança de devedores', subtitle: 'Lembrete quando uma dívida vencer' },
]

const LIMIT_ALERTS = [
  { key: 'alert70Pct', title: 'Avisar aos 70% do limite', subtitle: 'Primeiro sinal de atenção' },
  { key: 'alert85Pct', title: 'Avisar aos 85% do limite', subtitle: 'Hora de acompanhar de perto' },
  { key: 'alert95Pct', title: 'Avisar aos 95% do limite', subtitle: 'Alerta máximo' },
]

function loadLocalPrefs() {
  try {
    return {
      weeklySummary: true,
      dasnReminder: true,
      monthlySummary: true,
      debtorReminders: true,
      ...JSON.parse(localStorage.getItem(LOCAL_PREFS_KEY) ?? '{}'),
    }
  } catch {
    return { weeklySummary: true, dasnReminder: true, monthlySummary: true, debtorReminders: true }
  }
}

function ToggleRow({ title, subtitle, checked, onCheckedChange }) {
  return (
    <li className="flex items-center gap-3 p-4">
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-text-muted">{subtitle}</span>
      </span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </li>
  )
}

function WhatsAppSettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState(null)
  const [number, setNumber] = useState('')
  const [localPrefs, setLocalPrefs] = useState(loadLocalPrefs)
  const [savingNumber, setSavingNumber] = useState(false)

  useEffect(() => {
    let cancelled = false

    getNotificationSettings()
      .then((data) => {
        if (cancelled) return
        setSettings(data)
        setNumber(data.whatsappNumber ?? '')
      })
      .catch(() => {
        toast({ variant: 'destructive', title: 'Não foi possível carregar suas preferências' })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [toast])

  async function patchBackend(patch) {
    const previous = settings
    setSettings((prev) => ({ ...prev, ...patch }))
    try {
      const updated = await updateNotificationSettings(patch)
      setSettings(updated)
    } catch {
      setSettings(previous)
      toast({ variant: 'destructive', title: 'Não deu certo, tente de novo' })
    }
  }

  function toggleLocal(key, value) {
    const next = { ...localPrefs, [key]: value }
    setLocalPrefs(next)
    localStorage.setItem(LOCAL_PREFS_KEY, JSON.stringify(next))
  }

  async function handleSaveNumber() {
    setSavingNumber(true)
    try {
      const updated = await updateNotificationSettings({ whatsappNumber: number.trim() })
      setSettings(updated)
      toast({ variant: 'success', title: 'Número salvo!' })
    } catch {
      toast({ variant: 'destructive', title: 'Não deu certo, tente de novo' })
    } finally {
      setSavingNumber(false)
    }
  }

  if (loading) {
    return (
      <div>
        <ScreenHeader title="Alertas no WhatsApp" backTo="/mais" />
        <div className="flex flex-col gap-3 px-5 pt-3">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <ScreenHeader title="Alertas no WhatsApp" backTo="/mais" />

      <div className="flex flex-col gap-6 px-5 pt-3 pb-6">
        <div>
          <Label htmlFor="whats-number">Seu número</Label>
          <div className="mt-2 flex gap-2">
            <Input
              id="whats-number"
              inputMode="tel"
              placeholder="Ex: 11 99999-0000"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              maxLength={20}
            />
            <Button onClick={handleSaveNumber} disabled={savingNumber}>
              {savingNumber ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
          <p className="mt-2 text-xs text-text-muted">
            É para esse número que enviaremos seus avisos.
          </p>
        </div>

        <section>
          <h2 className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Limite de faturamento
          </h2>
          <ul className="divide-y rounded-lg border bg-surface">
            {LIMIT_ALERTS.map(({ key, title, subtitle }) => (
              <ToggleRow
                key={key}
                title={title}
                subtitle={subtitle}
                checked={settings?.[key] ?? true}
                onCheckedChange={(value) => patchBackend({ [key]: value })}
              />
            ))}
          </ul>
        </section>

        <section>
          <h2 className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Resumos e lembretes
          </h2>
          <ul className="divide-y rounded-lg border bg-surface">
            {LOCAL_ALERTS.map(({ key, title, subtitle }) => (
              <ToggleRow
                key={key}
                title={title}
                subtitle={subtitle}
                checked={localPrefs[key]}
                onCheckedChange={(value) => toggleLocal(key, value)}
              />
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

export default WhatsAppSettingsPage
