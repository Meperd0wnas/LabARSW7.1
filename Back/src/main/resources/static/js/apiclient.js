const BlueprintsApiClient = (function() {

    // GET /blueprints/{author} -> callback + Promise
    function getBlueprintsByAuthor(author, callback) {
        getBlueprintsByAuthorPromise(author)
          .then(list => callback(list))
          .catch(err => { console.error(err); callback([]); });
    }
    function getBlueprintsByAuthorPromise(author) {
        return $.get(`/blueprints/${encodeURIComponent(author)}`).then(data => {
            return (data || []).map(bp => ({
                author: bp.author || bp.getAuthor ? bp.getAuthor() : author,
                name: bp.name,
                points: bp.points || []
            }));
        });
    }

    // GET /blueprints -> Promise con todos
    function getAllBlueprintsPromise() {
        return $.get('/blueprints').then(data => {
            return (data || []).map(bp => ({
                author: bp.author || bp.getAuthor ? bp.getAuthor() : '',
                name: bp.name,
                points: bp.points || []
            }));
        });
    }

    // PUT /blueprints/{author}/{bpname}
    function putBlueprint(author, blueprint) {
        const payload = { author: author, name: blueprint.name, points: blueprint.points || [] };
        return $.ajax({
            url: `/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(blueprint.name)}`,
            type: 'PUT',
            data: JSON.stringify(payload),
            contentType: "application/json"
        });
    }

    // POST /blueprints
    function postBlueprint(blueprint) {
        const payload = { author: blueprint.author, name: blueprint.name, points: blueprint.points || [] };
        return $.ajax({
            url: `/blueprints`,
            type: 'POST',
            data: JSON.stringify(payload),
            contentType: "application/json"
        });
    }

    // DELETE /blueprints/{author}/{bpname}
    function deleteBlueprint(author, bpname) {
        return $.ajax({
            url: `/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(bpname)}`,
            type: 'DELETE'
        });
    }

    return {
        getBlueprintsByAuthor,
        getBlueprintsByAuthorPromise,
        getAllBlueprintsPromise,
        putBlueprint,
        postBlueprint,
        deleteBlueprint
    };
})();
