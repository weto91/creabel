// Pantallas de acceso: configuración inicial, inicio de sesión y error de arranque.
import { h, clear, icon } from '../dom.js';
import { t } from '../i18n.js';
import { api } from '../api.js';
import { session } from '../session.js';
import { btn, modal, errorText } from '../ui.js';

function authCard(...children) {
  return h('div.auth-screen',
    h('div.auth-card',
      h('div.auth-brand', h('img', { src: 'assets/img/favicon.svg', alt: '', width: 44, height: 44 }), h('h1', 'Creabel')),
      children));
}

function passwordInput(placeholder, autocomplete) {
  return h('input.input', { type: 'password', placeholder, autocomplete, 'aria-label': placeholder });
}

/** Se resuelve cuando el usuario ha configurado el acceso o ha iniciado sesión. */
export function authFlow(status) {
  return new Promise((resolve) => {
    const app = document.getElementById('app');
    const errorEl = h('p.form-error', { hidden: true, role: 'alert' });
    const showError = (msg) => { errorEl.textContent = msg; errorEl.hidden = !msg; };

    const drawSetup = () => {
      const pw1 = passwordInput(t('auth.newPassword'), 'new-password');
      const pw2 = passwordInput(t('auth.repeatPassword'), 'new-password');
      const noPw = h('input', { type: 'checkbox' });
      noPw.addEventListener('change', () => { pw1.disabled = pw2.disabled = noPw.checked; });
      const form = h('form.form', { onsubmit: async (e) => {
        e.preventDefault();
        showError('');
        if (!noPw.checked) {
          if (pw1.value.length < 6) return showError(t('error.weak_password'));
          if (pw1.value !== pw2.value) return showError(t('auth.mismatch'));
        }
        try {
          await api.post('auth/setup', noPw.checked ? { mode: 'none' } : { mode: 'password', password: pw1.value });
          session.mode = noPw.checked ? 'none' : 'password';
          resolve();
        } catch (err) { showError(errorText(err)); }
      } },
        h('p.auth-text', t('auth.setupIntro')),
        h('label.form-row', h('span.form-label', t('auth.newPassword')), pw1),
        h('label.form-row', h('span.form-label', t('auth.repeatPassword')), pw2),
        h('label.form-check', noPw, h('span', t('auth.noPassword'))),
        errorEl,
        btn(t('auth.start'), { kind: 'primary', type: 'submit' }));
      clear(app).append(authCard(h('h2', t('auth.setupTitle')), form));
      pw1.focus();
    };

    const drawLogin = () => {
      const pw = passwordInput(t('auth.password'), 'current-password');
      const form = h('form.form', { onsubmit: async (e) => {
        e.preventDefault();
        showError('');
        try {
          await api.post('auth/login', { password: pw.value });
          resolve();
        } catch (err) { showError(errorText(err)); pw.select(); }
      } },
        h('label.form-row', h('span.form-label', t('auth.password')), pw),
        errorEl,
        btn(t('auth.login'), { kind: 'primary', type: 'submit' }));
      clear(app).append(authCard(h('h2', t('auth.loginTitle')), form));
      pw.focus();
    };

    if (!status.configured) drawSetup();
    else drawLogin();
  });
}

/** Vuelve a pedir la contraseña sin perder la página actual (sesión caducada mientras se escribía). */
export function loginOverlay() {
  return new Promise((resolve) => {
    let ok = false;
    const pw = passwordInput(t('auth.password'), 'current-password');
    const errorEl = h('p.form-error', { hidden: true, role: 'alert' });
    const submit = async () => {
      try {
        await api.post('auth/login', { password: pw.value });
        ok = true;
        m.close();
        resolve(true);
      } catch (err) {
        errorEl.textContent = errorText(err);
        errorEl.hidden = false;
        pw.select();
      }
    };
    const form = h('form.form', { onsubmit: (e) => { e.preventDefault(); submit(); } },
      h('p.modal-text', t('auth.expired')),
      h('label.form-row', h('span.form-label', t('auth.password')), pw),
      errorEl);
    const m = modal({
      title: t('auth.loginTitle'), body: form,
      actions: [btn(t('auth.login'), { kind: 'primary', onClick: submit })],
      onClose: () => { if (!ok) resolve(false); },
    });
  });
}

/** Error que impide arrancar (sin base de datos, sin servidor...). */
export function fatalScreen(err) {
  const app = document.getElementById('app');
  const code = (err && err.code) || '';
  const detail = h('pre.error-detail', ((err && err.message) || errorText(err)) + (code ? `  [${code}]` : ''));
  const retry = (kind) => btn(t('common.retry'), { kind, icon: 'history', onClick: () => location.reload() });

  if (code === 'local_only') {
    clear(app).append(authCard(h('h2', t('fatal.localTitle')), h('p.auth-text', t('fatal.localText'))));
    return;
  }

  if (code !== 'db_connection') {
    clear(app).append(authCard(
      h('h2', t('fatal.title')),
      h('p.auth-text', code === 'no_config' ? t('error.no_config') : t('fatal.text')),
      detail,
      retry('primary')));
    return;
  }

  // Sin conexión a la base de datos: la aplicación puede crearla si se le da una cuenta
  // de administrador de MariaDB (la escribe el usuario; no se guarda en ningún sitio).
  const user = h('input.input', { type: 'text', autocomplete: 'off', spellcheck: 'false', 'aria-label': t('fatal.dbAdminUser') });
  user.value = 'root';
  const pw = passwordInput(t('fatal.dbAdminPassword'), 'off');
  const errorEl = h('p.form-error', { hidden: true, role: 'alert' });
  const submit = btn(t('fatal.dbCreate'), { kind: 'primary', type: 'submit', icon: 'check' });
  const form = h('form.form', { onsubmit: async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    submit.disabled = true;
    try {
      await api.post('install/database', { user: user.value.trim() || 'root', password: pw.value });
      location.reload();
    } catch (e2) {
      errorEl.textContent = (e2 && e2.message) || errorText(e2);
      errorEl.hidden = false;
      submit.disabled = false;
    }
  } },
    h('label.form-row', h('span.form-label', t('fatal.dbAdminUser')), user),
    h('label.form-row', h('span.form-label', t('fatal.dbAdminPassword')), pw),
    errorEl,
    submit);

  clear(app).append(authCard(
    h('h2', t('fatal.dbTitle')),
    h('p.auth-text', t('fatal.dbText')),
    form,
    h('details.auth-details',
      h('summary', t('fatal.dbManual')),
      h('ol.auth-steps', h('li', t('fatal.dbStep1')), h('li', t('fatal.dbStep2')), h('li', t('fatal.dbStep3'))),
      detail,
      retry('default'))));
}
