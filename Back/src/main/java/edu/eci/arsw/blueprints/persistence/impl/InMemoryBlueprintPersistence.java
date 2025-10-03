/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.blueprints.persistence.impl;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Repository;

import edu.eci.arsw.blueprints.model.Blueprint;
import edu.eci.arsw.blueprints.model.Point;
import edu.eci.arsw.blueprints.persistence.BlueprintNotFoundException;
import edu.eci.arsw.blueprints.persistence.BlueprintPersistenceException;
import edu.eci.arsw.blueprints.persistence.BlueprintsPersistence;

import java.util.HashSet;
import java.util.Set;

@Repository
public class InMemoryBlueprintPersistence implements BlueprintsPersistence {

    private final Map<Tuple<String,String>, Blueprint> blueprints = new HashMap<>();

    public InMemoryBlueprintPersistence() {
        // Creamos algunos puntos de ejemplo
        Point[] points1 = new Point[]{new Point(0, 0), new Point(10, 10)};
        Point[] points2 = new Point[]{new Point(5, 5), new Point(15, 15)};
        Point[] points3 = new Point[]{new Point(20, 20), new Point(30, 30)};
        Point[] points4 = new Point[]{new Point(40, 40), new Point(50, 50)};

        // Crear planos
        Blueprint bp1 = new Blueprint("daniel", "casa1", points1);
        Blueprint bp2 = new Blueprint("daniel", "casa2", points2); //autor repetido
        Blueprint bp3 = new Blueprint("maria", "jardin", points3);
        Blueprint bp4 = new Blueprint("carlos", "edificio", points4);

        // Guardarlos en el mapa
        blueprints.put(new Tuple<>(bp1.getAuthor(), bp1.getName()), bp1);
        blueprints.put(new Tuple<>(bp2.getAuthor(), bp2.getName()), bp2);
        blueprints.put(new Tuple<>(bp3.getAuthor(), bp3.getName()), bp3);
        blueprints.put(new Tuple<>(bp4.getAuthor(), bp4.getName()), bp4);
    }

    @Override
    public void saveBlueprint(Blueprint bp) throws BlueprintPersistenceException {
        Tuple<String,String> key = new Tuple<>(bp.getAuthor(), bp.getName());
        if (blueprints.containsKey(key)) {
            throw new BlueprintPersistenceException("El plano ya existe: " + key);
        }
        blueprints.put(key, bp);
    }

    @Override
    public Blueprint getBlueprint(String author, String name) throws BlueprintNotFoundException {
        Tuple<String,String> key = new Tuple<>(author, name);
        Blueprint bp = blueprints.get(key);
        if (bp == null) {
            throw new BlueprintNotFoundException("No se encontró el plano " + name + " del autor " + author);
        }
        return bp;
    }

    @Override
    public Set<Blueprint> getBlueprintsByAuthor(String author) throws BlueprintNotFoundException {
        Set<Blueprint> result = new HashSet<>();
        for (Tuple<String,String> key : blueprints.keySet()) {
            if (key.getElem1().equals(author)) {
                result.add(blueprints.get(key));
            }
        }
        if (result.isEmpty()) {
            throw new BlueprintNotFoundException("No se encontraron planos del autor " + author);
        }
        return result;
    }

    @Override
    public Set<Blueprint> getAllBlueprints() {
        return new HashSet<>(blueprints.values());
    }

    
    public void updateBlueprint(String author, String name, Blueprint nuevo) {
        Tuple<String, String> key = new Tuple<>(author, name);
        if (!blueprints.containsKey(key)) {
        }
        blueprints.put(key, nuevo);
    }


    
}


