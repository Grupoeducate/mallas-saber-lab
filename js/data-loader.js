// js/data-loader.js

window.MallasData = {
  matematicas_5: null
};

(function cargarMatematicas5() {
  fetch('data/matematicas_5.json')
    .then(r => r.json())
    .then(json => {
      window.MallasData.matematicas_5 = json;
      console.log('Malla Matemáticas 5° cargada');
    })
    .catch(err => {
      console.error('Error cargando matematicas_5.json', err);
      alert('No se pudo cargar la malla de Matemáticas 5°');
    });
})();
