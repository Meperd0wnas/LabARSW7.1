const BlueprintsModule = (function() {

    // Backend por defecto: mock
    let Backend = BlueprintsMockModule;
    let selectedAuthor = '';
    let currentBlueprint = null; // { author, name, points: [...], _isNew: true|false }

    // --- Backend switching ---
    function setBackendToMock() { Backend = BlueprintsMockModule; console.log('Backend -> MOCK'); }
    function setBackendToApi()  { Backend = BlueprintsApiClient; console.log('Backend -> API'); }

    // --- Author ---
    function setAuthor(author) {
        selectedAuthor = (author || '').trim();
        $('#selected-author').text(selectedAuthor || '-');
    }

    // --- Table UI ---
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
            // opcional: actualizar totals en tiempo real
            refreshTableTotalsFromMemory();
        };
        canvas.addEventListener('pointerdown', canvas._bpHandler);
    }

    // recompute totals using GET /blueprints (all) if available
    function recalcTotalPointsFromAll() {
        if (Backend.getAllBlueprintsPromise) {
            return Backend.getAllBlueprintsPromise().then(all => {
                const user = (all || []).filter(bp => (bp.author || '').toLowerCase() === (selectedAuthor || '').toLowerCase());
                const total = user.reduce((s, bp) => s + ((bp.points || []).length), 0);
                $('#total-points').text(total);
                return total;
            });
        } else {
            // fallback: re-fetch author list
            return updateBlueprintsByAuthor(selectedAuthor).then(list => {
                const total = (list || []).reduce((s, bp) => s + ((bp.points || []).length), 0);
                $('#total-points').text(total);
                return total;
            });
        }
    }

    function refreshTableTotalsFromMemory() {
        // simple approach: re-use author list fetch (keeps consistency)
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

        // limpiar canvas y crear objeto nuevo en memoria
        clearCanvasAndUI();
        currentBlueprint = {
            author: selectedAuthor,
            name: name,
            points: [],
            _isNew: true
        };

        // mostrar en UI que tenemos un nuevo plano abierto
        $('#current-plan').remove();
        $('<div id="current-plan" class="mb-3"><strong>Nuevo plano (no guardado): </strong>' + name + '</div>')
            .insertBefore('#blueprints-canvas');

        // repaint (vacío)
        repaintCanvas();
    }

    // --- Save or update (ahora soporta POST si _isNew) ---
    function saveOrUpdateBlueprint() {
        if (!currentBlueprint) { alert('No hay plano abierto para guardar.'); return Promise.reject('no-blueprint'); }
        if (!selectedAuthor) { alert('No hay autor seleccionado.'); return Promise.reject('no-author'); }

        // Payload normalizado
        const payload = {
            author: selectedAuthor,
            name: currentBlueprint.name,
            points: currentBlueprint.points || []
        };

        // Si es nuevo -> POST /blueprints
        const opPromise = (currentBlueprint._isNew ? (Backend.postBlueprint ? Backend.postBlueprint(payload) : Promise.reject('backend no soporta post')) :
            (Backend.putBlueprint ? Backend.putBlueprint(selectedAuthor, payload) : Promise.reject('backend no soporta put')));

        return opPromise
            .then(() => {
                // 1) GET /blueprints (todos) para recalcular total
                if (Backend.getAllBlueprintsPromise) {
                    return Backend.getAllBlueprintsPromise();
                } else {
                    // fallback a GET author list
                    return (Backend.getBlueprintsByAuthorPromise ? Backend.getBlueprintsByAuthorPromise(selectedAuthor) :
                        new Promise((res) => Backend.getBlueprintsByAuthor(selectedAuthor, res)));
                }
            })
            .then(allOrAuthorList => {
                const all = allOrAuthorList || [];
                // si vino la lista completa o sólo la del autor, computamos total
                const userList = (all.length > 0 && (all[0].author !== undefined)) ?
                    all.filter(bp => (bp.author || '').toLowerCase() === (selectedAuthor || '').toLowerCase()) :
                    (all || []);
                const total = (userList || []).reduce((s, bp) => s + ((bp.points || []).length), 0);
                $('#total-points').text(total);
                // 2) Finalmente recargar tabla del autor
                if (Backend.getBlueprintsByAuthorPromise) return Backend.getBlueprintsByAuthorPromise(selectedAuthor);
                return new Promise((res) => Backend.getBlueprintsByAuthor(selectedAuthor, res));
            })
            .then(authorList => {
                updateViewFromList(authorList);
                // si creamos uno nuevo, marcarlo como no-nuevo
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

    // Exponer funciones públicas
    return {
        setBackendToMock,
        setBackendToApi,
        setAuthor,
        updateBlueprintsByAuthor,
        drawBlueprint,
        initCanvasEvents,
        saveOrUpdateBlueprint,
        createNewBlueprint
    };
})();
