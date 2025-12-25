// js/tabla-mallas.js

function renderTablaMallas(items) {
  const tbody = document.getElementById('tabla-body');
  if (!tbody) return;

  tbody.innerHTML = items.map(item => `
    <tr class="fila-malla">
      <td>${item.componente}</td>
      <td><!-- código EBC luego --></td>
      <td>${item.estandar}</td>
      <td class="array"><ul>${(item.dba || []).map(d => `<li>${d}</li>`).join('')}</ul></td>
      <td class="array"><ul>${(item.evidencias || []).map(e => `<li>${e}</li>`).join('')}</ul></td>
      <td class="array"><ul>${(item.saberes || []).map(s => `<li>${s}</li>`).join('')}</ul></td>
      <td>${item.socioemocional ?? ''}</td>
      <td>${item.tareas_dce ?? ''}</td>
      <td>${item.fuente ?? ''}</td>
    </tr>
  `).join('');

  // comportamiento de copiar fila
  Array.from(document.querySelectorAll('.fila-malla')).forEach(row => {
    row.addEventListener('click', () => copiarFilaMalla(row));
  });
}

function copiarFilaMalla(row) {
  const text = Array.from(row.cells)
    .map(c => c.textContent.trim())
    .join('\t');

  navigator.clipboard.writeText(text).then(() => {
    row.classList.add('copiable');
    setTimeout(() => row.classList.remove('copiable'), 800);
  });
}
