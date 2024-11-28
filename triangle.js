(function (doc, global) {
  "use strict";

  const weakMap = new WeakMap();

  class Triangle {
    #canvas;
    #svg;
    #path;
    #texts;
    #points;
    #strokeColor;
    #strokeWidth;
    #fillColor;

    constructor(name, canvas = document.body) {
      if (typeof name !== "string") {
        name = Triangle.#defaultName(canvas);
      }
      this.#points = Triangle.#createDefaultTrianglePoints(name);
      this.#canvas = canvas;
      this.#svg = doc.createElementNS("http://www.w3.org/2000/svg", "svg");
      this.#svg.style.position = "absolute";
      this.#path = doc.createElementNS("http://www.w3.org/2000/svg", "path");
      this.#svg.appendChild(this.#path);
      canvas.appendChild(this.#svg);

      this.#texts = this.#points.map(({ name }) => this.#createText(name));
      this.#strokeColor = "black";
      this.#strokeWidth = 1;
      this.#fillColor = "transparent";

      this.#draw();
    }

    static #defaultName(canvas) {
      const points = weakMap.get(canvas);
      if (!points) {
        weakMap.set(canvas, ["A", "B", "C"]);
        return "ABC";
      } else {
        const noneUsed = [];
        let suffix = "";
        while (noneUsed.length < 3) {
          for (let i = 65; i < 91; i++) {
            const point = String.fromCharCode(i) + suffix;
            if (!points.includes(point)) {
              noneUsed.push(point);
              points.push(point);
              if (noneUsed.length >= 3) {
                return noneUsed.join("");
              }
            }
          }
          suffix += "'";
        }
      }
    }

    static #createDefaultTrianglePoints(name) {
      const points = [...name.matchAll(/[A-Z][^A-Z]*/g)].map(
        ([match]) => match
      );
      if (points.length !== 3) {
        throw new TypeError("Invalid triangle name: △" + name);
      }
      const [A, B, C] = points;
      return [
        { x: 70, y: 20, name: A },
        { x: 20, y: 120, name: B },
        { x: 120, y: 120, name: C },
      ];
    }

    #createText(text) {
      const textElement = doc.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      textElement.textContent = text;
      textElement.setAttribute("font-size", "14");
      textElement.setAttribute("text-anchor", "middle");
      textElement.setAttribute("dominant-baseline", "middle");
      textElement.setAttribute("fill", "black");
      textElement.setAttribute("font-family", "sans-serif");

      this.#svg.appendChild(textElement);

      return textElement;
    }

    #draw() {
      const [A, B, C] = this.#points;
      const d = `M ${A.x},${A.y} L ${B.x},${B.y} L ${C.x},${C.y} Z`;
      this.#path.setAttribute("d", d);
      this.#path.setAttribute("stroke", this.#strokeColor);
      this.#path.setAttribute("stroke-width", this.#strokeWidth.toString());
      this.#path.setAttribute("fill", this.#fillColor);

      const center = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };

      const textPositionA = Triangle.#calculatePoint(center, A, 10);
      this.#texts[0].setAttribute("x", textPositionA.x);
      this.#texts[0].setAttribute("y", textPositionA.y);
      const textPositionB = Triangle.#calculatePoint(center, B, 10);
      this.#texts[1].setAttribute("x", textPositionB.x);
      this.#texts[1].setAttribute("y", textPositionB.y);
      const textPositionC = Triangle.#calculatePoint(center, C, 10);
      this.#texts[2].setAttribute("x", textPositionC.x);
      this.#texts[2].setAttribute("y", textPositionC.y);
      this.#svg.style.width =
        Math.max(0, textPositionA.x, textPositionB.x, textPositionC.x) +
        10 +
        "px";
      this.#svg.style.height =
        Math.max(0, textPositionA.y, textPositionB.y, textPositionC.y) +
        10 +
        "px";
    }

    static #calculatePoint(start, end, distance) {
      const vector = { x: end.x - start.x, y: end.y - start.y };
      const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
      const unit = { x: vector.x / length, y: vector.y / length };

      return {
        x: Math.max(7, end.x + unit.x * distance),
        y: Math.max(7, end.y + unit.y * distance),
      };
    }

    getStrokeColor() {
      return this.#strokeColor;
    }

    setStrokeColor(color) {
      this.#strokeColor = color;
      this.#draw();
    }

    getStrokeWidth() {
      return this.#strokeWidth;
    }

    setStrokeWidth(width) {
      this.#strokeWidth = width;
      this.#draw();
    }

    getFillColor() {
      return this.#fillColor;
    }

    setFillColor(color) {
      this.#fillColor = color;
      this.#draw();
    }

    getSideLength(name) {
      const [p1, p2] = this.#getPointsByName(name);
      return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }

    #getPointsByName(side) {
      if (/[a-z]/.test(side)) {
        return this.#getPointsByOppositeVertex(side);
      } else {
        return this.#getPointsByAdjacentVertex(side);
      }
    }

    #getPointsByOppositeVertex(side) {
      const vertex = side.toUpperCase();
      if (!this.#points.some(({ name }) => name === vertex)) {
        throw new TypeError(
          `Invalid side name: "${side}"
            Vertex "${vertex}" does not exist.`
        );
      }
      return this.#points.filter(({ name }) => name !== vertex);
    }

    #getPointsByAdjacentVertex(side) {
      const vertexes = [...side.matchAll(/[A-Z][^A-Z]*/g)].map(
        ([match]) => match
      );
      if (vertexes.length !== 2) {
        throw new TypeError(
          `Invalid side name: "${side}"
            Expected exactly 2 vertices, but found ${vertexes.length}`
        );
      }
      const points = this.#points.filter(({ name }) => vertexes.includes(name));
      if (points.length !== 2) {
        throw new TypeError(
          `Invalid side name: "${side}"
            Vertices ${JSON.stringify(
              vertexes
            )} do not all match valid vertices.`
        );
      }
      return points;
    }

    setSideLength(sides) {
      const options = this.#checkAndMergeSides(sides);
      switch (options.length) {
        case 1:
          return this.#setOneSideLength(options[0]);
        case 2:
          return this.#setTwoSidesLength(options);
        case 3:
          return this.#setAllSidesLength(options);
      }
    }

    #checkAndMergeSides(sides) {
      const options = [];
      for (const key in sides) {
        const [p1, p2] = this.#getPointsByName(key);
        const option = options.find(
          (option) =>
            (option.p1 === p1 && option.p2 === p2) ||
            (option.p2 === p1 && option.p1 === p2)
        );
        if (option) {
          if (option.length !== sides[key]) {
            throw new TypeError(
              `Conflict! Different lengths have been set for the same edge.
              ${option.name}=${option.length} and ${key}=${sides[key]}`
            );
          }
        } else {
          options.push({ name: key, length: sides[key], p1, p2 });
        }
      }
      return options;
    }

    #setOneSideLength({ p1, p2, length }) {
      let l1, l2;
      const [min, mid, max] = [
        length,
        (l1 = this.getSideLength(p1.name.toLowerCase())),
        (l2 = this.getSideLength(p2.name.toLowerCase())),
      ].sort();
      if (min + mid <= max) {
        throw new TypeError(`Invalid triangle.
            ${
              p1.name + p2.name
            }=${length}, ${p1.name.toLowerCase()}=${l1}, ${p2.name.toLowerCase()}=${l2}`);
      }
      const [fixed, slided] = [p1, p2].sort(
        ({ x: x1, y: y1 }, { x: x2, y: y2 }) => x1 - x2 || y2 - y1
      );
      const d = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
      const dx = (slided.x - fixed.x) / d;
      const dy = (slided.y - fixed.y) / d;
      slided.x = fixed.x + dx * length;
      slided.y = fixed.y + dy * length;
      const left = this.#points.find((point) => point !== p1 && point !== p2);
      const { x, y } = this.#alcutePoint(
        left,
        { length: l1, point: p2 },
        { length: l2, point: p1 }
      );
      left.x = x;
      left.y = y;
      this.#draw();
    }

    #alcutePoint(vertex, side1, side2) {
      const {
        point: { x: x1, y: y1 },
        length: d1,
      } = side1;
      const {
        point: { x: x2, y: y2 },
        length: d2,
      } = side2;

      const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      const a = (d1 ** 2 - d2 ** 2 + distance ** 2) / (2 * distance);
      const h = Math.sqrt(d1 ** 2 - a ** 2);

      const dx = (x2 - x1) / distance;
      const dy = (y2 - y1) / distance;

      const ix = x1 + a * dx;
      const iy = y1 + a * dy;

      const px1 = ix + h * dy;
      const py1 = iy - h * dx;
      const px2 = ix - h * dy;
      const py2 = iy + h * dx;

      const crossProduct = (x2 - x1) * (py1 - y1) - (y2 - y1) * (px1 - x1);
      const crossProductVertex =
        (x2 - x1) * (vertex.y - y1) - (y2 - y1) * (vertex.x - x1);

      if (crossProduct * crossProductVertex > 0) {
        return { x: px1, y: py1 };
      } else {
        return { x: px2, y: py2 };
      }
    }

    #setTwoSidesLength(options) {
      const publicVertex =
        options[0].p1 === options[1].p1 || options[0].p1 === options[1].p2
          ? options[0].p1
          : options[0].p2;
      const oppositeSide = publicVertex.name.toLowerCase();
      const length3 = this.getSideLength(oppositeSide);
      const [min, mid, max] = [
        length3,
        options[0].length,
        options[1].length,
      ].sort();
      if (min + mid <= max) {
        throw new TypeError(`Invalid triangle.
            ${oppositeSide}=${length3}, ${options[0].name}=${options[0].length}, ${options[1].name}=${options[1].length}`);
      }
      const { x, y } = this.#alcutePoint(
        publicVertex,
        {
          length: options[0].length,
          point: options[0].p1 === publicVertex ? options[0].p2 : options[0].p1,
        },
        {
          length: options[1].length,
          point: options[1].p1 === publicVertex ? options[1].p2 : options[1].p1,
        }
      );
      publicVertex.x = x;
      publicVertex.y = y;
      this.#draw();
    }

    #setAllSidesLength(options) {
      const [min, mid, max] = options.map(({ length }) => length).sort();
      if (min + mid <= max) {
        throw new TypeError(`Invalid triangle.
            ${options
              .map(({ name, length }) => name + "=" + length)
              .join(", ")}`);
      }
      const fixed = this.#points
        .slice()
        .sort((p1, p2) => p1.x - p2.x || p2.y - p1.y)[0];
      const slided = this.#points
        .filter((p) => p !== fixed)
        .sort((p1, p2) => p2.y - p1.y || p2.x - p1.x)[0];
      const index = options.findIndex(
        ({ p1, p2 }) =>
          (p1 === fixed && p2 === slided) || (p1 === slided && p2 === fixed)
      );
      const { length } = options[index];
      const d = Math.sqrt(
        (slided.x - fixed.x) ** 2 + (slided.y - fixed.y) ** 2
      );
      const dx = (slided.x - fixed.x) / d;
      const dy = (slided.y - fixed.y) / d;
      slided.x = fixed.x + dx * length;
      slided.y = fixed.y + dy * length;

      options.splice(index, 1);
      const moved = this.#points.find((p) => p !== fixed && p !== slided);
      const { x, y } = this.#alcutePoint(
        moved,
        ...options.map(({ length, p1, p2 }) => ({
          length,
          point: p1 === moved ? p2 : p1,
        }))
      );
      moved.x = x;
      moved.y = y;
      this.#draw();
    }

    movePoint(name, deltaX, deltaY) {
      const point = this.#points.find((point) => point.name === name);
      if (!point) {
        throw new TypeError(`Point ${name} not found`);
      }
      point.x += deltaX;
      point.y += deltaY;
      this.#draw();
    }

    move(deltaX, deltaY) {
      this.#points.forEach((point) => {
        point.x += deltaX;
        point.y += deltaY;
      });
      this.#draw();
    }

    scale(factor) {
      const [A, B, C] = this.#points;
      const centerX = (A.x + B.x + C.x) / 3;
      const centerY = (A.y + B.y + C.y) / 3;

      this.#points.forEach((point) => {
        point.x = centerX + (point.x - centerX) * (factor - 1);
        point.y = centerY + (point.y - centerY) * (factor - 1);
      });
      this.#draw();
    }

    rotate(angle) {
      const [A, B, C] = this.#points;
      const centerX = (A.x + B.x + C.x) / 3;
      const centerY = (A.y + B.y + C.y) / 3;
      const radian = (angle * Math.PI) / 180;
      this.#points.forEach((point) => {
        const dx = point.x - centerX;
        const dy = point.y - centerY;
        point.x = centerX + dx * Math.cos(radian) - dy * Math.sin(radian);
        point.y = centerY + dx * Math.sin(radian) + dy * Math.cos(radian);
      });
      this.#draw();
    }

    flip(line) {
      const { a, b, c } = line;
      this.#points.forEach((point) => {
        const x = point.x;
        const y = point.y;
        const denominator = a * a + b * b;
        const x1 = (b * b * x - a * b * y - a * c) / denominator;
        const y1 = (a * a * y - a * b * x - b * c) / denominator;
        point.x = 2 * x1 - x;
        point.y = 2 * y1 - y;
      });
      this.#draw();
    }

    copy() {
      const newTriangle = new Triangle(
        this.#canvas,
        this.#points.map(({ name }) => name + "'").join("")
      );
      for (let i = 0; i < 3; i++) {
        newTriangle.#points[i].x = this.#points[i].x;
        newTriangle.#points[i].y = this.#points[i].y;
      }
      newTriangle.#strokeColor = this.#strokeColor;
      newTriangle.#strokeWidth = this.#strokeWidth;
      newTriangle.#fillColor = this.#fillColor;

      newTriangle.move(10, 10);

      return newTriangle;
    }

    static fromSSS(length1, length2, length3, name, canvas) {
      const triangle = new Triangle(name, canvas);
      try {
        triangle.setSideLength({
          [triangle.#points[0].name.toLowerCase()]: length1,
          [triangle.#points[1].name.toLowerCase()]: length2,
          [triangle.#points[2].name.toLowerCase()]: length3,
        });
        let deltaX = 0,
          deltaY = 0;
        triangle.#points.forEach((point) => {
          if (20 - point.x > deltaX) {
            deltaX = 20 - point.x;
          }
          if (20 - point.y > deltaY) {
            deltaY = 20 - point.y;
          }
        });
        triangle.move(deltaX, deltaY);

        return triangle;
      } catch (e) {
        triangle.#svg.remove();
        throw e;
      }
    }

    static fromSAS(length1, angle, length2, name, canvas) {
      const triangle = new Triangle(name, canvas);
      try {
        if (angle <= 0 || angle >= 180) {
          throw new TypeError(
            `Invalid triangle.
          The degree of ∠${
            triangle.#points[0].name
          } must be between 0 and 180 degrees.`
          );
        } else if (length1 <= 0 || length2 <= 0) {
          throw new TypeError(
            `Invalid triangle. The length must be greater than 0.`
          );
        }
        const fixed = triangle.#points[0];
        const slided = triangle.#points[1];
        const d = Math.sqrt(
          (slided.x - fixed.x) ** 2 + (slided.y - fixed.y) ** 2
        );
        const dx = (slided.x - fixed.x) / d;
        const dy = (slided.y - fixed.y) / d;
        slided.x = fixed.x + dx * length2;
        slided.y = fixed.y + dy * length2;

        const radian = (angle * Math.PI) / 180;
        triangle.#points[2].x =
          fixed.x + length1 * (dx * Math.cos(radian) + dy * Math.sin(radian));
        triangle.#points[2].y =
          fixed.y + length1 * (-dx * Math.sin(radian) + dy * Math.cos(radian));
        let deltaX = 0,
          deltaY = 0;
        triangle.#points.forEach((point) => {
          if (20 - point.x > deltaX) {
            deltaX = 20 - point.x;
          }
          if (20 - point.y > deltaY) {
            deltaY = 20 - point.y;
          }
        });
        triangle.move(deltaX, deltaY);

        return triangle;
      } catch (e) {
        triangle.#svg.remove();
        throw e;
      }
    }

    static fromASA(angle1, length, angle2, name, canvas) {
      const triangle = new Triangle(name, canvas);
      try {
        if (angle1 <= 0 || angle1 >= 180) {
          throw new TypeError(
            `∠${
              triangle.#points[1].name
            }=${angle1}, must be between 0 and 180 degrees.`
          );
        } else if (angle2 <= 0 || angle2 >= 180) {
          throw new TypeError(
            `∠${
              triangle.#points[2].name
            }=${angle1}, must be between 0 and 180 degrees.`
          );
        } else if (angle1 + angle2 >= 180) {
          throw new TypeError(
            `∠${triangle.#points[1].name}+∠${triangle.#points[2].name}=${
              angle1 + angle2
            }, must be between 0 and 180 degrees.`
          );
        } else if (length <= 0) {
          throw new TypeError("Length must be a positive number.");
        }
        triangle.#points[2].x = triangle.#points[1].x + length;
        triangle.#points[2].y = triangle.#points[1].y;
        const rateAB = Math.cos((angle1 * Math.PI) / 180);
        const rateAC = Math.cos((angle2 * Math.PI) / 180);
        triangle.#points[0].x =
          triangle.#points[1].x + (length * rateAB) / (rateAB + rateAC);
        triangle.#points[0].y =
          triangle.#points[1].y -
          (length * Math.sin((angle1 * Math.PI) / 180)) / (rateAB + rateAC);

        let deltaX = 0,
          deltaY = 0;
        triangle.#points.forEach((point) => {
          if (20 - point.x > deltaX) {
            deltaX = 20 - point.x;
          }
          if (20 - point.y > deltaY) {
            deltaY = 20 - point.y;
          }
        });
        triangle.move(deltaX, deltaY);

        return triangle;
      } catch (e) {
        triangle.#svg.remove();
        throw e;
      }
    }

    static fromAAS(angle1, angle2, length, name, canvas) {
      return Triangle.fromASA(
        angle2,
        length,
        180 - angle1 - angle2,
        name,
        canvas
      );
    }

    static fromHL(hypotenuse, leg, name, canvas) {
      if (leg <= 0) {
        throw new TypeError("Leg must be a positive number.");
      } else if (hypotenuse <= leg) {
        throw new TypeError("Hypotenuse must be greater than leg.");
      }
      const triangle = new Triangle(name, canvas);

      triangle.#points[2].x = triangle.#points[1].x + leg;
      triangle.#points[2].y = triangle.#points[1].y;
      triangle.#points[0].x = triangle.#points[1].x;
      triangle.#points[0].y =
        triangle.#points[1].y - Math.sqrt(hypotenuse ** 2 - leg ** 2);
      let deltaX = 0,
        deltaY = 0;
      triangle.#points.forEach((point) => {
        if (20 - point.x > deltaX) {
          deltaX = 20 - point.x;
        }
        if (20 - point.y > deltaY) {
          deltaY = 20 - point.y;
        }
      });
      triangle.move(deltaX, deltaY);

      return triangle;
    }
  }
  global.Triangle = Triangle;
})(
  document,
  typeof window !== "undefined"
    ? window
    : typeof self !== "undefined"
    ? self
    : typeof global !== "undefined"
    ? global
    : this
);
