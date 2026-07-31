import type { Annotation, Point, ShapeAnnotation, Stroke } from "./types";

export const distanceToSegment = (point: Point, start: Point, end: Point) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (dx === 0 && dy === 0) return Math.hypot(point.x - start.x, point.y - start.y);
  const amount = Math.max(
    0,
    Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy)),
  );
  return Math.hypot(point.x - (start.x + amount * dx), point.y - (start.y + amount * dy));
};

const strokeHit = (stroke: Stroke, point: Point, radius: number) => {
  if (stroke.points.length === 1) {
    return distanceToSegment(point, stroke.points[0], stroke.points[0]) <= radius + stroke.size / 2;
  }
  return stroke.points.some((current, index) => {
    const next = stroke.points[index + 1];
    return next ? distanceToSegment(point, current, next) <= radius + stroke.size / 2 : false;
  });
};

const shapeHit = (shape: ShapeAnnotation, point: Point, radius: number) => {
  if (shape.shape === "arrow") {
    return (
      distanceToSegment(
        point,
        { x: shape.x, y: shape.y },
        { x: shape.x + shape.width, y: shape.y + shape.height },
      ) <= radius + shape.size / 2
    );
  }
  const left = Math.min(shape.x, shape.x + shape.width) - radius;
  const right = Math.max(shape.x, shape.x + shape.width) + radius;
  const top = Math.min(shape.y, shape.y + shape.height) - radius;
  const bottom = Math.max(shape.y, shape.y + shape.height) + radius;
  return point.x >= left && point.x <= right && point.y >= top && point.y <= bottom;
};

export const findAnnotationAtPoint = (annotations: Annotation[], point: Point, radius = 12) =>
  [...annotations]
    .reverse()
    .find((annotation) =>
      annotation.type === "stroke" ? strokeHit(annotation, point, radius) : shapeHit(annotation, point, radius),
    );
