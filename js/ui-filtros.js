// js/ui-filtros.js

document.addEventListener('DOMContentLoaded', () => {
  const areaSel = document.getElementById('area');
  const gradoSel = document.getElementById('grado');
  const periodoSel = document.getElementById('periodo');
  const compSel = document.getElementById('componente');
  const btnBuscar = document.querySelector('.btn-buscar');
  const resultados = document.getElementById('resultados');

  if (!areaSel || !gradoSel || !periodoSel || !compSel || !btnBuscar) return;

  // listeners
  document.querySelectorAll('input[name="periodos"]').forEach(radio => {
    radio.addEventListener('change', updatePeriodosUI);
  });

  areaSel.addEventListener('change', () => {
    gradoSel.disabled = !areaSel.value;
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

  function updatePeriodosUI() {
    const maxPeriodo = document.querySelector('input[name="periodos"]:checked')?.value || '4';
    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    for (let i = 1; i <= Number(maxPeriodo); i++) {
      periodoSel.innerHTML += `<option value="${i}">${i}</option>`;
    }
    periodoSel.disabled = !areaSel.value || !gradoSel.value;
    updateComponentesUI();
  }

  function updateComponentesUI() {
    const periodo = periodoSel.value;
    compSel.innerHTML = '<option value="todos">Todos</option>';

    const data = window.MallasData?.matematicas_5;
    if (!data || !periodo) {
      compSel.disabled = true;
      return;
    }
    const periodoData = data.periodos?.[periodo] || [];
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

    const data = window.MallasData?.matematicas_5;
    if (!data) {
      alert('La malla de Matemáticas 5° aún no se ha cargado.');
      return;
    }

    const periodoData = data.periodos?.[periodo] || [];
    const items = componente === 'todos'
      ? periodoData
      : periodoData.filter(it => it.componente === componente);

    renderTablaMallas(items);
    resultados.classList.add('mostrar');
  }

  // inicial
  updatePeriodosUI();
});
