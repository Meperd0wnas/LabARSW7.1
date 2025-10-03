package edu.eci.arsw.blueprints.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class RedundancyFilter implements BlueprintFilter {

    @Override
    public Blueprint applyFilter(Blueprint bp) {
        List<Point> points = bp.getPoints();
        List<Point> filtered = new ArrayList<>();

        if (!points.isEmpty()) {
            filtered.add(points.get(0));
            for (int i = 1; i < points.size(); i++) {
                if (!points.get(i).equals(points.get(i - 1))) {
                    filtered.add(points.get(i));
                }
            }
        }

        return new Blueprint(bp.getAuthor(), bp.getName(), filtered.toArray(new Point[0]));
    }
}
