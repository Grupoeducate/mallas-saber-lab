// FILE: js/render-progresion.js | VERSION: v10.4 Stable
window.ProgresionMotor = (function() {
  // Estado interno sincronizado con la configuración global
  let est = { areaId: '', areaNombre: '', gradoCentral: 0, componente: '', tipo: '4_periodos' };
  
  const ov = document.getElementById('overlay-progresion');
  const txt = document.getElementById('prog-area-txt');
  const cPr = document.getElementById('cont-grado-prev');
  const cAc = document.getElementById('cont-grado-actual');
  const cNx = document.getElementById('cont-grado-next');

  /**
   * ABRE EL PANEL DE PROGRESIÓN (Punto de entrada desde UI)
   */
  async function abrir(nom, gr, comp) {
    const config = window.APP_CONFIG.AREAS;
    // Vinculación dinámica de IDs
    est.areaId = Object.keys(config).find(k => config[k].nombre === nom);
    est.areaNombre = nom; est.gradoCentral = parseInt(gr); est.componente = comp; 
    est.tipo = window.APP_CONFIG.TIPO_MALLA;
    ov.classList.add('mostrar-flex');
    renderizar();
  }

  /**
   * COORDINA EL DIBUJO DE LAS 3 COLUMNAS DE COMPARACIÓN
   */
  function renderizar() {
    const g = est.gradoCentral;
    const tituloComp = est.componente === "todos" ? "Todos los Componentes" : est.componente;
    txt.textContent = `${est.areaNombre.toUpperCase()} - ${tituloComp}`;
    
    // Asignación de grados a columnas (Manejo de límites -1 y 11)
    dibujar(cPr, (g - 1 < -1) ? null : String(g - 1));
    dibujar(cAc, String(g));
    dibujar(cNx, (g + 1 > 11) ? null : String(g + 1));
    document.getElementById('prog-prev').disabled = (g <= -1);
    document.getElementById('prog-next').disabled = (g >= 11);
  }

  /**
   * DIBUJA EL CONTENIDO PEDAGÓGICO DE UNA COLUMNA
   */
  function dibujar(cont, grStr) {
    if (!cont) return;
    const h = cont.previousElementSibling;
    cont.innerHTML = '';
    if (grStr === null) { if (h) h.textContent = "---"; cont.innerHTML = '<p style="text-align:center;color:#999;padding-top:20px;">Fin de secuencia.</p>'; return; }
    
    if (h) h.textContent = (grStr === "0" ? "Transición (0)" : (grStr === "-1" ? "Jardín (-1)" : `Grado ${grStr}°`));
    
    // DETECCIÓN HÍBRIDA (v10.4)
    const esPreescolar = (grStr === "0" || grStr === "-1");
    const datos = obtener(grStr, esPreescolar);

    if (datos.length === 0) { 
      cont.innerHTML = '<p style="text-align:center;padding:20px;color:#888;">Sin datos disponibles.</p>'; 
    } else { 
      datos.forEach(t => { 
        const d = document.createElement('div'); 
        d.className = 'prog-estandar-item';
        
        // Aplicación de Badges en Progresión
        const parts = t.split(':');
        if (parts.length > 1 && (parts[0].toLowerCase().includes('dba') || parts[0].trim().length < 20)) {
           d.innerHTML = `<span class="badge-id">${parts[0].trim()}</span><div style="margin-top:5px;">${parts.slice(1).join(':').trim()}</div>`;
        } else {
           d.innerHTML = t;
        }
        cont.appendChild(d); 
      }); 
    }
  }

  function obtener(grStr, esPre) {
    const malla = window.MallasData[normalizarTexto(est.areaNombre)]?.[grStr]?.[est.tipo];
    if (!malla || !malla.periodos) return [];
    let ac = [];
    Object.keys(malla.periodos).forEach(p => {
      malla.periodos[p].forEach(it => {
        const coincide = normalizarTexto(it.componente || it.competencia) === normalizarTexto(est.componente);
        // Puente Pedagógico: En grado 1, permitir ver estándares aunque vengamos de DBA
        if (coincide || (est.gradoCentral <= 0 && grStr === "1")) {
          const c = esPre ? it.dba : it.estandar;
          if (c) { if (Array.isArray(c)) ac.push(...c); else ac.push(c); }
        }
        cont.appendChild(d);
      });
    }
  }

  /**
   * EXTRAE Y CRUZA DATOS DESDE window.MallasData
   */
  function obtenerDatosCruce(grStr, esPre) {
    const llaveArea = normalizarTexto(est.areaNombre);
    const malla = window.MallasData[llaveArea]?.[grStr]?.[est.tipo];
    
    if (!malla || !malla.periodos) return [];
    
    let resultados = [];
    const nomCompBuscado = normalizarTexto(est.componente);

    // Iteración sobre objeto de periodos (Estructura B Académica)
    Object.values(malla.periodos).forEach(listaItems => {
      if (Array.isArray(listaItems)) {
        listaItems.forEach(item => {
          const nomItem = normalizarTexto(item.componente || item.competencia);
          
          // CRITERIOS DE FILTRADO (Soporta "Todos")
          const esMismoComp = (nomCompBuscado === "todos" || nomItem === nomCompBuscado);
          
          // Lógica de Puente Pedagógico: Grado 1 permite ver estándares 
          // aunque el origen sea preescolar para ver la evolución.
          if (esMismoComp || (est.gradoCentral <= 0 && grStr === "1")) {
            const contenido = esPre ? item.dba : item.estandar;
            if (contenido) {
              if (Array.isArray(contenido)) resultados.push(...contenido);
              else resultados.push(contenido);
            }
          }
        });
      }
    });

    // Limpieza de duplicados y vacíos
    return [...new Set(resultados)].filter(t => t && String(t).trim() !== "");
  }

  // BOTONES DE CIERRE Y NAVEGACIÓN
  const bCerrar = document.getElementById('btn-cerrar-progresion');
  if (bCerrar) bCerrar.onclick = () => ov.classList.remove('mostrar-flex');
  
  document.getElementById('prog-prev').onclick = async () => { 
    if (est.gradoCentral > -1) {
      est.gradoCentral--; window.RenderEngine.setCargando(true); 
      await asegurarDatosGrado(est.areaId, est.gradoCentral - 1); 
      renderizar(); window.RenderEngine.setCargando(false); 
    }
  };
  
  document.getElementById('prog-next').onclick = async () => { 
    if (est.gradoCentral < 11) {
      est.gradoCentral++; window.RenderEngine.setCargando(true); 
      await asegurarDatosGrado(est.areaId, est.gradoCentral + 1); 
      renderizar(); window.RenderEngine.setCargando(false); 
    }
  };

  return { abrir };
})();
