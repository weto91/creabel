// Apartados de Ajustes: [clave, icono]. Los comparten el menú lateral y la página de ajustes.
import { isApp, isSecondaryWindow } from './platform.js';

const ALL_SECTIONS = [
  ['language', 'globe'],
  ['appearance', 'palette'],
  ['mobilebar', 'menu'],
  ['editor', 'edit'],
  ['data', 'trash'],
  ['sync', 'sync'],
  ['security', 'lock'],
  ['info', 'server'],
  ['about', 'info'],
];

// En la aplicación no hay servidor: ni contraseña de acceso ni datos de la red; la
// sincronización, en cambio, solo existe en la aplicación (y se maneja desde la ventana
// principal: las que se abren con «Abrir en una ventana nueva» no la tienen).
export const SETTINGS_SECTIONS = isApp
  ? ALL_SECTIONS.filter(([key]) => key !== 'security' && key !== 'info' && !(isSecondaryWindow && key === 'sync'))
  : ALL_SECTIONS.filter(([key]) => key !== 'sync');

export const settingsSection = (key) => (SETTINGS_SECTIONS.some(([k]) => k === key) ? key : SETTINGS_SECTIONS[0][0]);
