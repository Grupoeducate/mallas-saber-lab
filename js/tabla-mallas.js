// js/tabla-mallas.js

// Renderiza resultados como tarjetas verticales
function renderTablaMallas(items) {
  const contenedor = document.getElementById('tabla-body');
  if (!contenedor) return;

  // Usamos el tbody existente como contenedor, pero metemos <tr><td> con tarjetas
  contenedor.innerHTML = items.map(item => `
    <tr>
      <td colspan="9">
        <div class="malla-card">
          <div class="malla-card-header">
            <div>
              <span class="malla-componente">${item.componente}</span>
              <!-- Código EBC se agregará luego -->
            </div>
            <button type="button" class="btn-copiar" data-copy="1">Copiar</button>
          </div>

          <div class="malla-row">
            <span class="malla-label">Estandar</span>
            <div class="malla-content">${item.estandar || ''}</div>
          </div>

          <div class="malla-row">
            <span class="malla-label">DBA</span>
            <div class="malla-content">
              <ul>
                ${(item.dba || []).map(d => `<li>${d}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div class="malla-row">
            <span class="malla-label">Evidencias</span>
            <div class="malla-content">
              <ul>
                ${(item.evidencias || []).map(e => `<li>${e}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div class="malla-row">
            <span class="malla-label">Saberes</span>
            <div class="malla-content">
              <ul>
                ${(item.saberes || []).map(s => `<li>${s}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div class="malla-row">
            <span class="malla-label">Socioemocional</span>
            <div class="malla-content">${item.socioemocional ?? ''}</div>
          </div>

          <div class="malla-row">
            <span class="malla-label">Tareas DCE</span>
            <div class="malla-content">${item.tareas_dce ?? ''}</div>
          </div>

          <div class="malla-row">
            <span class="malla-label">Fuente</span>
            <div class="malla-content">${item.fuente ?? ''}</div>
          </div>
        </div>
      </td>
    </tr>
  `).join('');

  // copiar tarjeta completa
  Array.from(document.querySelectorAll('.btn-copiar')).forEach(btn => {
    btn.addEventListener('click', e => {
      const card = e.target.closest('.malla-card');
      copiarCardMalla(card);
    });
  });
}

function copiarCardMalla(card) {
  if (!card) return;
  const text = card.innerText.replace(/\n\s*\n/g, '\n').trim();
  navigator.clipboard.writeText(text).then(() => {
    card.classList.add('copiable');
    setTimeout(() => card.classList.remove('copiable'), 800);
  });
}
