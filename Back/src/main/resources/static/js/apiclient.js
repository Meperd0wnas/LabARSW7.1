// src/main/resources/static/js/apiclient.js
const BlueprintsApiClient = (function() {
    // Estado interno
    let selectedAuthor = '';
    let blueprints = [];

    // Cambiar el autor actualmente seleccionado
    function setAuthor(author) {
        selectedAuthor = author.trim();
    }

    // Actualiza la tabla y los campos de la vista (opcional, solo si quieres render desde aquí)
    function updateView() {
        document.getElementById('selected-author').textContent = selectedAuthor;

        const tbody = document.getElementById('blueprints-table').querySelector('tbody');
        tbody.innerHTML = '';
        blueprints.forEach(bp => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${bp.name}</td><td>${bp.points.length}</td>`;
            tbody.appendChild(row);
        });

        const totalPoints = blueprints.reduce((sum, bp) => sum + bp.points.length, 0);
        document.getElementById('total-points').textContent = totalPoints;
    }

    // Fetch real de los planos del autor seleccionado
    function fetchBlueprints() {
        if (!selectedAuthor) return;

        $.get(`/blueprints/${encodeURIComponent(selectedAuthor)}`)
            .done(function(data) {
                blueprints = data; // guardamos los planos completos
                updateView();
            })
            .fail(function(err) {
                console.error('Error al obtener planos:', err);
                blueprints = [];
                updateView();
                alert('No se encontraron planos para el autor.');
            });
    }

    // Devuelve la lista de planos vía callback (simula la función del mock)
    function getBlueprintsByAuthor(author, callback) {
        $.get(`/blueprints/${encodeURIComponent(author)}`)
            .done(function(data) {
                // Convertimos a la misma estructura que usa el mock {name, points}
                const transformed = data.map(bp => ({
                    name: bp.name,
                    points: bp.points
                }));
                callback(transformed);
            })
            .fail(function(err) {
                console.error('Error al obtener planos del autor:', err);
                callback([]); // entregar lista vacía si falla
            });
    }

    return {
        setAuthor,
        fetchBlueprints,
        getBlueprintsByAuthor
    };
})();
