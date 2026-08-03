// FILE: js/render-engine.js | VERSION: v10.6 Stable
window.RenderEngine = (function() {
  const containerMalla = document.getElementById('contenedor-malla');

  // Función auxiliar para persistir datos antes de abrir el diccionario
  window.abrirDiccionarioECO = function(grado, periodo, areaId) {
    const config = window.APP_CONFIG;
    const tipoMalla = config.TIPO_MALLA;
    const llaveEco = normalizarTexto(config.AREAS["proyecto-socioemocional"].nombre);

    // Recuperamos la data que ya cargó data-loader.js
    const dataCompleta = window.MallasData[llaveEco]?.[grado]?.[tipoMalla];

    if (dataCompleta) {
      // Guardamos en localStorage del ORIGEN ACTUAL del IFRAME
      localStorage.setItem('ECO_PERSISTENCIA_SOCIO', JSON.stringify({
        grado: grado,
        periodo: periodo,
        data: dataCompleta
      }));
    }

    const url = `diccionario_eco.html?grado=${grado}&periodo=${periodo}&area=${encodeURIComponent(config.AREAS["proyecto-socioemocional"].nombre)}`;

    // CAMBIO CLAVE: Cargar la URL en la misma ventana del iframe
    window.location.href = url; // O window.location.replace(url) para no dejar historial
  };


  function validarDato(dato) {
    const msg = '<em style="color:#999;font-weight:400;">Información en proceso de revisión...</em>';
    if (!dato || dato === "") return msg;
    if (Array.isArray(dato)) {
      if (dato.length === 0) return msg;
      return `<ul>${dato.map(linea => `<li>${linea}</li>`).join('')}</ul>`;
    }
    return dato;
  }

  function formatearConBadges(dato) {
    if (!dato) return validarDato(dato);
    const lineas = Array.isArray(dato) ? dato : [dato];
    return lineas.map(linea => {
      const parts = linea.split(':');
      if (parts.length > 1 && parts[0].trim().length < 25) {
        return `<div class="badge-container"><span class="badge-id">${parts[0].trim()}</span><div class="badge-text">${parts.slice(1).join(':').trim()}</div></div>`;
      }
      return `<div style="margin-bottom:10px;">${linea}</div>`;
    }).join('');
  }

  function renderizarRutaExploracion(ruta) {
    if (!ruta || typeof ruta !== 'object') return validarDato(ruta);
    const bloques = [
      { key: 'explorar', label: 'Explorar' },
      { key: 'visual', label: 'Visual' },
      { key: 'produccion', label: 'Producción' }
    ];

    const subcampos = bloques.map(({ key, label }) => {
      return `<div class="subcampo-ruta" style="margin-bottom:10px; padding-left:12px; border-left:3px solid #d9e4ec;"><strong>${label}:</strong><div>${validarDato(ruta[key])}</div></div>`;
    }).join('');

    return `<div class="ruta-exploracion-subcampos">${subcampos}</div>`;
  }

  function renderizar(items, areaId, grado, periodo) {
    const resSec = document.getElementById('resultados-principal');
    const indicador = document.getElementById('indicador-periodo');
    const configArea = window.APP_CONFIG.AREAS[areaId];
    if (resSec) resSec.classList.add('mostrar-block');
    if (indicador && configArea) {
      indicador.style.display = 'block';
      indicador.style.backgroundColor = configArea.color || '#9B7BB6';
      indicador.innerHTML = `Periodo Consultado: ${periodo}°`;
      indicador.classList.remove('animar-zoom');
      void indicador.offsetWidth;
      indicador.classList.add('animar-zoom');
    }
    if (!containerMalla) return;
    containerMalla.innerHTML = items.map(item => {
      if (areaId === "proyecto-socioemocional") return plantillaSocioemocional(item, grado, periodo);
      return plantillaAcademica(item, areaId, grado, periodo);
    }).join('');
  }

  function plantillaAcademica(item, areaId, grado, periodo) {
    const tipoMalla = window.APP_CONFIG.TIPO_MALLA;
    const config = window.APP_CONFIG.AREAS[areaId];
    const tipoMalla = window.APP_CONFIG.TIPO_MALLA;
    const llaveNormal = normalizarTexto(config.nombre);
    
    // 1. CRUCE DCE (Estructura B)
    const llaveDCE = `tareas_dce_${llaveNormal}`;
    const dceData = window.MallasData[llaveDCE]?.[grado]?.[tipoMalla];
    const dcePer = dceData?.periodos?.find(p => String(p.periodo_id) === String(periodo));
    const rawDCE = dcePer?.guias_por_componente?.find(c => normalizarTexto(c.componente) === normalizarTexto(item.componente || item.competencia));
    const infoDCE = rawDCE?.guia_didactica;

    // 2. CRUCE ECO TRANSVERSAL (v10.6)
    const llaveEco = normalizarTexto(window.APP_CONFIG.AREAS["proyecto-socioemocional"].nombre);
    const ecoFullData = window.MallasData[llaveEco]?.[grado]?.[tipoMalla];
    
    let infoECOs = [];
    // Lógica especial: Si es malla de 3P y estamos en el 3°, traer P3 y P4 de Socioemocional
    if (tipoMalla === "3_periodos" && String(periodo) === "3") {
        if (ecoFullData?.periodos?.["3"]) infoECOs.push(...ecoFullData.periodos["3"]);
        if (ecoFullData?.periodos?.["4"]) infoECOs.push(...ecoFullData.periodos["4"]);
    } else {
        if (ecoFullData?.periodos?.[periodo]) infoECOs.push(...ecoFullData.periodos[periodo]);
    }

    // Preparar visualización de múltiples bloques ECO si existen
    const contenidoECO = infoECOs.length > 0 ? infoECOs.map(eco => `
      <div class="ficha-body" style="border-bottom: 1px dashed #ccc; margin-bottom:10px;">
        <div class="campo"><strong>Eje Central:</strong><div>${validarDato(eco.eje_central)}</div></div>
        <div class="campo"><strong>Habilidades:</strong><div>${validarDato(eco.Habilidades)}</div></div>
        <div class="campo"><strong>Evidencias de Desempeño:</strong><div>${validarDato(eco.evidencias_de_desempeno)}</div></div>
      </div>
    `).join('') : `<div class="ficha-body">${validarDato(null)}</div>`;

    return `
      <div class="item-malla">
        <div class="franja-titulo-principal" style="background-color: ${config.color};">${item.componente || item.competencia || 'General'}</div>
        <div class="item-malla-contenido">
          <div class="campo"><strong>Estándar Curricular:</strong><div>${validarDato(item.estandar)}</div></div>
          <div class="campo"><strong>DBA:</strong><div>${formatearConBadges(item.dba)}</div></div>
          <div class="campo"><strong>Evidencias de Aprendizaje:</strong><div>${formatearConBadges(item.evidencias)}</div></div>
          <div class="campo"><strong>Saberes / Contenidos:</strong><div>${validarDato(item.saberes)}</div></div>
          <div class="contenedor-fichas-cierre">
            <!-- FICHA 1: DCE -->
            <div class="ficha-cierre ficha-dce">
              <div class="ficha-header ficha-header-dce"><span>💡</span> GUÍA DIDÁCTICA: ${infoDCE ? infoDCE.la_estrategia : 'En proceso'}</div>
              <div class="ficha-body">
                <div class="campo"><strong>Reto Sugerido:</strong><div>${validarDato(infoDCE?.un_reto_sugerido)}</div></div>
                <div class="campo"><strong>Ruta de Exploración:</strong><div>${renderizarRutaExploracion(infoDCE?.ruta_de_exploracion)}</div></div>
                <div class="campo"><strong>Para Pensar:</strong><div>${validarDato(infoDCE?.para_pensar)}</div></div>
                <div class="campo"><strong>Pistas del Éxito:</strong><div>${validarDato(infoDCE?.pistas_del_exito)}</div></div>
                <div class="campo"><strong>Un Refuerzo:</strong><div>${validarDato(infoDCE?.un_refuerzo)}</div></div>
              </div>
            </div>
            <!-- FICHA 2: ECO (Híbrida) -->
            <div class="ficha-cierre ficha-eco">
              <div class="ficha-header ficha-header-eco"><span>🧠</span> RESPONSABILIDAD SOCIOEMOCIONAL ECO</div>
              ${contenidoECO}
            </div>
          </div>
          <div style="text-align:center; margin-top:2rem;">
            <button onclick="abrirDiccionarioECO('${grado}', ${periodo}, '${areaId}')" class="btn-eco-dic" style="cursor:pointer; border:none; padding:10px 20px; border-radius:5px;">Consultar Diccionario ECO</button>
          </div>
        </div>
      </div>
    `;
  }

  function plantillaSocioemocional(item, grado, periodo) {
    return `
      <div class="item-malla">
        <div class="franja-titulo-principal" style="background-color: var(--eco-purple);">${item.competencia || 'Competencia Socioemocional'}</div>
        <div class="item-malla-contenido">
          <div class="campo"><strong>Estandar de Formación:</strong> <div>${validarDato(item.estandar)}</div></div>
          <div class="campo"><strong>Eje Central del Proceso:</strong> <div>${validarDato(item.eje_central)}</div></div>
          <div class="campo"><strong>Habilidades a Fortalecer:</strong> <div style="background:white; padding:20px; border-radius:10px; border:1px solid #eee; border-left:5px solid var(--eco-purple);">${validarDato(item.Habilidades)}</div></div>
          <div class="campo"><strong>Evidencias ECO:</strong> <div>${validarDato(item.evidencias_de_desempeno)}</div></div>
          <div style="text-align:center; margin-top:2rem;">
             <button onclick="abrirDiccionarioECO('${grado}', ${periodo}, 'proyecto-socioemocional')" class="btn-eco-dic" style="cursor:pointer; border:none; padding:10px 20px; border-radius:5px;">Consultar Diccionario ECO</button>
          </div>
        </div>
      </div>
    `;
  }

  return { renderizar, setCargando: (estado) => { const loader = document.getElementById('loading-overlay'); if (loader) loader.classList.toggle('mostrar-flex', estado); } };
})();
