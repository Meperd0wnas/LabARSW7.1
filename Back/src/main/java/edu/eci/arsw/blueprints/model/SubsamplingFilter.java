package edu.eci.arsw.blueprints.model;

import java.util.ArrayList;
import java.util.List;

public class SubsamplingFilter implements BlueprintFilter {

    @Override
    public Blueprint applyFilter(Blueprint bp) {
        List<Point> points = bp.getPoints();
        List<Point> filtered = new ArrayList<>();

        for (int i = 0; i < points.size(); i++) {
            if (i % 2 == 0) { // conservar 1 de cada 2
                filtered.add(points.get(i));
            }
        }

        return new Blueprint(bp.getAuthor(), bp.getName(), filtered.toArray(new Point[0]));
    }
}
