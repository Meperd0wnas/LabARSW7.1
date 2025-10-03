const BlueprintsMockModule = (function() {
    let selectedAuthor = '';
    let blueprints = [];

    const mockData = {
        "daniel": [
            { name: "casa1", points: [{x:0,y:0},{x:10,y:10},{x:5,y:5}] },
            {
                name: "casa2",
                points: [
                    {x:50, y:150},  // esquina inferior izquierda
                    {x:50, y:80},   // esquina superior izquierda
                    {x:150, y:80},  // esquina superior derecha
                    {x:150, y:150}, // esquina inferior derecha
                    {x:50, y:150},  // cerrar base del rectángulo

                    // Techo
                    {x:50, y:80},   // esquina superior izquierda del rectángulo
                    {x:100, y:30},  // punto central del techo (pico)
                    {x:150, y:80},  // esquina superior derecha del rectángulo
                ]
            },
            { name: "casa3", points: [{x:1,y:1},{x:2,y:2}] }
        ],
        "maria": [
            { name: "jardin", points: [{x:20,y:20},{x:30,y:30}] },
            { name: "terraza", points: [{x:0,y:0},{x:1,y:1},{x:2,y:2},{x:3,y:3}] }
        ],
        "carlos": [
            { name: "edificio", points: [{x:40,y:40},{x:50,y:50},{x:60,y:60}] },
            { name: "garaje", points: [{x:10,y:10}] }
        ]
    };

    function getBlueprintsByAuthor(author, callback) {
        const list = mockData[author.toLowerCase()] || [];
        callback(list);
    }

    function getBlueprintsByNameAndAuthor(author, planName, callback) {
        const list = mockData[author.toLowerCase()] || [];
        const blueprint = list.find(bp => bp.name === planName);
        callback(blueprint || null);
    }

    return {
        getBlueprintsByAuthor,
        getBlueprintsByNameAndAuthor
    };
})();
