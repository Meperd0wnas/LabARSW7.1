const BlueprintsModule = (function() {

    let Backend = BlueprintsMockModule; // Cambiable a BlueprintsApiClient
    let selectedAuthor = '';
    let blueprints = [];
    let currentBlueprint = null; // 🔹 nuevo: plano actualmente dibujado

    function setBackend(newBackend) {
        Backend = newBackend;
    }

    function updateViewFromList(transformedList) {
        const tbody = $('#blueprints-table tbody');
        tbody.empty();

        transformedList.forEach(bp => {
            const row = $('<tr></tr>');
            row.append(`<td>${bp.name}</td>`);
            row.append(`<td>${bp.points}</td>`);

            const btn = $('<button class="btn btn-success btn-sm">Dibujar</button>');
            btn.click(() => drawBlueprint(selectedAuthor, bp.name));
            row.append($('<td></td>').append(btn));

            tbody.append(row);
        });

        const totalPoints = transformedList.reduce((sum, bp) => sum + bp.points, 0);
        $('#total-points').text(totalPoints);
    }

    // 🔹 Dibujar plano en canvas
    function drawBlueprint(author, planName) {
        if (!Backend.getBlueprintsByAuthor) return;

        Backend.getBlueprintsByAuthor(author, function(list) {
            const blueprint = list.find(bp => bp.name === planName);
            if (!blueprint || !blueprint.points) return;

            currentBlueprint = blueprint; // 🔹 Guardamos el plano activo

            let planField = $('#current-plan');
            if (planField.length === 0) {
                $('<div class="mb-3"><strong>Plano dibujado: </strong><span id="current-plan"></span></div>')
                    .insertBefore('#blueprints-canvas');
                planField = $('#current-plan');
            }
            planField.text(blueprint.name);

            repaintCanvas();
        });
    }

    // 🔹 Repinta el canvas con los puntos actuales
    function repaintCanvas() {
        if (!currentBlueprint) return;

        const canvas = document.getElementById('blueprints-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const points = currentBlueprint.points;
        if (points.length === 0) return;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // 🔹 Inicializa eventos del canvas
    function initCanvasEvents() {
        const canvas = document.getElementById('blueprints-canvas');
        const ctx = canvas.getContext('2d');

        canvas.addEventListener('pointerdown', function(event) {
            if (!currentBlueprint) return; // si no hay plano, no hacer nada

            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            // agregar punto al plano actual en memoria
            currentBlueprint.points.push({ x, y });

            // redibujar plano actualizado
            repaintCanvas();
        });
    }

    function setAuthor(author) {
        selectedAuthor = author.trim();
    }

    function updateBlueprintsByAuthor(author) {
        selectedAuthor = author.trim();
        Backend.getBlueprintsByAuthor(selectedAuthor, function(list) {
            const transformed = list.map(bp => ({
                name: bp.name,
                points: bp.points.length
            }));
            updateViewFromList(transformed);
            blueprints = transformed;
        });
    }

    function getBlueprints() {
        return blueprints;
    }

    return {
        setAuthor,
        updateBlueprintsByAuthor,
        drawBlueprint,
        getBlueprints,
        setBackend,
        initCanvasEvents // 🔹 nuevo: inicialización pública de eventos
    };
})();
