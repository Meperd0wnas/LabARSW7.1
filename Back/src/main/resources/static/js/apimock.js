// Mock module — simula GET y PUT (devuelve Promises para compatibilidad)
const BlueprintsMockModule = (function() {
    const mockData = {
        "daniel": [
            { name: "casa1", points: [{x:50,y:50},{x:150,y:50},{x:150,y:150},{x:50,y:150},{x:50,y:50}] },
            { name: "casa2", points: [{x:100,y:100},{x:200,y:100},{x:200,y:200},{x:100,y:200},{x:100,y:100}] }
        ],
        "maria": [
            { name: "jardin", points: [{x:60,y:60},{x:120,y:10},{x:180,y:60},{x:150,y:150},{x:90,y:150},{x:60,y:60}] },
            { name: "terraza", points: [{x:30,y:30},{x:50,y:20},{x:80,y:40},{x:70,y:80} ] }
        ]
    };

    // Devuelve la lista completa de blueprints del autor (callback(list))
    function getBlueprintsByAuthor(author, callback) {
        const key = (author || '').toLowerCase();
        const list = mockData[key] ? mockData[key].map(bp => ({ name: bp.name, points: bp.points.slice() })) : [];
        // simulamos asincronía pequeña
        setTimeout(() => callback(list), 80);
    }

    // Simula PUT: actualiza (o crea) el blueprint, devuelve Promise
    function putBlueprint(author, name, blueprint) {
        return new Promise((resolve, reject) => {
            const key = (author || '').toLowerCase();
            if (!mockData[key]) mockData[key] = [];
            const idx = mockData[key].findIndex(bp => bp.name === name);
            if (idx === -1) {
                // crear
                mockData[key].push({ name: name, points: (blueprint.points || []).slice() });
            } else {
                // actualizar puntos
                mockData[key][idx].points = (blueprint.points || []).slice();
            }
            // simulamos latencia
            setTimeout(() => resolve({ success: true }), 120);
        });
    }

    // Exponer API (misma firma que apiclient)
    return {
        getBlueprintsByAuthor,
        putBlueprint
    };
})();

