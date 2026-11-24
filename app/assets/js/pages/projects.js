// Lista de proyectos (novelas).
import { h, clear, icon } from '../dom.js';
import { t, tn } from '../i18n.js';
import { api } from '../api.js';
import { formatTimestamp, formatDate } from '../text.js';
import { btn, pageHeader, emptyState, formDialog, confirmDialog, promptDialog, menuButton, toast, errorText } from '../ui.js';
import { PROJECT_LANGUAGES, projectLangFor } from '../model.js';
import { downloadBackup, readBackupFile, backupSummary, importBackup, createSequel, backupsDue } from '../backup.js';
import { getLang } from '../i18n.js';
import { isApp } from '../platform.js';
import { syncAvailable, syncTargets } from '../local/syncer.js';

export function projectFields(p) {
  return [
    { name: 'name', label: t('project.name'), value: p ? p.name : '', required: true, placeholder: t('project.namePlaceholder') },
    { name: 'author', label: t('project.author'), value: p ? p.author : '' },
    { name: 'language', label: t('project.language'), type: 'select', value: p ? p.language : projectLangFor(getLang()), hint: t('project.languageHint'), options: PROJECT_LANGUAGES.map(([value, label]) => ({ value, label })) },
  ];
}

export async function projectsPage({ el, refresh }) {
  const projects = await api.get('projects');

  const busy = async (message, fn) => {
    toast(message, 'info', 2500);
    try {
      await fn();
    } catch (err) {
      toast(errorText(err), 'error', 6000);
    }
  };

  const create = async () => {
    const out = await formDialog({ title: t('projects.new'), fields: projectFields(null), submitLabel: t('common.create') });
    if (!out) return;
    try {
      const p = await api.post('projects', out);
      location.hash = `#/p/${p.id}`;
    } catch (err) {
      toast(errorText(err), 'error');
    }
  };

  // Restaurar una copia: el .zip completo (o el .json de las copias anteriores). Antes se enseña
  // lo que trae; siempre se crea un proyecto nuevo, sin tocar los que ya hay.
  const fileInput = h('input', { type: 'file', accept: '.zip,.json,application/zip,application/json', hidden: true });
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    fileInput.value = '';
    if (!file) return;
    let backup;
    try {
      backup = await readBackupFile(file);
    } catch (err) {
      toast(t('backup.badFileNamed', { name: file.name }), 'error', 8000);
      return;
    }
    const s = backupSummary(backup);
    const taken = projects.some((p) => p.name.trim().toLowerCase() === s.name.trim().toLowerCase());
    const day = s.exported ? formatDate(s.exported.slice(0, 10), { day: 'numeric', month: 'numeric', year: 'numeric' }) : '';
    const intro = [
      s.exported ? t('backup.restoreFrom', { name: s.name, date: formatTimestamp(s.exported) }) : t('backup.restoreFromUndated', { name: s.name }),
      t('backup.restoreCounts', {
        chapters: tn('count.chapters', s.chapters), scenes: tn('count.scenes', s.scenes),
        sheets: tn('backup.sheets', s.sheets), files: tn('backup.files', s.files),
      }),
      s.unavailable ? tn('backup.restoreNoFiles', s.unavailable) : '',
      t('backup.restoreNew'),
    ].filter(Boolean).join(' ');
    const out = await formDialog({
      title: t('backup.restoreTitle'), intro,
      fields: [{ name: 'name', label: t('project.name'), value: taken && day ? t('backup.restoredName', { name: s.name, date: day }) : s.name, required: true }],
      submitLabel: t('backup.restoreRun'),
    });
    if (!out) return;
    await busy(t('projects.importing'), async () => {
      const report = { files: 0, failed: [] };
      const pid = await importBackup(backup, { name: out.name, report });
      if (report.failed.length) toast(t(report.reason ? 'backup.restoredMissingWhy' : 'backup.restoredMissing', { list: report.failed.join(', '), reason: report.reason || '' }), 'error', 15000);
      else toast(t('projects.imported'), 'success');
      location.hash = `#/p/${pid}`;
    });
  });

  // La portada del proyecto, si tiene; si no (o si la imagen no carga), el icono de siempre.
  const projectCover = (p) => {
    const fallback = () => h('span.project-card-icon', icon('book', 26));
    let data = p.data;
    if (typeof data === 'string') { try { data = JSON.parse(data); } catch (err) { data = null; } }
    if (!data || !data.cover) return fallback();
    const img = h('img.project-card-cover', { src: api.imageUrl({ id: data.cover }), alt: '', loading: 'lazy' });
    img.addEventListener('error', () => img.replaceWith(fallback()));
    return img;
  };

  const synced = isApp && syncAvailable() && syncTargets().length > 0;
  const card = (p) => h('article.project-card',
    h('a.project-card-main', { href: `#/p/${p.id}` },
      projectCover(p),
      h('h2', p.name),
      p.author ? h('p.project-card-author', p.author) : null,
      h('p.project-card-meta', `${tn('count.words', p.words || 0)} · ${tn('count.chapters', p.chapters || 0)}`),
      h('p.project-card-date', t('projects.updated', { date: formatTimestamp(p.updated_at) }),
        // Con alguna conexión, todos los proyectos se sincronizan (Ajustes → Sincronización).
        synced ? h('span.project-card-sync', { title: t('sync.badge') }, icon('sync', 13)) : null)),
    h('div.project-card-menu', menuButton(() => [
      { label: t('projects.backup'), icon: 'download', onClick: () => busy(t('projects.exporting'), () => downloadBackup(p.id)) },
      { label: t('projects.sequel'), icon: 'copy', onClick: async () => {
        const name = await promptDialog({ title: t('projects.sequel'), label: t('projects.sequelName'), value: t('projects.sequelDefault', { name: p.name }), submitLabel: t('common.create') });
        if (!name) return;
        await busy(t('projects.creatingSequel'), async () => {
          const pid = await createSequel(p.id, name);
          location.hash = `#/p/${pid}`;
        });
      } },
      { label: t('common.delete'), icon: 'trash', danger: true, onClick: async () => {
        if (!(await confirmDialog(t('projects.confirmDelete', { name: p.name }), { danger: true, confirmLabel: t('common.delete') }))) return;
        try {
          await api.post(`projects/${p.id}/delete`);
          refresh();
        } catch (err) { toast(errorText(err), 'error'); }
      } },
    ])));

  // Aviso de copias: proyectos que han cambiado y llevan días sin copia de seguridad.
  const due = backupsDue(projects);
  const reminder = due.length ? h('section.panel.backup-reminder',
    h('div.backup-reminder-head', icon('download', 18), h('h3', t('backup.reminderTitle'))),
    due.map(({ project, days, never }) => h('div.backup-reminder-row',
      h('span', never ? tn('backup.never', days, { name: project.name }) : tn('backup.daysSince', days, { name: project.name })),
      btn(t('backup.now'), { icon: 'download', small: true, kind: 'primary', onClick: () => busy(t('projects.exporting'), async () => { await downloadBackup(project.id); refresh(); }) }))),
    h('p.muted', h('a', { href: '#/settings/data' }, t('backup.settingsLink')))) : null;

  clear(el);
  el.append(
    pageHeader({
      title: t('projects.title'), subtitle: t('projects.subtitle'),
      actions: [
        btn(t('nav.trash'), { icon: 'trash', href: '#/trash' }),
        btn(t('projects.import'), { icon: 'upload', onClick: () => fileInput.click() }),
        btn(t('projects.new'), { icon: 'plus', kind: 'primary', onClick: create }),
      ],
    }),
    fileInput,
    ...[reminder].filter(Boolean),
    projects.length
      ? h('div.project-grid', projects.map(card))
      : emptyState(t('projects.empty'), btn(t('projects.new'), { icon: 'plus', kind: 'primary', onClick: create }), 'feather'));
}
