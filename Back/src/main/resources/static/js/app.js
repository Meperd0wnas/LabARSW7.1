const BlueprintsModule = (function() {

    // Backend activo (puede cambiarse dinámicamente)
    let Backend = BlueprintsMockModule;  // Inicialmente Mock

    // Estado privado
    let selectedAuthor = '';
    let blueprints = [];

    // Cambiar backend
    function setBackend(newBackend) {
        Backend = newBackend;
    }

    // Actualizar tabla desde lista transformada
    function updateViewFromList(transformedList) {
        const tbody = $('#blueprints-table tbody');
        tbody.empty();

        transformedList.forEach(bp => {
            const row = $('<tr></tr>');
            row.append(`<td>${bp.name}</td>`);
            row.append(`<td>${bp.points}</td>`);

            // Botón Dibujar
            const btn = $('<button class="btn btn-success btn-sm">Dibujar</button>');
            btn.click(() => drawBlueprint(selectedAuthor, bp.name));
            row.append($('<td></td>').append(btn));

            tbody.append(row);
        });

        const totalPoints = transformedList.reduce((sum, bp) => sum + bp.points, 0);
        $('#total-points').text(totalPoints);
    }

    // Dibujar plano en canvas
    function drawBlueprint(author, planName) {
        if (!Backend.getBlueprintsByAuthor) {
            console.error('El backend no tiene getBlueprintsByAuthor');
            return;
        }

        Backend.getBlueprintsByAuthor(author, function(list) {
            const blueprint = list.find(bp => bp.name === planName);
            if (!blueprint || !blueprint.points) return;

            // Campo plano actual
            let planField = $('#current-plan');
            if (planField.length === 0) {
                $('<div class="mb-3"><strong>Plano dibujado: </strong><span id="current-plan"></span></div>')
                    .insertBefore('#blueprints-canvas');
                planField = $('#current-plan');
            }
            planField.text(blueprint.name);

            // Canvas
            const canvas = document.getElementById('blueprints-canvas');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Dibujar líneas entre puntos
            ctx.beginPath();
            const points = blueprint.points;
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }

    // Cambiar autor
    function setAuthor(author) {
        selectedAuthor = author.trim();
    }

    // Actualizar listado de planos
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

    // Obtener planos actuales
    function getBlueprints() {
        return blueprints;
    }

    return {
        setAuthor,
        updateBlueprintsByAuthor,
        drawBlueprint,
        getBlueprints,
        setBackend
    };
})();
