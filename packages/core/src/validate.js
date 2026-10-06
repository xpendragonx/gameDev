// Quick shape check every module's own test should run. Returns a list of problems.
const KNOWN = ['id', 'version', 'requires', 'config', 'init', 'tick', 'on', 'migrate'];

export function validateModule(m) {
  const errors = [];
  if (typeof m?.id !== 'string' || !m.id) errors.push('id must be a non-empty string');
  if (m?.version !== undefined && !Number.isInteger(m.version)) errors.push('version must be an integer');
  if (m?.requires !== undefined && !Array.isArray(m.requires)) errors.push('requires must be an array of module ids');
  for (const k of ['init', 'tick', 'migrate']) {
    if (m?.[k] !== undefined && typeof m[k] !== 'function') errors.push(`${k} must be a function`);
  }
  if (m?.on !== undefined && (typeof m.on !== 'object' || Object.values(m.on).some((f) => typeof f !== 'function'))) {
    errors.push('on must map event names to functions');
  }
  if ((m?.version ?? 1) > 1 && typeof m?.migrate !== 'function') errors.push('version > 1 requires migrate()');
  for (const k of Object.keys(m ?? {})) if (!KNOWN.includes(k)) errors.push(`unknown field "${k}"`);
  return errors;
}
