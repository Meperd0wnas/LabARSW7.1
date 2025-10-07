const BlueprintsModule = (function() {

    // Backend por defecto: mock
    let Backend = BlueprintsMockModule;
    let selectedAuthor = '';
    let currentBlueprint = null; // { author, name, points: [...], _isNew }

    // --- Backend switching ---
    function setBackendToMock() { Backend = BlueprintsMockModule; console.log('Backend -> MOCK'); }
    function setBackendToApi()  { Backend = BlueprintsApiClient; console.log('Backend -> API'); }

    // --- UI helpers ---
    function setAuthor(author) {
        selectedAuthor = (author || '').trim();
        $('#selected-author').text(selectedAuthor || '-');
    }

    function updateViewFromList(list) {
        const tbody = $('#blueprints-table tbody');
        tbody.empty();
        (list || []).forEach(bp => {
            const row = $('<tr></tr>');
            row.append(`<td>${bp.name}</td>`);
            row.append(`<td>${(bp.points || []).length}</td>`);
            const btn = $('<button class="btn btn-success btn-sm">Dibujar</button>');
            btn.click(() => drawBlueprint(selectedAuthor, bp.name));
            row.append($('<td></td>').append(btn));
            tbody.append(row);
        });
        const total = (list || []).reduce((s, bp) => s + ((bp.points || []).length), 0);
        $('#total-points').text(total);
    }

    // --- Get blueprints by author (Promise) ---
    function updateBlueprintsByAuthor(author) {
        setAuthor(author);
        if (Backend.getBlueprintsByAuthorPromise) {
            return Backend.getBlueprintsByAuthorPromise(author)
                .then(list => { updateViewFromList(list); return list; });
        } else {
            return new Promise((resolve) => Backend.getBlueprintsByAuthor(author, function(list) { updateViewFromList(list); resolve(list); }));
        }
    }

    // --- Draw ---
    function drawBlueprint(author, name) {
        const p = Backend.getBlueprintsByAuthorPromise ? Backend.getBlueprintsByAuthorPromise(author) :
            new Promise((res) => Backend.getBlueprintsByAuthor(author, res));
        p.then(list => {
            const bp = (list || []).find(b => b.name === name);
            if (!bp) return;
            currentBlueprint = bp;
            currentBlueprint._isNew = false;
            $('#current-plan').remove();
            $('<div id="current-plan" class="mb-3"><strong>Plano dibujado: </strong>' + bp.name + '</div>')
                .insertBefore('#blueprints-canvas');
            repaintCanvas();
        }).catch(err => console.error(err));
    }

    // --- Canvas paint/clear ---
    function repaintCanvas() {
        const canvas = document.getElementById('blueprints-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (!currentBlueprint || !currentBlueprint.points || currentBlueprint.points.length === 0) return;
        const pts = currentBlueprint.points;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    function clearCanvasAndUI() {
        const canvas = document.getElementById('blueprints-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        $('#current-plan').remove();
        currentBlueprint = null;
    }

    // --- Canvas pointer handler ---
    function initCanvasEvents() {
        const canvas = document.getElementById('blueprints-canvas');
        if (!canvas) return;
        if (canvas._bpHandler) canvas.removeEventListener('pointerdown', canvas._bpHandler);
        canvas._bpHandler = function(event) {
            if (!currentBlueprint) return;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = Math.round((event.clientX - rect.left) * scaleX);
            const y = Math.round((event.clientY - rect.top) * scaleY);
            if (!currentBlueprint.points) currentBlueprint.points = [];
            currentBlueprint.points.push({ x, y });
            repaintCanvas();
            refreshTableTotalsFromMemory();
        };
        canvas.addEventListener('pointerdown', canvas._bpHandler);
    }

    function refreshTableTotalsFromMemory() {
        if (!selectedAuthor) return;
        if (Backend.getBlueprintsByAuthorPromise) {
            Backend.getBlueprintsByAuthorPromise(selectedAuthor).then(list => updateViewFromList(list));
        } else {
            Backend.getBlueprintsByAuthor(selectedAuthor, function(list) { updateViewFromList(list); });
        }
    }

    // --- Create new blueprint ---
    function createNewBlueprint() {
        if (!selectedAuthor) {
            alert('Primero ingrese y seleccione un autor (campo Autor).');
            return;
        }
        const name = prompt('Nombre del nuevo blueprint:');
        if (!name) { alert('Nombre no válido. Operación cancelada.'); return; }
        clearCanvasAndUI();
        currentBlueprint = { author: selectedAuthor, name: name, points: [], _isNew: true };
        $('#current-plan').remove();
        $('<div id="current-plan" class="mb-3"><strong>Nuevo plano (no guardado): </strong>' + name + '</div>').insertBefore('#blueprints-canvas');
        repaintCanvas();
    }

    // --- Save or update (POST if new, PUT if exists) ---
    function saveOrUpdateBlueprint() {
        if (!currentBlueprint) { alert('No hay plano abierto para guardar.'); return Promise.reject('no-blueprint'); }
        if (!selectedAuthor) { alert('No hay autor seleccionado.'); return Promise.reject('no-author'); }
        const payload = { author: selectedAuthor, name: currentBlueprint.name, points: currentBlueprint.points || [] };
        const opPromise = (currentBlueprint._isNew ? (Backend.postBlueprint ? Backend.postBlueprint(payload) : Promise.reject('backend no soporta post')) :
            (Backend.putBlueprint ? Backend.putBlueprint(selectedAuthor, payload) : Promise.reject('backend no soporta put')));
        return opPromise
            .then(() => {
                // 1) GET /blueprints (all) para recalcular total (si está disponible)
                if (Backend.getAllBlueprintsPromise) return Backend.getAllBlueprintsPromise();
                // fallback: get only author
                return (Backend.getBlueprintsByAuthorPromise ? Backend.getBlueprintsByAuthorPromise(selectedAuthor) :
                    new Promise((res) => Backend.getBlueprintsByAuthor(selectedAuthor, res)));
            })
            .then(allOrAuthorList => {
                const all = allOrAuthorList || [];
                const userList = (all.length > 0 && all[0].author !== undefined) ?
                    all.filter(bp => (bp.author || '').toLowerCase() === (selectedAuthor || '').toLowerCase()) : all;
                const total = userList.reduce((s, bp) => s + ((bp.points || []).length), 0);
                $('#total-points').text(total);
                if (Backend.getBlueprintsByAuthorPromise) return Backend.getBlueprintsByAuthorPromise(selectedAuthor);
                return new Promise((res) => Backend.getBlueprintsByAuthor(selectedAuthor, res));
            })
            .then(authorList => {
                updateViewFromList(authorList);
                const same = (authorList || []).find(bp => bp.name === currentBlueprint.name);
                if (same) {
                    currentBlueprint = same;
                    currentBlueprint._isNew = false;
                }
                alert('Plano guardado/actualizado y vistas actualizadas correctamente.');
                return true;
            })
            .catch(err => {
                console.error('Error saveOrUpdateBlueprint:', err);
                alert('Error al guardar/actualizar el plano.');
                throw err;
            });
    }

    // --- DELETE current blueprint ---
    function deleteCurrentBlueprint() {
        if (!currentBlueprint) {
            alert('No hay plano seleccionado para eliminar.');
            return Promise.reject('no-current-blueprint');
        }
        if (!selectedAuthor) {
            alert('No hay autor seleccionado.');
            return Promise.reject('no-author');
        }
        // Guardamos nombre para la URL
        const bpname = currentBlueprint.name;
        // Limpiar canvas inmediatamente
        clearCanvasAndUI();
        // Ejecutar DELETE en backend
        const delPromise = (Backend.deleteBlueprint ? Backend.deleteBlueprint(selectedAuthor, bpname) : Promise.reject('backend no soporta delete'));
        return delPromise
            .then(() => {
                // luego pedir la lista actualizada del autor y actualizar UI
                if (Backend.getBlueprintsByAuthorPromise) {
                    return Backend.getBlueprintsByAuthorPromise(selectedAuthor);
                } else {
                    return new Promise((res) => Backend.getBlueprintsByAuthor(selectedAuthor, res));
                }
            })
            .then(authorList => {
                updateViewFromList(authorList);
                // recalcular total (opcional: si tienes getAllBlueprintsPromise, usarla)
                if (Backend.getAllBlueprintsPromise) {
                    return Backend.getAllBlueprintsPromise().then(all => {
                        const total = (all || []).filter(bp => (bp.author || '').toLowerCase() === (selectedAuthor || '').toLowerCase())
                                    .reduce((s, bp) => s + ((bp.points || []).length), 0);
                        $('#total-points').text(total);
                        return true;
                    });
                } else {
                    // fallback: compute sum from authorList
                    const total = (authorList || []).reduce((s, bp) => s + ((bp.points || []).length), 0);
                    $('#total-points').text(total);
                    return true;
                }
            })
            .then(() => {
                alert('Plano eliminado y lista actualizada.');
                return true;
            })
            .catch(err => {
                console.error('Error deleteCurrentBlueprint:', err);
                alert('Error al eliminar el plano.');
                throw err;
            });
    }

    // --- Export public API ---
    return {
        setBackendToMock,
        setBackendToApi,
        setAuthor,
        updateBlueprintsByAuthor,
        drawBlueprint,
        initCanvasEvents,
        saveOrUpdateBlueprint,
        createNewBlueprint,
        deleteCurrentBlueprint // <-- exportado
    };
})();
