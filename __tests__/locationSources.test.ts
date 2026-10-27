import { expect, jest, test } from '@jest/globals';
import * as Location from 'expo-location';
import { ExpoLocationSource, MockLocationSource } from '@/data/location';
import { MOCK_TRIPS } from '@/data/mock/trips';

jest.mock('expo-location', () => ({
  Accuracy: { BestForNavigation: 6 },
  watchPositionAsync: jest.fn(),
}));

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

test('a second GPS watch removes the first subscription', async () => {
  const removes = [jest.fn(), jest.fn()];
  const watchMock = jest.mocked(Location.watchPositionAsync);
  removes.forEach((remove) => watchMock.mockResolvedValueOnce({ remove } as Location.LocationSubscription));

  const source = new ExpoLocationSource(() => 0);
  source.watch(() => undefined);
  await flush();
  const unwatchSecond = source.watch(() => undefined);
  await flush();
  expect(removes[0]).toHaveBeenCalledTimes(1);
  expect(removes[1]).not.toHaveBeenCalled();

  unwatchSecond();
  expect(removes[1]).toHaveBeenCalledTimes(1);
});

test('a GPS watch cancelled while starting is removed once it starts', async () => {
  const remove = jest.fn();
  jest.mocked(Location.watchPositionAsync).mockResolvedValueOnce({ remove } as Location.LocationSubscription);
  const unwatch = new ExpoLocationSource(() => 0).watch(() => undefined);
  unwatch();
  await flush();
  expect(remove).toHaveBeenCalledTimes(1);
});

test('a demo source plays only its newest watch, and a stale unsubscribe leaves it running', () => {
  jest.useFakeTimers();
  const source = new MockLocationSource(MOCK_TRIPS[0].points);
  const first = jest.fn();
  const second = jest.fn();
  const unwatchFirst = source.watch(first);
  source.watch(second);
  unwatchFirst();
  jest.advanceTimersByTime(3000);
  expect(first).not.toHaveBeenCalled();
  expect(second).toHaveBeenCalledTimes(3);
  jest.useRealTimers();
});

test('a GPS watch that fails to start, or that the platform reports broken, is reported', async () => {
  const watchMock = jest.mocked(Location.watchPositionAsync);
  watchMock.mockRejectedValueOnce(new Error('Location services are disabled'));
  const failedToStart = jest.fn();
  new ExpoLocationSource(() => 0).watch(() => undefined, failedToStart);
  await flush();
  expect(failedToStart).toHaveBeenCalledWith('Location services are disabled');

  let reportBroken: (reason: string) => void = () => undefined;
  watchMock.mockImplementationOnce(async (_options, _callback, errorHandler) => {
    reportBroken = (reason) => errorHandler?.(reason);
    return { remove: jest.fn() } as Location.LocationSubscription;
  });
  const broken = jest.fn();
  const unwatch = new ExpoLocationSource(() => 0).watch(() => undefined, broken);
  await flush();
  reportBroken('Permission revoked');
  expect(broken).toHaveBeenCalledWith('Permission revoked');

  // Once the drive stopped watching, a late error is not news.
  unwatch();
  reportBroken('Permission revoked');
  expect(broken).toHaveBeenCalledTimes(1);
});
