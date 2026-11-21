import assert from "node:assert/strict";
import { test } from "node:test";
import { canTilt, countValue, flightPath, shouldHideForReveal, TILT_MAX_DEG, tiltFromPointer } from "../lib/motion.ts";

const rect = { left: 100, top: 100, width: 200, height: 100 };

test("inclinaison : nulle au centre, ±4° aux coins, bornée hors du cadre", () => {
  assert.deepEqual(tiltFromPointer(rect, 200, 150), { rx: 0, ry: 0 });
  assert.deepEqual(tiltFromPointer(rect, 100, 100), { rx: TILT_MAX_DEG, ry: -TILT_MAX_DEG });
  assert.deepEqual(tiltFromPointer(rect, 300, 200), { rx: -TILT_MAX_DEG, ry: TILT_MAX_DEG });
  assert.deepEqual(tiltFromPointer(rect, -500, 900), { rx: -TILT_MAX_DEG, ry: -TILT_MAX_DEG });
});

test("inclinaison : souris uniquement, jamais avec mouvement réduit", () => {
  assert.equal(canTilt({ hover: true, finePointer: true, reducedMotion: false }), true);
  assert.equal(canTilt({ hover: false, finePointer: true, reducedMotion: false }), false);
  assert.equal(canTilt({ hover: true, finePointer: false, reducedMotion: false }), false);
  assert.equal(canTilt({ hover: true, finePointer: true, reducedMotion: true }), false);
});

test("compteur : de 0 à la cible en 800 ms, entier, croissant, ralenti en fin", () => {
  assert.equal(countValue(25, 0), 0);
  assert.equal(countValue(25, 800), 25);
  assert.equal(countValue(25, 5000), 25);
  assert.ok(countValue(25, 400) > 12);
  let previous = -1;
  for (let t = 0; t <= 800; t += 50) {
    const value = countValue(25, t);
    assert.ok(Number.isInteger(value));
    assert.ok(value >= previous);
    previous = value;
  }
});

test("apparition : seuls les éléments sous la flottaison sont cachés", () => {
  assert.equal(shouldHideForReveal(100, 800), false);
  assert.equal(shouldHideForReveal(799, 800), false);
  assert.equal(shouldHideForReveal(820, 800), true);
});

test("vol vers « Ma liste » : trajet, ou rien si la cible est invisible", () => {
  assert.deepEqual(flightPath({ x: 10, y: 500 }, { x: 300, y: 20, visible: true }), { dx: 290, dy: -480 });
  assert.equal(flightPath({ x: 10, y: 500 }, { x: 300, y: 20, visible: false }), null);
  assert.equal(flightPath({ x: 10, y: 500 }, null), null);
  assert.equal(flightPath(null, { x: 1, y: 1, visible: true }), null);
});
