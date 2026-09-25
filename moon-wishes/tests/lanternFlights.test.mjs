import test from 'node:test';
import assert from 'node:assert/strict';
import { flightPose, releaseLantern } from '../src/lanternFlights.ts';

test('a second wish leaves the first lantern and its flight time intact', () => {
  const first = releaseLantern([{ id: 1, releasedAt: null, wish: '' }], 1, 'Bình an', 100);
  const previousHeight = flightPose(first[0], 104, false).rise;
  const withNewLantern = [...first, { id: 2, releasedAt: null, wish: '' }];
  assert.equal(flightPose(withNewLantern[1], 106, false).rise, 0);
  const second = releaseLantern(withNewLantern, 2, 'Đoàn viên', 106);
  assert.equal(second[0], first[0]);
  assert.equal(second[0].releasedAt, 100);
  assert.equal(second[1].releasedAt, 106);
  assert.ok(flightPose(second[0], 107, false).rise > previousHeight);
  assert.ok(flightPose(second[0], 107, false).rise > flightPose(second[1], 107, false).rise);
});

test('an already released lantern cannot be reused or overwrite its wish', () => {
  const first = releaseLantern([{ id: 1, releasedAt: null, wish: '' }], 1, 'Bình an', 100);
  const duplicate = releaseLantern(first, 1, 'Other wish', 200);
  assert.equal(duplicate[0], first[0]);
  assert.equal(duplicate[0].wish, 'Bình an');
});

test('lanterns remain airborne until outside the visible sky', () => {
  const lantern = { id: 1, releasedAt: 0, wish: 'Bình an' };
  assert.equal(flightPose(lantern, 20, false).finished, false);
  assert.equal(flightPose(lantern, 50, false).finished, true);
  assert.equal(flightPose({ ...lantern, releasedAt: null }, 500, false).finished, false);
});

test('reduced motion keeps airborne lanterns still without returning them to the hands', () => {
  const lantern = { id: 1, releasedAt: 0, wish: 'Bình an' };
  const early = flightPose(lantern, 1, true), later = flightPose(lantern, 30, true);
  assert.ok(early.rise > 0);
  assert.deepEqual(early, later);
  assert.equal(later.finished, false);
});

test('release starts gently at the hands and rises continuously', () => {
  const lantern = { id: 3, releasedAt: 100, wish: 'Bình an' };
  const start = flightPose(lantern, 100, false);
  assert.equal(start.rise, 0);
  assert.equal(start.drift, 0);
  assert.ok(flightPose(lantern, 100.01, false).rise / .01 < .01);
  let previous = 0;
  for (let age = .1; age <= 50; age += .1) {
    const pose = flightPose(lantern, 100 + age, false);
    assert.ok(Number.isFinite(pose.rise));
    assert.ok(pose.rise > previous);
    previous = pose.rise;
  }
});
