// js/ui-filtros.js

document.addEventListener('DOMContentLoaded', () => {
  const areaSel = document.getElementById('area');
  const gradoSel = document.getElementById('grado');
  const periodoSel = document.getElementById('periodo');
  const compSel = document.getElementById('componente');
  const btnBuscar = document.querySelector('.btn-buscar');
  const resultados = document.getElementById('resultados');

  if (!areaSel || !gradoSel || !periodoSel || !compSel || !btnBuscar || !resultados) return;

  // Cuando terminen de cargar las mallas, poblar grados si el área es Matemáticas
  // (data-loader.js ya dejó MallasData.matematicas listo)
  inicializarGrados();

  // LISTENERS

  document.querySelectorAll('input[name="periodos"]').forEach(radio => {
    radio.addEventListener('change', updatePeriodosUI);
  });

  areaSel.addEventListener('change', () => {
    const isMatematicas = areaSel.value === 'matematicas';
    if (isMatematicas) {
      poblarGradosDesdeDatos();
    } else {
      gradoSel.disabled = true;
      gradoSel.innerHTML = '<option value="">Seleccionar</option>';
      limpiarPeriodosYComponentes();
    }
  });

  gradoSel.addEventListener('change', () => {
    updatePeriodosUI();
  });

  periodoSel.addEventListener('change', () => {
    updateComponentesUI();
  });

  btnBuscar.addEventListener('click', () => {
    consultarMalla();
  });

  // FUNCIONES

  function inicializarGrados() {
    // Si al cargar la página ya está seleccionada Matemáticas, poblar grados
    if (areaSel.value === 'matematicas') {
      poblarGradosDesdeDatos();
    }
  }

  function poblarGradosDesdeDatos() {
    const datosMat = window.MallasData?.matematicas || {};
    const gradosDisponibles = Object.keys(datosMat).sort((a, b) => Number(a) - Number(b));

    gradoSel.innerHTML = '<option value="">Seleccionar</option>';

    gradosDisponibles.forEach(g => {
      const texto = `${g}°`;
      gradoSel.innerHTML += `<option value="${g}">${texto}</option>`;
    });

    gradoSel.disabled = gradosDisponibles.length === 0;
    limpiarPeriodosYComponentes();
  }

  function limpiarPeriodosYComponentes() {
    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    periodoSel.disabled = true;

    compSel.innerHTML = '<option value="todos">Todos</option>';
    compSel.disabled = true;
  }

  function obtenerMallaSeleccionada() {
    const area = areaSel.value;
    const grado = gradoSel.value;
    if (area !== 'matematicas' || !grado) return null;
    const data = window.MallasData?.matematicas?.[grado];
    return data || null;
  }

  function updatePeriodosUI() {
    const malla = obtenerMallaSeleccionada();
    if (!malla) {
      limpiarPeriodosYComponentes();
      return;
    }

    const maxPeriodoJSON = malla.numero_periodos || 4;

    const valorToggle = document.querySelector('input[name="periodos"]:checked')?.value;
    const maxPeriodoToggle = valorToggle ? Number(valorToggle) : maxPeriodoJSON;

    const max = Math.min(maxPeriodoJSON, maxPeriodoToggle);

    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    for (let i = 1; i <= max; i++) {
      periodoSel.innerHTML += `<option value="${i}">${i}</option>`;
    }

    periodoSel.disabled = false;
    updateComponentesUI();
  }

  function updateComponentesUI() {
    const periodo = periodoSel.value;
    compSel.innerHTML = '<option value="todos">Todos</option>';

    const malla = obtenerMallaSeleccionada();
    if (!malla || !periodo) {
      compSel.disabled = true;
      return;
    }

    const periodoData = malla.periodos?.[periodo] || [];
    const nombres = [...new Set(periodoData.map(it => it.componente))];

    nombres.forEach(nombre => {
      compSel.innerHTML += `<option value="${nombre}">${nombre}</option>`;
    });

    compSel.disabled = false;
  }

  function consultarMalla() {
    const area = areaSel.value;
    const grado = gradoSel.value;
    const periodo = periodoSel.value;
    const componente = compSel.value;

    if (!area || !grado || !periodo) {
      alert('Selecciona área, grado y período');
      return;
    }

    const malla = obtenerMallaSeleccionada();
    if (!malla) {
      alert('La malla seleccionada aún no se ha cargado.');
      return;
    }

    const periodoData = malla.periodos?.[periodo] || [];
    const items = componente === 'todos'
      ? periodoData
      : periodoData.filter(it => it.componente === componente);

    renderTablaMallas(items);
    resultados.classList.add('mostrar');
  }

  // Inicial
  updatePeriodosUI();
});
