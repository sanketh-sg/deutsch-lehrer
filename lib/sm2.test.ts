import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newCard, review, qualityFor, today } from './sm2.ts';

const DAY = '2026-01-01';

test('today() uses the local day, not UTC', () => {
  // 00:30 local on the 10th. A UTC-based implementation would say the 9th
  // for any positive offset, hiding cards that are due.
  const local = new Date(2026, 8, 10, 0, 30);
  assert.equal(today(local), '2026-09-10');
});

test('a new card wants the study side', () => {
  const c = newCard('verb:gehen', DAY);
  assert.equal(c.needsStudy, true);
  assert.equal(c.due, DAY);
});

test('only all three tenses correct clears the pass threshold', () => {
  assert.equal(qualityFor(3), 5);
  assert.ok(qualityFor(2) < 3, 'two of three must not count as learned');
  assert.ok(qualityFor(1) < 3);
  assert.ok(qualityFor(0) < 3);
});

test('intervals grow 1, 6, then by ease', () => {
  let c = newCard('verb:gehen', DAY);
  c = review(c, 5, DAY);
  assert.equal(c.interval, 1);
  assert.equal(c.due, '2026-01-02');
  assert.equal(c.needsStudy, false);

  c = review(c, 5, c.due);
  assert.equal(c.interval, 6);
  assert.equal(c.due, '2026-01-08');

  const easeAtThird = c.ease;
  c = review(c, 5, c.due);
  assert.equal(c.interval, Math.round(6 * easeAtThird));
});

test('failing resets reps and brings the study side back', () => {
  let c = newCard('verb:gehen', DAY);
  c = review(c, 5, DAY);
  c = review(c, 5, c.due);
  assert.equal(c.reps, 2);

  c = review(c, qualityFor(1), c.due); // only one of three tenses right
  assert.equal(c.reps, 0);
  assert.equal(c.needsStudy, true);
  assert.equal(c.lapses, 1);
  assert.equal(c.interval, 1);
});

test('ease never falls below 1.3', () => {
  let c = newCard('verb:gehen', DAY);
  for (let i = 0; i < 20; i++) c = review(c, 0, DAY);
  assert.ok(c.ease >= 1.3, `ease was ${c.ease}`);
});

test('two of three tenses lapses more gently than none', () => {
  const start = newCard('verb:gehen', DAY);
  const two = review(start, qualityFor(2), DAY);
  const none = review(start, qualityFor(0), DAY);
  assert.equal(two.needsStudy, true);
  assert.equal(none.needsStudy, true);
  assert.ok(two.ease > none.ease, 'getting two right should cost less ease than getting none');
});
