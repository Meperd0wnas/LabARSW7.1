package edu.eci.arsw.blueprints.controllers;

import edu.eci.arsw.blueprints.model.Blueprint;
import edu.eci.arsw.blueprints.services.BlueprintsServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

@RestController
@RequestMapping(value = "/blueprints")
public class BlueprintAPIController {

    @Autowired
    private BlueprintsServices services;

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<?> manejadorGetRecursoBlueprints() {
        try {
            Set<Blueprint> data = services.getAllBlueprints();
            return new ResponseEntity<>(data, HttpStatus.OK);
        } catch (Exception ex) {
            Logger.getLogger(BlueprintAPIController.class.getName()).log(Level.SEVERE, null, ex);
            return new ResponseEntity<>("Error al obtener los planos", HttpStatus.NOT_FOUND);
        }
    }

    // Nuevo endpoint: GET /blueprints/{author}
    @GetMapping("/{author}")
    public ResponseEntity<?> manejadorGetBlueprintsPorAutor(@PathVariable("author") String author) {
        try {
            Set<Blueprint> data = services.getBlueprintsByAuthor(author);
            if (data.isEmpty()) {
                return new ResponseEntity<>("Autor no encontrado", HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(data, HttpStatus.OK);
        } catch (Exception ex) {
            Logger.getLogger(BlueprintAPIController.class.getName()).log(Level.SEVERE, null, ex);
            return new ResponseEntity<>("Error al obtener los planos del autor", HttpStatus.NOT_FOUND);
        }
    }

    // Nuevo endpoint: GET /blueprints/{author}/{bpname}
    @GetMapping("/{author}/{bpname}")
    public ResponseEntity<?> manejadorGetBlueprintPorAutorYNombre(
            @PathVariable("author") String author,
            @PathVariable("bpname") String bpname) {
        try {
            Blueprint bp = services.getBlueprint(author, bpname);
            return new ResponseEntity<>(bp, HttpStatus.OK);
        } catch (Exception ex) {
            Logger.getLogger(BlueprintAPIController.class.getName()).log(Level.SEVERE, null, ex);
            return new ResponseEntity<>("Blueprint no encontrado", HttpStatus.NOT_FOUND);
        }
    }

    // POST - crear nuevo plano
    @PostMapping
    public ResponseEntity<?> manejadorPostRecursoBlueprint(@RequestBody Blueprint bp) {
        try {
            services.addNewBlueprint(bp);
            return new ResponseEntity<>(HttpStatus.CREATED);
        } catch (Exception ex) {
            Logger.getLogger(BlueprintAPIController.class.getName()).log(Level.SEVERE, null, ex);
            return new ResponseEntity<>("Error al crear el plano", HttpStatus.FORBIDDEN);
        }
    }    


}

