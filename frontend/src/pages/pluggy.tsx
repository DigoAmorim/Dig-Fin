import { useEffect, useMemo, useState } from 'react';
import { PluggyConnect } from 'react-pluggy-connect';
import { Landmark, RefreshCw, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../components/page-header.tsx';
import { Button } from '../components/ui/button.tsx';
import { pluggyApi, type PluggyAccount } from '../lib/pluggy-api.ts';
import { translateApiError } from '../lib/api-error.ts';

const STORAGE_KEY = 'digfin.pluggy.itemId';

export function Pluggy() {
  const { t, i18n } = useTranslation();
  const [connectToken, setConnectToken] = useState('');
  const [itemId, setItemId] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '');
  const [accounts, setAccounts] = useState<PluggyAccount[]>([]);
  const [error, setError] = useState('');
  const [isPreparing, setIsPreparing] = useState(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  const loadAccounts = async (nextItemId: string) => {
    if (!nextItemId) {
      setAccounts([]);
      return;
    }

    setIsLoadingAccounts(true);
    try {
      const response = await pluggyApi.listAccounts(nextItemId);
      setAccounts(response.results ?? []);
    } catch (loadError) {
      setError(translateApiError(loadError));
      setAccounts([]);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  useEffect(() => {
    if (!itemId) {
      setAccounts([]);
      return;
    }
    void loadAccounts(itemId);
  }, [itemId]);

  const startConnection = async () => {
    setError('');
    setIsPreparing(true);
    try {
      const token = await pluggyApi.createConnectToken(itemId || undefined);
      setConnectToken(token.accessToken);
    } catch (connectionError) {
      setError(translateApiError(connectionError));
    } finally {
      setIsPreparing(false);
    }
  };

  const handleSuccess = ({ item }: { item: { id: string } }) => {
    setItemId(item.id);
    localStorage.setItem(STORAGE_KEY, item.id);
    setConnectToken('');
    setError('');
  };

  const formattedAccounts = useMemo(
    () => accounts.map((account) => ({
      ...account,
      label: account.marketingName || account.name || 'Conta',
      balanceLabel: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: account.currencyCode || 'BRL',
      }).format(account.balance ?? 0),
    })),
    [accounts],
  );

  return <div className="space-y-4"><PageHeader section={t('pluggy.section')} title={t('pluggy.title')} />
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-start gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><Landmark size={20} /></div><div><h2 className="text-base font-semibold text-slate-900">{t('pluggy.connectTitle')}</h2><p className="mt-1 text-sm text-slate-500">{t('pluggy.connectDescription')}</p></div></div>
        <Button type="button" onClick={startConnection} disabled={isPreparing} className="gap-2"><RefreshCw size={15} className={isPreparing ? 'animate-spin' : ''} />{isPreparing ? t('pluggy.preparing') : itemId ? t('pluggy.reconnect') : t('pluggy.connect')}</Button>
        {connectToken && <PluggyConnect connectToken={connectToken} language={i18n.language === 'pt-BR' ? 'pt' : 'en'} includeSandbox onSuccess={handleSuccess} onError={({ message }) => { setError(message); setConnectToken(''); }} onClose={() => setConnectToken('')} />}
        {error && <p role="alert" className="mt-4 text-sm text-rose-600">{error}</p>}

        {itemId && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-800">Contas conectadas</h3>
            </div>

            {isLoadingAccounts ? (
              <p className="text-sm text-slate-500">Carregando contas...</p>
            ) : formattedAccounts.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">Nenhuma conta encontrada para este item.</p>
            ) : (
              <div className="space-y-3">
                {formattedAccounts.map((account) => (
                  <div key={account.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{account.label}</p>
                        {account.marketingName && account.marketingName !== account.name && (
                          <p className="text-xs text-slate-500">{account.marketingName}</p>
                        )}
                        {account.subtype && <p className="text-[11px] uppercase tracking-wide text-slate-400">{account.subtype}</p>}
                      </div>
                      <span className="text-right text-sm font-semibold text-emerald-700">{account.balanceLabel}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
      <aside className="rounded-xl border border-slate-200 bg-slate-50 p-5"><div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><ShieldCheck size={17} className="text-emerald-600" />{t('pluggy.securityTitle')}</div><p className="mt-2 text-sm leading-6 text-slate-600">{t('pluggy.securityDescription')}</p>{itemId && <p className="mt-4 break-all rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-500">{t('pluggy.itemLabel')}: {itemId}</p>}</aside>
    </div>
  </div>;
}
