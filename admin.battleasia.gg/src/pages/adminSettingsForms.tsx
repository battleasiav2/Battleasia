import type { ReactNode } from 'react';
import type { SettingsFormId } from '../lib/catalog';
import { useI18n } from '../lib/i18n';

export type SettingsFormState = Record<string, unknown>;

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="field">
      {label}
      {children}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

function Check({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="field field-check">
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export function normalizeSettingsLoad(form: SettingsFormId, payload: unknown): SettingsFormState {
  const raw = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  switch (form) {
    case 'referral': {
      const inner =
        raw.referralSettings && typeof raw.referralSettings === 'object'
          ? (raw.referralSettings as Record<string, unknown>)
          : raw;
      return { commissionRate: Number(inner.commissionRate) || 0 };
    }
    case 'transfer': {
      const ts =
        raw.transferSettings && typeof raw.transferSettings === 'object'
          ? (raw.transferSettings as Record<string, unknown>)
          : raw;
      return {
        enabled: ts.enabled !== false,
        feePercent: Number(ts.feePercent) || 0,
        minAmount: Number(ts.minAmount) || 1,
        maxAmount: Number(ts.maxAmount) || 10000,
      };
    }
    case 'profileSocial':
      return { ...(raw as SettingsFormState) };
    case 'liveChat':
    case 'messaging':
    case 'engagement':
      return { ...(raw as SettingsFormState) };
    default:
      return {};
  }
}

export function buildSettingsPutBody(form: SettingsFormId, state: SettingsFormState): Record<string, unknown> {
  switch (form) {
    case 'referral':
      return { commissionRate: Number(state.commissionRate) || 0 };
    case 'transfer':
      return {
        enabled: state.enabled !== false,
        feePercent: Number(state.feePercent) || 0,
        minAmount: Number(state.minAmount) || 1,
        maxAmount: Number(state.maxAmount) || 10000,
      };
    case 'profileSocial':
    case 'liveChat':
    case 'messaging':
    case 'engagement':
      return { ...state };
    default:
      return {};
  }
}

type FormProps = {
  form: SettingsFormId;
  state: SettingsFormState;
  disabled?: boolean;
  onChange: (next: SettingsFormState) => void;
};

export function AdminSettingsFormFields({ form, state, disabled, onChange }: FormProps) {
  const { t } = useI18n();
  const set = (key: string, value: unknown) => onChange({ ...state, [key]: value });

  if (form === 'referral') {
    return (
      <Field label={t('settings.referralCommission')} hint={t('settings.referralCommissionHint')}>
        <input
          type="number"
          min={0}
          max={100}
          step={0.1}
          disabled={disabled}
          value={Number(state.commissionRate) || 0}
          onChange={(e) => set('commissionRate', Number(e.target.value))}
        />
      </Field>
    );
  }

  if (form === 'transfer') {
    return (
      <div className="admin-form-grid">
        <Check
          label={t('settings.transferEnabled')}
          checked={state.enabled !== false}
          disabled={disabled}
          onChange={(v) => set('enabled', v)}
        />
        <Field label={t('settings.transferFee')}>
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            disabled={disabled}
            value={Number(state.feePercent) || 0}
            onChange={(e) => set('feePercent', Number(e.target.value))}
          />
        </Field>
        <Field label={t('settings.transferMin')}>
          <input
            type="number"
            min={0.01}
            step={0.01}
            disabled={disabled}
            value={Number(state.minAmount) || 0}
            onChange={(e) => set('minAmount', Number(e.target.value))}
          />
        </Field>
        <Field label={t('settings.transferMax')}>
          <input
            type="number"
            min={1}
            step={1}
            disabled={disabled}
            value={Number(state.maxAmount) || 0}
            onChange={(e) => set('maxAmount', Number(e.target.value))}
          />
        </Field>
      </div>
    );
  }

  if (form === 'profileSocial') {
    return (
      <>
        <div className="form-toggles">
          <Check
            label={t('settings.showMutual')}
            checked={state.showMutualFollowers !== false}
            disabled={disabled}
            onChange={(v) => set('showMutualFollowers', v)}
          />
          <Check
            label={t('settings.showSuggested')}
            checked={state.showSuggestedFollows !== false}
            disabled={disabled}
            onChange={(v) => set('showSuggestedFollows', v)}
          />
          <Check
            label={t('settings.showRecent')}
            checked={state.showRecentFollows !== false}
            disabled={disabled}
            onChange={(v) => set('showRecentFollows', v)}
          />
          <Check
            label={t('settings.autoSuggest')}
            checked={state.autoSuggestEnabled !== false}
            disabled={disabled}
            onChange={(v) => set('autoSuggestEnabled', v)}
          />
        </div>
        <div className="admin-form-grid">
          <Field label={t('settings.suggestedLimit')}>
            <input
              type="number"
              min={1}
              max={20}
              disabled={disabled}
              value={Number(state.suggestedLimit) || 8}
              onChange={(e) => set('suggestedLimit', Number(e.target.value))}
            />
          </Field>
          <Field label={t('settings.mutualLimit')}>
            <input
              type="number"
              min={1}
              max={10}
              disabled={disabled}
              value={Number(state.mutualFollowersLimit) || 3}
              onChange={(e) => set('mutualFollowersLimit', Number(e.target.value))}
            />
          </Field>
          <Field label={t('settings.recentLimit')}>
            <input
              type="number"
              min={1}
              max={20}
              disabled={disabled}
              value={Number(state.recentFollowsLimit) || 6}
              onChange={(e) => set('recentFollowsLimit', Number(e.target.value))}
            />
          </Field>
        </div>
        <Field label={t('settings.pinnedUsers')} hint={t('settings.pinnedUsersHint')}>
          <input
            disabled={disabled}
            value={
              Array.isArray(state.pinnedUserIds)
                ? (state.pinnedUserIds as string[]).join(', ')
                : String(state.pinnedUserIds || '')
            }
            onChange={(e) =>
              set(
                'pinnedUserIds',
                e.target.value
                  .split(/[,\s]+/)
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
          />
        </Field>
      </>
    );
  }

  if (form === 'liveChat') {
    const links = Array.isArray(state.socialLinks) ? (state.socialLinks as Array<Record<string, string>>) : [];
    return (
      <>
        <Check
          label={t('settings.liveChatEnabled')}
          checked={state.enabled !== false}
          disabled={disabled}
          onChange={(v) => set('enabled', v)}
        />
        <div className="admin-form-grid">
          <Field label={t('settings.agentName')}>
            <input
              disabled={disabled}
              value={String(state.agentName || '')}
              onChange={(e) => set('agentName', e.target.value)}
            />
          </Field>
          <Field label={t('settings.agentTitle')}>
            <input
              disabled={disabled}
              value={String(state.agentTitle || '')}
              onChange={(e) => set('agentTitle', e.target.value)}
            />
          </Field>
          <Field label={t('settings.logoUrl')}>
            <input
              disabled={disabled}
              value={String(state.logoUrl || '')}
              onChange={(e) => set('logoUrl', e.target.value)}
            />
          </Field>
          <Field label={t('settings.agentAvatar')}>
            <input
              disabled={disabled}
              value={String(state.agentAvatar || '')}
              onChange={(e) => set('agentAvatar', e.target.value)}
            />
          </Field>
        </div>
        <Field label={t('settings.welcomeMessage')}>
          <textarea
            rows={3}
            disabled={disabled}
            value={String(state.welcomeMessage || '')}
            onChange={(e) => set('welcomeMessage', e.target.value)}
          />
        </Field>
        <h3 className="admin-lead">{t('settings.socialLinks')}</h3>
        <div className="dash-stage form-stage" style={{ display: 'grid', gap: 10 }}>
          {links.map((link, i) => (
            <div key={link.href || i} className="admin-form-grid">
              <Field label={t('settings.linkLabel')}>
                <input
                  disabled={disabled}
                  value={String(link.label || '')}
                  onChange={(e) => {
                    const next = links.map((row, idx) => (idx === i ? { ...row, label: e.target.value } : row));
                    set('socialLinks', next);
                  }}
                />
              </Field>
              <Field label={t('settings.linkUrl')}>
                <input
                  disabled={disabled}
                  value={String(link.href || '')}
                  onChange={(e) => {
                    const next = links.map((row, idx) => (idx === i ? { ...row, href: e.target.value } : row));
                    set('socialLinks', next);
                  }}
                />
              </Field>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (form === 'messaging') {
    const providers = Array.isArray(state.providers)
      ? (state.providers as Array<Record<string, unknown>>)
      : [];
    return (
      <>
        <div className="form-toggles">
          <Check
            label={t('settings.builtinChat')}
            checked={state.builtinEnabled !== false}
            disabled={disabled}
            onChange={(v) => set('builtinEnabled', v)}
          />
          <Check
            label={t('settings.allowProviderChoice')}
            checked={state.allowUserChoice !== false}
            disabled={disabled}
            onChange={(v) => set('allowUserChoice', v)}
          />
        </div>
        <Field label={t('settings.defaultProvider')}>
          <select
            disabled={disabled}
            value={String(state.defaultProviderId || 'builtin')}
            onChange={(e) => set('defaultProviderId', e.target.value)}
          >
            {providers.map((p) => (
              <option key={String(p.id)} value={String(p.id)}>
                {String(p.label || p.id)}
              </option>
            ))}
          </select>
        </Field>
        <h3 className="admin-lead">{t('settings.providers')}</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('settings.providerOn')}</th>
                <th>{t('settings.providerName')}</th>
                <th>{t('settings.linkUrl')}</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p, i) => (
                <tr key={String(p.id)}>
                  <td>
                    <input
                      type="checkbox"
                      disabled={disabled || p.type === 'builtin'}
                      checked={p.enabled !== false}
                      onChange={(e) => {
                        const next = providers.map((row, idx) =>
                          idx === i ? { ...row, enabled: e.target.checked } : row,
                        );
                        set('providers', next);
                      }}
                    />
                  </td>
                  <td>{String(p.label || p.id)}</td>
                  <td>
                    {p.type === 'builtin' ? (
                      <span className="admin-muted">—</span>
                    ) : (
                      <input
                        disabled={disabled}
                        value={String(p.url || '')}
                        onChange={(e) => {
                          const next = providers.map((row, idx) =>
                            idx === i ? { ...row, url: e.target.value } : row,
                          );
                          set('providers', next);
                        }}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  if (form === 'engagement') {
    return (
      <>
        <div className="form-toggles">
          <Check
            label={t('settings.engagementEnabled')}
            checked={state.enabled !== false}
            disabled={disabled}
            onChange={(v) => set('enabled', v)}
          />
          <Check
            label={t('settings.streakEnabled')}
            checked={state.streakEnabled !== false}
            disabled={disabled}
            onChange={(v) => set('streakEnabled', v)}
          />
          <Check
            label={t('settings.dailyMissions')}
            checked={state.dailyMissionsEnabled !== false}
            disabled={disabled}
            onChange={(v) => set('dailyMissionsEnabled', v)}
          />
          <Check
            label={t('settings.badgesEnabled')}
            checked={state.badgesEnabled !== false}
            disabled={disabled}
            onChange={(v) => set('badgesEnabled', v)}
          />
          <Check
            label={t('settings.smartNotifications')}
            checked={state.smartNotificationsEnabled !== false}
            disabled={disabled}
            onChange={(v) => set('smartNotificationsEnabled', v)}
          />
        </div>
        <div className="admin-form-grid">
          <Field label={t('settings.dailyMissionsCount')}>
            <input
              type="number"
              min={1}
              max={20}
              disabled={disabled}
              value={Number(state.dailyMissionsCount) || 0}
              onChange={(e) => set('dailyMissionsCount', Number(e.target.value))}
            />
          </Field>
          <Field label={t('settings.dailyLoginReward')}>
            <input
              type="number"
              min={0}
              disabled={disabled}
              value={Number(state.dailyLoginReward) || 0}
              onChange={(e) => set('dailyLoginReward', Number(e.target.value))}
            />
          </Field>
          <Field label={t('settings.welcomeBonus')}>
            <input
              type="number"
              min={0}
              disabled={disabled}
              value={Number(state.welcomeBonus) || 0}
              onChange={(e) => set('welcomeBonus', Number(e.target.value))}
            />
          </Field>
          <Field label={t('settings.firstMatchBonus')}>
            <input
              type="number"
              min={0}
              disabled={disabled}
              value={Number(state.firstMatchBonus) || 0}
              onChange={(e) => set('firstMatchBonus', Number(e.target.value))}
            />
          </Field>
          <Field label={t('settings.streakBonusDay')}>
            <input
              type="number"
              min={0}
              disabled={disabled}
              value={Number(state.streakBonusPerDay) || 0}
              onChange={(e) => set('streakBonusPerDay', Number(e.target.value))}
            />
          </Field>
          <Field label={t('settings.maxStreakBonus')}>
            <input
              type="number"
              min={0}
              disabled={disabled}
              value={Number(state.maxStreakBonus) || 0}
              onChange={(e) => set('maxStreakBonus', Number(e.target.value))}
            />
          </Field>
        </div>
        <Field label={t('settings.earnTabTitle')}>
          <input
            disabled={disabled}
            value={String(state.earnTabTitle || '')}
            onChange={(e) => set('earnTabTitle', e.target.value)}
          />
        </Field>
        <Field label={t('settings.earnTabSubtitle')}>
          <textarea
            rows={2}
            disabled={disabled}
            value={String(state.earnTabSubtitle || '')}
            onChange={(e) => set('earnTabSubtitle', e.target.value)}
          />
        </Field>
        <p className="field-hint">{t('settings.engagementNestedHint')}</p>
      </>
    );
  }

  return null;
}
