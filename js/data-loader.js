// FILE: js/data-loader.js | VERSION: v10.5 Stable
window.MallasData = {};

window.normalizarTexto = function(texto) {
    if (!texto) return "";
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

async function asegurarDatosGrado(areaKey, grado) {
  const config = window.APP_CONFIG;
  const area = config.AREAS[areaKey];
  const gradoStr = String(grado).trim();
  const tipo = config.TIPO_MALLA;

  if (!area) return false;

  const llaveArea = normalizarTexto(area.nombre);
  const llaveEco = normalizarTexto(config.AREAS["proyecto-socioemocional"].nombre);

  // Verificamos si ya existe EXACTAMENTE esta combinación en memoria
  if (window.MallasData[llaveArea]?.[gradoStr]?.[tipo]) return true;

  // Cache-Busting: Añadimos un timestamp para evitar que el navegador use archivos viejos
  const t = new Date().getTime();
  const rutaBase = `data/${area.carpeta}/${area.prefijo}_${gradoStr}_${tipo}.json?v=${t}`;
  const rutaTareas = `data/${area.carpeta}/tareas_dce/t_${area.prefijo}_${gradoStr}_${tipo}.json?v=${t}`;
  const rutaEco = `data/${config.AREAS["proyecto-socioemocional"].carpeta}/${config.AREAS["proyecto-socioemocional"].prefijo}_${gradoStr}_${tipo}.json?v=${t}`;

  try {
    const [resBase, resTareas, resEco] = await Promise.all([
      fetch(rutaBase).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(rutaTareas).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(rutaEco).then(r => r.ok ? r.json() : null).catch(() => null)
    ]);

    if (!resBase) {
        console.warn(`Archivo no encontrado o error: ${rutaBase}`);
        return false;
    }

    // Estructura de almacenamiento por Modalidad
    if (!window.MallasData[llaveArea]) window.MallasData[llaveArea] = {};
    if (!window.MallasData[llaveArea][gradoStr]) window.MallasData[llaveArea][gradoStr] = {};
    window.MallasData[llaveArea][gradoStr][tipo] = resBase;

    if (resTareas) {
      const llaveDCE = `tareas_dce_${llaveArea}`;
      if (!window.MallasData[llaveDCE]) window.MallasData[llaveDCE] = {};
      if (!window.MallasData[llaveDCE][gradoStr]) window.MallasData[llaveDCE][gradoStr] = {};
      window.MallasData[llaveDCE][gradoStr][tipo] = resTareas;
    }

    if (resEco) {
      if (!window.MallasData[llaveEco]) window.MallasData[llaveEco] = {};
      if (!window.MallasData[llaveEco][gradoStr]) window.MallasData[llaveEco][gradoStr] = {};
      window.MallasData[llaveEco][gradoStr][tipo] = resEco;
    }
    return true;
  } catch (e) { return false; }
}
