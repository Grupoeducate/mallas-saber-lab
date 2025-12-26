// js/data-loader.js

// Estructura global de datos
// MallasData[area][grado][tipo_malla] = json
window.MallasData = {};

function ensureAreaGradeTipo(area, grado, tipo) {
  if (!window.MallasData[area]) window.MallasData[area] = {};
  if (!window.MallasData[area][grado]) window.MallasData[area][grado] = {};
  if (!window.MallasData[area][grado][tipo]) window.MallasData[area][grado][tipo] = null;
}

function cargarMatematicas4Periodos() {
  const areaNombre = "Matemáticas";
  const tipo_malla = "4_periodos";
  const promesas = [];

  // ANTES: for (let grado = 1; grado <= 5; grado++)
  // AHORA: 1 a 11
  for (let grado = 1; grado <= 11; grado++) {
    const fileName = `data/matematicas_${grado}_4_periodos.json`;

    const p = fetch(fileName)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(json => {
        const gradoJson = json.grado || String(grado);
        const tipoJson = json.tipo_malla || tipo_malla;
        const areaJson = json.area || areaNombre;

        ensureAreaGradeTipo(areaJson, gradoJson, tipoJson);
        window.MallasData[areaJson][gradoJson][tipoJson] = json;

        console.log(`Malla ${areaJson} ${gradoJson}° cargada (tipo: ${tipoJson}, períodos: ${json.numero_periodos})`);
      })
      .catch(err => {
        console.warn(`No se encontró ${fileName}:`, err.message);
      });

    promesas.push(p);
  }

  return Promise.all(promesas);
}

cargarMatematicas4Periodos().then(() => {
  console.log("Intento de carga de Matemáticas 1°–11° a 4 períodos completado.");
});

