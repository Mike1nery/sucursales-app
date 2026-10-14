async function cargarSucursales() {
    try {
        const response = await fetch('/api/sucursales');
        if (!response.ok) return;
        const sucursales = await response.json();
        
        const grid = document.getElementById('grid-sucursales');
        if (sucursales.length > 0) {
            grid.innerHTML = '';
            sucursales.forEach(suc => {
                grid.innerHTML += `
                    <div onclick="verDetalleSucursal('${suc.id}')" class="bg-white p-5 rounded-lg shadow hover:shadow-md transition cursor-pointer border border-gray-200">
                        <h3 class="font-bold text-lg text-blue-900">${suc.nombre}</h3>
                        <p class="text-sm text-gray-600">${suc.direccion || 'Sin dirección registrada'}</p>
                        <span class="mt-3 inline-block text-xs bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded">Ver Panel Ejecutivo &rarr;</span>
                    </div>
                `;
            });
        }
    } catch (error) {
        console.log('Usando modo de prueba con tarjeta de ejemplo.');
    }
}

// Función para abrir la vista ejecutiva de una sucursal al hacer clic
async function verDetalleSucursal(sucursalId) {
    try {
        const response = await fetch(`/api/sucursales/${sucursalId}/detalle`);
        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'No se pudo cargar la información de la sucursal.');
            return;
        }

        // 1. Rellenar datos generales
        document.getElementById('det-nombre-sucursal').textContent = data.sucursal.nombre;
        document.getElementById('det-dir-sucursal').textContent = data.sucursal.direccion || 'Sin dirección registrada';

        // 2. Rellenar Estadísticas (KPIs)
        document.getElementById('stat-edificios').textContent = data.stats.total_edificios;
        document.getElementById('stat-equipos').textContent = data.stats.total_equipos;
        document.getElementById('stat-ot').textContent = data.stats.total_ot;
        document.getElementById('stat-pendientes').textContent = data.stats.ot_pendientes;

        // 3. Rellenar Edificios
        const divEdificios = document.getElementById('lista-edificios-detalle');
        divEdificios.innerHTML = data.edificios.length ? '' : '<p class="text-gray-400 italic text-sm">No hay edificios registrados.</p>';
        data.edificios.forEach(edif => {
            divEdificios.innerHTML += `
                <div class="p-3 bg-gray-50 rounded border border-gray-200 flex justify-between items-center text-sm">
                    <div>
                        <span class="font-bold text-gray-700">${edif.nombre}</span>
                        <p class="text-xs text-gray-500">${edif.descripcion || ''}</p>
                    </div>
                    <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono font-bold">${edif.codigo || ''}</span>
                </div>
            `;
        });

        // 4. Rellenar Equipos
        const divEquipos = document.getElementById('lista-equipos-detalle');
        divEquipos.innerHTML = data.equipos.length ? '' : '<p class="text-gray-400 italic text-sm">No hay equipos registrados en esta sucursal.</p>';
        data.equipos.forEach(eq => {
            divEquipos.innerHTML += `
                <div class="p-2.5 bg-gray-50 rounded border border-gray-100 flex justify-between items-center text-sm">
                    <div>
                        <span class="font-medium text-gray-800">${eq.nombre}</span>
                        <span class="text-xs text-gray-400 block font-mono">Inv: ${eq.codigo_inventario || 'S/C'}</span>
                    </div>
                    <span class="text-xs font-semibold px-2 py-1 rounded bg-indigo-50 text-indigo-700">${eq.indice_criticidad || 0}% Crit.</span>
                </div>
            `;
        });

        // 5. Rellenar Órdenes de Trabajo
        const tbodyOT = document.getElementById('tabla-ot-sucursal');
        tbodyOT.innerHTML = data.ordenes_trabajo.length ? '' : '<tr><td colspan="4" class="px-4 py-3 text-center text-gray-400 italic">Sin órdenes de trabajo registradas para esta sucursal.</td></tr>';
        data.ordenes_trabajo.forEach(ot => {
            tbodyOT.innerHTML += `
                <tr>
                    <td class="px-4 py-2 font-mono font-bold text-blue-600">${ot.folio || 'S/F'}</td>
                    <td class="px-4 py-2 text-gray-700">${ot.descripcion_problema || 'Sin descripción'}</td>
                    <td class="px-4 py-2"><span class="px-2.5 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-semibold">${ot.estado_ot || 'Pendiente'}</span></td>
                    <td class="px-4 py-2 text-gray-500 text-xs">${ot.created_at ? new Date(ot.created_at).toLocaleDateString() : 'N/A'}</td>
                </tr>
            `;
        });

        // Transición de pantallas
        document.getElementById('seccion-listado-sucursales').classList.add('hidden');
        document.getElementById('vista-detalle-sucursal').classList.remove('hidden');

    } catch (error) {
        console.error('Error al cargar detalle de sucursal:', error);
        alert('Error al conectar con el servidor.');
    }
}

// Función para regresar al listado principal
function volverAListadoSucursales() {
    document.getElementById('vista-detalle-sucursal').classList.add('hidden');
    document.getElementById('seccion-listado-sucursales').classList.remove('hidden');
}

// Cargar al iniciar
cargarSucursales();
