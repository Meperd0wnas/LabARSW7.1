package edu.eci.arsw.blueprints.persistence.impl;

import java.util.HashMap;
import java.util.Map;
import java.util.HashSet;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.stereotype.Repository;

import edu.eci.arsw.blueprints.model.Blueprint;
import edu.eci.arsw.blueprints.model.Point;
import edu.eci.arsw.blueprints.persistence.BlueprintNotFoundException;
import edu.eci.arsw.blueprints.persistence.BlueprintPersistenceException;
import edu.eci.arsw.blueprints.persistence.BlueprintsPersistence;

@Repository
public class InMemoryBlueprintPersistence implements BlueprintsPersistence {

    private final Map<Tuple<String,String>, Blueprint> blueprints = new HashMap<>();
    private static final Logger logger = Logger.getLogger(InMemoryBlueprintPersistence.class.getName());

    public InMemoryBlueprintPersistence() {
        // Creamos algunos puntos de ejemplo (usamos los constructores existentes)
        Point[] points1 = new Point[]{new Point(0, 0), new Point(10, 10)};
        Point[] points2 = new Point[]{new Point(5, 5), new Point(15, 15)};
        Point[] points3 = new Point[]{new Point(20, 20), new Point(30, 30)};
        Point[] points4 = new Point[]{new Point(40, 40), new Point(50, 50)};

        Blueprint bp1 = new Blueprint("daniel", "casa1", points1);
        Blueprint bp2 = new Blueprint("daniel", "casa2", points2);
        Blueprint bp3 = new Blueprint("maria", "jardin", points3);
        Blueprint bp4 = new Blueprint("carlos", "edificio", points4);

        // Guardarlos normalizando las claves a minúsculas
        blueprints.put(makeKey(bp1.getAuthor(), bp1.getName()), bp1);
        blueprints.put(makeKey(bp2.getAuthor(), bp2.getName()), bp2);
        blueprints.put(makeKey(bp3.getAuthor(), bp3.getName()), bp3);
        blueprints.put(makeKey(bp4.getAuthor(), bp4.getName()), bp4);
    }

    private Tuple<String,String> makeKey(String author, String name) {
        String a = (author == null) ? "" : author.toLowerCase();
        String n = (name == null) ? "" : name.toLowerCase();
        return new Tuple<>(a, n);
    }

    @Override
    public void saveBlueprint(Blueprint bp) throws BlueprintPersistenceException {
        Tuple<String,String> key = makeKey(bp.getAuthor(), bp.getName());
        if (blueprints.containsKey(key)) {
            throw new BlueprintPersistenceException("El plano ya existe: " + key);
        }
        blueprints.put(key, bp);
        logger.log(Level.INFO, "saveBlueprint -> guardado {0}/{1}", new Object[]{bp.getAuthor(), bp.getName()});
    }

    @Override
    public Blueprint getBlueprint(String author, String name) throws BlueprintNotFoundException {
        Tuple<String,String> key = makeKey(author, name);
        Blueprint bp = blueprints.get(key);
        if (bp == null) {
            throw new BlueprintNotFoundException("No se encontró el plano " + name + " del autor " + author);
        }
        return bp;
    }

    @Override
    public Set<Blueprint> getBlueprintsByAuthor(String author) throws BlueprintNotFoundException {
        Set<Blueprint> result = new HashSet<>();
        String a = (author == null) ? "" : author.toLowerCase();
        for (Map.Entry<Tuple<String,String>, Blueprint> e : blueprints.entrySet()) {
            if (a.equals(e.getKey().getElem1())) {
                result.add(e.getValue());
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

    @Override
    public void updateBlueprint(String author, String name, Blueprint nuevo) {
        Tuple<String, String> key = makeKey(author, name);
        // En vez de sólo poner, intentamos preservar el objeto existente y actualizar su lista de puntos
        if (blueprints.containsKey(key)) {
            Blueprint existing = blueprints.get(key);
            existing.setPoints(nuevo.getPoints()); // reemplaza puntos
            logger.log(Level.INFO, "updateBlueprint -> reemplazados puntos de {0}/{1}. now={2}",
                    new Object[]{author, name, existing.getPoints().size()});
        } else {
            // Si no existe, lo creamos guardándolo con la key normalizada
            // Asegurar que el blueprint tenga author/name consistentes
            if (nuevo.getAuthor() == null || nuevo.getAuthor().isEmpty()) nuevo.setAuthor(author);
            if (nuevo.getName() == null || nuevo.getName().isEmpty()) nuevo.setName(name);
            blueprints.put(key, nuevo);
            logger.log(Level.INFO, "updateBlueprint -> creado nuevo blueprint {0}/{1}", new Object[]{author, name});
        }
    }
}



