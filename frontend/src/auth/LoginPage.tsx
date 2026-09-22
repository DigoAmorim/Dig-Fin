import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';

export function LoginPage() {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (isRegistering) await register(email, password);
      else await login(email, password);
    } catch {
      setError(isRegistering ? t('auth.registerError') : t('auth.loginError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#e2e8f0_0%,#cbd5e1_44%,#dcfce7_100%)] px-4 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.22)_0%,transparent_48%,rgba(187,247,208,0.22)_100%)]" aria-hidden="true" />
      <section className="relative w-full max-w-md rounded-2xl border border-white/70 bg-white/90 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-sm">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Dig Fin</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{isRegistering ? t('auth.registerTitle') : t('auth.loginTitle')}</h1>
          <p className="mt-2 text-sm text-slate-500">{isRegistering ? t('auth.registerDescription') : t('auth.loginDescription')}</p>
        </div>
        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            {t('auth.email')}
            <input aria-label={t('auth.email')} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            {t('auth.password')}
            <input aria-label={t('auth.password')} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="current-password" />
          </label>
          <button className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('common.loading') : isRegistering ? t('auth.registerAction') : t('auth.loginAction')}
          </button>
        </form>
        <button className="mt-5 w-full text-sm font-medium text-slate-500 hover:text-emerald-700" type="button" onClick={() => { setIsRegistering((current) => !current); setError(null); }}>
          {isRegistering ? t('auth.switchToLogin') : t('auth.switchToRegister')}
        </button>
      </section>
    </main>
  );
}