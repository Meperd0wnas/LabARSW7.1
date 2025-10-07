const BlueprintsMockModule = (function() {
    const mockData = {
        "daniel": [
            { author: "daniel", name: "casa1", points: [{x:0,y:0},{x:10,y:10},{x:5,y:5}] },
            { author: "daniel", name: "casa2", points: [{x:50,y:80},{x:150,y:80},{x:100,y:30}] }
        ],
        "maria": [
            { author: "maria", name: "jardin", points: [{x:20,y:20},{x:30,y:30}] }
        ]
    };

    // Promise: GET /blueprints/{author}
    function getBlueprintsByAuthorPromise(author) {
        return new Promise((resolve) => {
            const key = (author || '').toLowerCase();
            const list = (mockData[key] || []).map(bp => ({ author: bp.author, name: bp.name, points: bp.points.slice() }));
            setTimeout(() => resolve(list), 60);
        });
    }
    function getBlueprintsByAuthor(author, callback) {
        getBlueprintsByAuthorPromise(author).then(callback);
    }

    // Promise: GET /blueprints (todos)
    function getAllBlueprintsPromise() {
        return new Promise((resolve) => {
            const all = [];
            Object.keys(mockData).forEach(k => {
                mockData[k].forEach(bp => all.push({ author: bp.author, name: bp.name, points: bp.points.slice() }));
            });
            setTimeout(() => resolve(all), 60);
        });
    }

    // POST /blueprints -> create new blueprint
    // recibe blueprint { author, name, points }
    function postBlueprint(blueprint) {
        return new Promise((resolve, reject) => {
            if (!blueprint || !blueprint.author || !blueprint.name) {
                return reject({ message: 'Falta author o name' });
            }
            const key = (blueprint.author || '').toLowerCase();
            if (!mockData[key]) mockData[key] = [];
            const exists = mockData[key].some(bp => bp.name === blueprint.name);
            if (exists) {
                // simular conflict / forbiden
                return reject({ message: 'Blueprint ya existe' });
            } else {
                mockData[key].push({ author: blueprint.author, name: blueprint.name, points: (blueprint.points || []).slice() });
                setTimeout(() => resolve({ success: true }), 120);
            }
        });
    }

    // PUT /blueprints/{author}/{name} (ya lo tenías)
    function putBlueprint(author, blueprint) {
        return new Promise((resolve) => {
            const key = (author || '').toLowerCase();
            if (!mockData[key]) mockData[key] = [];
            const idx = mockData[key].findIndex(b => b.name === blueprint.name);
            const stored = { author: blueprint.author || author, name: blueprint.name, points: (blueprint.points || []).slice() };
            if (idx >= 0) mockData[key][idx] = stored;
            else mockData[key].push(stored);
            setTimeout(() => resolve({ success: true }), 120);
        });
    }

    return {
        getBlueprintsByAuthor,
        getBlueprintsByAuthorPromise,
        getAllBlueprintsPromise,
        postBlueprint,
        putBlueprint
    };
})();
