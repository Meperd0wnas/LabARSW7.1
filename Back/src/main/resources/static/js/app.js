const BlueprintsModule = (function() {

    let Backend = BlueprintsMockModule;
    let selectedAuthor = '';
    let blueprints = [];
    let currentBlueprint = null;

    function setBackendToMock() {
        Backend = BlueprintsMockModule;
        console.log("Backend cambiado a MOCK");
    }

    function setBackendToApi() {
        Backend = BlueprintsApiClient;
        console.log("Backend cambiado a API real");
    }

    function setAuthor(author) {
        selectedAuthor = author.trim();
        $('#selected-author').text(selectedAuthor);
    }

    function updateViewFromList(list) {
        const tbody = $('#blueprints-table tbody');
        tbody.empty();

        list.forEach(bp => {
            const row = $('<tr></tr>');
            row.append(`<td>${bp.name}</td>`);
            row.append(`<td>${bp.points.length}</td>`);

            const btn = $('<button class="btn btn-success btn-sm">Dibujar</button>');
            btn.click(() => drawBlueprint(selectedAuthor, bp.name));
            row.append($('<td></td>').append(btn));

            tbody.append(row);
        });

        const totalPoints = list.reduce((sum, bp) => sum + bp.points.length, 0);
        $('#total-points').text(totalPoints);
    }

    function updateBlueprintsByAuthor(author) {
        Backend.getBlueprintsByAuthor(author, function(list) {
            blueprints = list;
            updateViewFromList(list);
        });
    }

    function drawBlueprint(author, planName) {
        Backend.getBlueprintsByAuthor(author, function(list) {
            const blueprint = list.find(bp => bp.name === planName);
            if (!blueprint) return;

            currentBlueprint = blueprint;

            $('#current-plan').remove();
            $('<div class="mb-3"><strong>Plano dibujado: </strong><span id="current-plan">'
              + blueprint.name + '</span></div>').insertBefore('#blueprints-canvas');

            repaintCanvas();
        });
    }

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

    function initCanvasEvents() {
        const canvas = document.getElementById('blueprints-canvas');
        canvas.addEventListener('pointerdown', function(event) {
            if (!currentBlueprint) return;
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            currentBlueprint.points.push({x, y});
            repaintCanvas();
        });
    }

    // 🔹 Guardar o actualizar el plano actual
    function saveOrUpdateBlueprint() {
        if (!currentBlueprint || !selectedAuthor) {
            alert("Debe seleccionar un autor y un plano antes de guardar.");
            return;
        }

        Backend.putBlueprint(selectedAuthor, currentBlueprint)
            .then(() => {
                alert("Plano guardado/actualizado correctamente.");
                updateBlueprintsByAuthor(selectedAuthor);
            })
            .catch(err => {
                console.error("Error al guardar el plano:", err);
                alert("Error al guardar el plano.");
            });
    }

    return {
        setBackendToMock,
        setBackendToApi,
        setAuthor,
        updateBlueprintsByAuthor,
        drawBlueprint,
        initCanvasEvents,
        saveOrUpdateBlueprint
    };
})();
