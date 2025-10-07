const BlueprintsModule = (function() {

    // Backend activo (puede cambiarse dinámicamente)
    let Backend = BlueprintsMockModule;  // Inicialmente Mock

    // Estado interno
    let selectedAuthor = '';
    let blueprints = [];
    let currentBlueprint = null;

    // Cambiar backend
    function setBackend(newBackend) {
        Backend = newBackend;
    }

    // Actualizar tabla
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

    // Dibujar plano
    function drawBlueprint(author, planName) {
        Backend.getBlueprintsByAuthor(author, function(list) {
            const blueprint = list.find(bp => bp.name === planName);
            if (!blueprint || !blueprint.points) return;

            currentBlueprint = blueprint;

            // Mostrar nombre del plano actual
            $('#current-plan').remove();
            $('<div id="current-plan" class="mb-3"><strong>Plano dibujado: </strong>' + blueprint.name + '</div>')
                .insertBefore('#blueprints-canvas');

            const canvas = document.getElementById('blueprints-canvas');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

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

    // Capturar clics en el canvas
    function initCanvasEvents() {
        const canvas = document.getElementById('blueprints-canvas');
        const ctx = canvas.getContext('2d');

        canvas.addEventListener('pointerdown', function(event) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            console.log(`Click detectado en: (${x.toFixed(1)}, ${y.toFixed(1)})`);

            // Dibujar punto azul donde se hizo clic
            ctx.fillStyle = 'blue';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    // Cambiar autor
    function setAuthor(author) {
        selectedAuthor = author.trim();
    }

    // Actualizar planos por autor
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
        initCanvasEvents
    };
})();
