module.exports = function(server) {
    var db = require('./db');
    var marked = require('marked');

    function getNotes(request, response, next) {
        db.notes.all(function(err, body) {
            if (err) {
                response.send(err);
            } else {
                response.send(body);
            }
        });
    }

    function getNote(request, response, next, id, responseCode) {
        var id = id || request.params.id;
        var responseCode = responseCode || 200;

        db.notes.find(id, function(err, body) {
            if (err) {
                response.send(err);
            } else {
                response.send(responseCode, body);
            }
        });
    }

    function putNote(request, response, next) {
        var sentNote = request.params;
        var note = {
            '_id': request.params.id, // we wan't the ID from the url
            '_rev': sentNote._rev,
            'doc_type': 'note',
            'name': sentNote.name,
            'content': sentNote.content
        };

        db.notes.save(note, function(err, id) {
            if(err) {
                response.send(err);
            } else {
                getNote(request, response, next, id);
            }
        });
    }

    function postNote(request, response, next) {
        var sentNote = request.params;
        var note = {
            "doc_type": "note",
            "name": sentNote.name,
            "content": sentNote.content
        };

        db.notes.save(note, function(err, id) {
            if(err) {
                response.send(err);
            } else {
                response.setHeader('Location', '/api/notes/' + id);
                getNote(request, response, next, id, 201);
            }
        });
    }

    server.get('/api/notes', getNotes);
    server.get('/api/notes/:id', getNote);
    server.put('/api/notes/:id', putNote);
    server.post('/api/notes', postNote);
};