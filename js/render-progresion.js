// FILE: js/render-progresion.js | VERSION: v10.4 Stable
window.ProgresionMotor = (function() {
  let est = { areaId: '', areaNombre: '', gradoCentral: 0, componente: '', tipo: '4_periodos' };
  const ov = document.getElementById('overlay-progresion');
  const txt = document.getElementById('prog-area-txt');
  const cPr = document.getElementById('cont-grado-prev');
  const cAc = document.getElementById('cont-grado-actual');
  const cNx = document.getElementById('cont-grado-next');

  async function abrir(nom, gr, comp) {
    const config = window.APP_CONFIG.AREAS;
    est.areaId = Object.keys(config).find(k => config[k].nombre === nom);
    est.areaNombre = nom; est.gradoCentral = parseInt(gr); est.componente = comp; 
    est.tipo = window.APP_CONFIG.TIPO_MALLA;
    ov.classList.add('mostrar-flex');
    renderizar();
  }

  function renderizar() {
    const g = est.gradoCentral;
    txt.textContent = `${est.areaNombre.toUpperCase()} - ${est.componente}`;
    dibujar(cPr, (g - 1 < -1) ? null : String(g - 1));
    dibujar(cAc, String(g));
    dibujar(cNx, (g + 1 > 11) ? null : String(g + 1));
    document.getElementById('prog-prev').disabled = (g <= -1);
    document.getElementById('prog-next').disabled = (g >= 11);
  }

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
      });
    });
    return [...new Set(ac)].filter(t => t && String(t).trim() !== "");
  }

  document.getElementById('btn-cerrar-progresion').onclick = () => ov.classList.remove('mostrar-flex');
  
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
