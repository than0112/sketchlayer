import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { findAnnotationAtPoint } from "../lib/geometry";
import { CANVAS_SIZE, DEFAULT_BACKGROUND } from "../lib/serialization";
import type {
  Annotation,
  BrushStyle,
  CanvasBackground,
  DrawingTool,
  Point,
  ShapeAnnotation,
  SketchValue,
  Stroke,
} from "../lib/types";

export type SketchCanvasHandle = {
  exportPng: () => Promise<Blob>;
};

type SketchCanvasProps = {
  value?: SketchValue;
  defaultValue?: SketchValue;
  onChange?: (value: SketchValue) => void;
  tool: DrawingTool;
  brush: BrushStyle;
  background?: CanvasBackground;
  backgroundImage?: string;
  onBackgroundImageStatus?: (status: "loaded" | "error") => void;
  readonly?: boolean;
  label?: string;
};

const isShapeTool = (tool: DrawingTool): tool is ShapeAnnotation["shape"] =>
  tool === "arrow" || tool === "rectangle" || tool === "circle";

const drawStroke = (context: CanvasRenderingContext2D, stroke: Stroke) => {
  const [first, ...rest] = stroke.points;
  if (!first) return;

  context.save();
  context.globalAlpha = stroke.opacity;
  context.strokeStyle = stroke.color;
  context.fillStyle = stroke.color;
  context.lineWidth = stroke.size;
  context.lineCap = "round";
  context.lineJoin = "round";

  if (rest.length === 0) {
    context.beginPath();
    context.arc(first.x, first.y, stroke.size / 2, 0, Math.PI * 2);
    context.fill();
  } else {
    context.beginPath();
    context.moveTo(first.x, first.y);
    rest.forEach((point, index) => {
      const previous = stroke.points[index];
      context.quadraticCurveTo(previous.x, previous.y, (previous.x + point.x) / 2, (previous.y + point.y) / 2);
    });
    const last = stroke.points.at(-1);
    if (last) context.lineTo(last.x, last.y);
    context.stroke();
  }
  context.restore();
};

const drawArrow = (context: CanvasRenderingContext2D, shape: ShapeAnnotation) => {
  const endX = shape.x + shape.width;
  const endY = shape.y + shape.height;
  const angle = Math.atan2(shape.height, shape.width);
  const head = Math.max(10, shape.size * 3);
  context.beginPath();
  context.moveTo(shape.x, shape.y);
  context.lineTo(endX, endY);
  context.moveTo(endX, endY);
  context.lineTo(endX - head * Math.cos(angle - Math.PI / 6), endY - head * Math.sin(angle - Math.PI / 6));
  context.moveTo(endX, endY);
  context.lineTo(endX - head * Math.cos(angle + Math.PI / 6), endY - head * Math.sin(angle + Math.PI / 6));
  context.stroke();
};

const drawShape = (context: CanvasRenderingContext2D, shape: ShapeAnnotation) => {
  context.save();
  context.globalAlpha = shape.opacity;
  context.strokeStyle = shape.strokeColor;
  context.fillStyle = shape.fillColor ?? "transparent";
  context.lineWidth = shape.size;
  context.lineCap = "round";
  context.lineJoin = "round";
  if (shape.dashed) context.setLineDash([8, 6]);

  if (shape.shape === "arrow") {
    drawArrow(context, shape);
  } else if (shape.shape === "circle") {
    context.beginPath();
    context.ellipse(
      shape.x + shape.width / 2,
      shape.y + shape.height / 2,
      Math.abs(shape.width / 2),
      Math.abs(shape.height / 2),
      0,
      0,
      Math.PI * 2,
    );
    if (shape.fillColor) context.fill();
    context.stroke();
  } else {
    if (shape.fillColor) context.fillRect(shape.x, shape.y, shape.width, shape.height);
    context.strokeRect(shape.x, shape.y, shape.width, shape.height);
  }
  context.restore();
};

const drawAnnotation = (context: CanvasRenderingContext2D, annotation: Annotation) => {
  if (annotation.type === "stroke") drawStroke(context, annotation);
  else drawShape(context, annotation);
};

const drawBackground = (
  context: CanvasRenderingContext2D,
  background: CanvasBackground,
  image: HTMLImageElement | null,
) => {
  context.save();
  context.globalAlpha = 1;
  if (background.type === "gradient") {
    const radians = (background.angle * Math.PI) / 180;
    const length = Math.hypot(CANVAS_SIZE.width, CANVAS_SIZE.height);
    const dx = (Math.cos(radians) * length) / 2;
    const dy = (Math.sin(radians) * length) / 2;
    const gradient = context.createLinearGradient(
      CANVAS_SIZE.width / 2 - dx,
      CANVAS_SIZE.height / 2 - dy,
      CANVAS_SIZE.width / 2 + dx,
      CANVAS_SIZE.height / 2 + dy,
    );
    gradient.addColorStop(0, background.from);
    gradient.addColorStop(1, background.to);
    context.fillStyle = gradient;
  } else {
    context.fillStyle = background.value;
  }
  context.fillRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height);

  if (image) {
    const scale = Math.min(CANVAS_SIZE.width / image.naturalWidth, CANVAS_SIZE.height / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    context.drawImage(image, (CANVAS_SIZE.width - width) / 2, (CANVAS_SIZE.height - height) / 2, width, height);
  }

  if (background.grid) {
    context.globalAlpha = 0.55;
    context.fillStyle = "#d8d3c9";
    for (let x = 20; x < CANVAS_SIZE.width; x += 20) {
      for (let y = 20; y < CANVAS_SIZE.height; y += 20) {
        context.fillRect(x, y, 1.25, 1.25);
      }
    }
  }
  context.restore();
};

const makeId = () =>
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `annotation-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const SketchCanvas = forwardRef<SketchCanvasHandle, SketchCanvasProps>(function SketchCanvas(
  {
    value,
    defaultValue = { annotations: [] },
    onChange,
    tool,
    brush,
    background = DEFAULT_BACKGROUND,
    backgroundImage,
    onBackgroundImageStatus,
    readonly = false,
    label = "SketchLayer drawing canvas",
  },
  forwardedRef,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerIdRef = useRef<number | null>(null);
  const draftRef = useRef<Annotation | null>(null);
  const eraseBaseRef = useRef<Annotation[]>([]);
  const erasedIdsRef = useRef<Set<string>>(new Set());
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [draft, setDraft] = useState<Annotation | null>(null);
  const [erasedIds, setErasedIds] = useState<Set<string>>(() => new Set());
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [viewport, setViewport] = useState<{ width: number; height: number; dpr: number }>({
    width: CANVAS_SIZE.width,
    height: CANVAS_SIZE.height,
    dpr: 1,
  });

  const currentValue = value ?? internalValue;
  const visibleAnnotations = useMemo(
    () => currentValue.annotations.filter((annotation) => !erasedIds.has(annotation.id)),
    [currentValue.annotations, erasedIds],
  );

  const commit = useCallback(
    (annotations: Annotation[]) => {
      const next = { annotations };
      if (value === undefined) setInternalValue(next);
      onChange?.(next);
    },
    [onChange, value],
  );

  useImperativeHandle(
    forwardedRef,
    () => ({
      exportPng: () =>
        new Promise<Blob>((resolve, reject) => {
          const output = document.createElement("canvas");
          output.width = CANVAS_SIZE.width;
          output.height = CANVAS_SIZE.height;
          const context = output.getContext("2d");
          if (!context) {
            reject(new Error("Canvas export context is unavailable."));
            return;
          }
          drawBackground(context, background, loadedImage);
          visibleAnnotations.forEach((annotation) => drawAnnotation(context, annotation));
          output.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("PNG export failed."));
          }, "image/png");
        }),
    }),
    [background, loadedImage, visibleAnnotations],
  );

  useEffect(() => {
    if (!backgroundImage) {
      setLoadedImage(null);
      return;
    }
    const image = new Image();
    image.onload = () => {
      setLoadedImage(image);
      onBackgroundImageStatus?.("loaded");
    };
    image.onerror = () => {
      setLoadedImage(null);
      onBackgroundImageStatus?.("error");
    };
    image.src = backgroundImage;
    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [backgroundImage, onBackgroundImageStatus]);

  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    setViewport({ width: rect.width, height: rect.height, dpr: window.devicePixelRatio || 1 });
  }, []);

  useEffect(() => {
    syncCanvasSize();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(syncCanvasSize);
    observer.observe(canvas);
    window.addEventListener("resize", syncCanvasSize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncCanvasSize);
    };
  }, [syncCanvasSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    canvas.width = Math.max(1, Math.round(viewport.width * viewport.dpr));
    canvas.height = Math.max(1, Math.round(viewport.height * viewport.dpr));
    context.setTransform(
      (viewport.width / CANVAS_SIZE.width) * viewport.dpr,
      0,
      0,
      (viewport.height / CANVAS_SIZE.height) * viewport.dpr,
      0,
      0,
    );
    context.clearRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height);
    drawBackground(context, background, loadedImage);
    visibleAnnotations.forEach((annotation) => drawAnnotation(context, annotation));
    if (draft) drawAnnotation(context, draft);
  }, [background, draft, loadedImage, viewport, visibleAnnotations]);

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * CANVAS_SIZE.width,
      y: ((event.clientY - rect.top) / rect.height) * CANVAS_SIZE.height,
      pressure: event.pressure || 0.5,
    };
  };

  const eraseAt = (point: Point) => {
    const available = eraseBaseRef.current.filter((annotation) => !erasedIdsRef.current.has(annotation.id));
    const match = findAnnotationAtPoint(available, point);
    if (!match) return;
    const next = new Set(erasedIdsRef.current);
    next.add(match.id);
    erasedIdsRef.current = next;
    setErasedIds(next);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (readonly || pointerIdRef.current !== null || event.button !== 0) return;
    event.preventDefault();
    pointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointFromEvent(event);

    if (tool === "eraser") {
      eraseBaseRef.current = currentValue.annotations;
      erasedIdsRef.current = new Set();
      setErasedIds(erasedIdsRef.current);
      eraseAt(point);
      return;
    }

    if (isShapeTool(tool)) {
      const shape: ShapeAnnotation = {
        id: makeId(),
        type: "shape",
        shape: tool,
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        strokeColor: brush.color,
        size: brush.size,
        opacity: brush.opacity,
        semanticColor: brush.semanticColor,
      };
      draftRef.current = shape;
      setDraft(shape);
      return;
    }

    const stroke: Stroke = {
      id: makeId(),
      type: "stroke",
      tool,
      points: [point],
      color: brush.color,
      size: tool === "highlighter" ? Math.max(brush.size * 4, 16) : brush.size,
      opacity: tool === "highlighter" ? Math.min(brush.opacity, 0.28) : brush.opacity,
      semanticColor: brush.semanticColor,
    };
    draftRef.current = stroke;
    setDraft(stroke);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;
    const point = pointFromEvent(event);
    if (tool === "eraser") {
      eraseAt(point);
      return;
    }
    const current = draftRef.current;
    if (!current) return;
    const next: Annotation =
      current.type === "stroke"
        ? { ...current, points: [...current.points, point] }
        : { ...current, width: point.x - current.x, height: point.y - current.y };
    draftRef.current = next;
    setDraft(next);
  };

  const finishGesture = (event: React.PointerEvent<HTMLCanvasElement>, cancelled = false) => {
    if (pointerIdRef.current !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pointerIdRef.current = null;

    if (tool === "eraser") {
      if (!cancelled && erasedIdsRef.current.size > 0) {
        commit(eraseBaseRef.current.filter((annotation) => !erasedIdsRef.current.has(annotation.id)));
      }
      erasedIdsRef.current = new Set();
      setErasedIds(erasedIdsRef.current);
      eraseBaseRef.current = [];
      return;
    }

    const completed = draftRef.current;
    draftRef.current = null;
    setDraft(null);
    if (cancelled || !completed) return;
    if (completed.type === "shape" && Math.hypot(completed.width, completed.height) < 3) return;
    commit([...currentValue.annotations, completed]);
  };

  return (
    <canvas
      ref={canvasRef}
      className={`sketch-canvas sketch-canvas--${tool}`}
      aria-label={label}
      aria-readonly={readonly}
      role="img"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => finishGesture(event)}
      onPointerCancel={(event) => finishGesture(event, true)}
      onContextMenu={(event) => event.preventDefault()}
    />
  );
});
