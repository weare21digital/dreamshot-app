# Notifications — Lessons Learned

## Use CALENDAR triggers, not DATE triggers

**Don't** schedule a one-shot `DATE` notification for every item on every app launch. This causes duplicates, race conditions with past times, and breaks if the app isn't opened.

**Do** use `CALENDAR` triggers with `repeats: true` for recurring reminders. They persist across app restarts — no reschedule-on-launch needed.

```ts
await Notifications.scheduleNotificationAsync({
  identifier: `item-${id}-${slotIndex}`, // deterministic
  content: { title, body, sound: true, data },
  trigger: {
    type: SchedulableTriggerInputTypes.CALENDAR,
    hour: 8, minute: 30,
    repeats: true, // daily
  },
});
```

## Use deterministic identifiers

Same `identifier` = same notification. Scheduling again **replaces** the old one. No need to check `getAllScheduledNotificationsAsync()` for duplicates.

Pattern: `item-${itemId}-${timeSlotIndex}` for daily, add `-d${weekday}` for weekly.

## Lifecycle

| Event | Action |
|-------|--------|
| Create item | `scheduleMedicationReminders(item)` |
| Edit item | Same — cancels old triggers first, then reschedules |
| Delete item | `cancelMedicationNotifications(itemId)` |
| App launch | **Nothing** — CALENDAR triggers persist |

## When to use one-shot DATE triggers

Only for non-recurring events: snooze reminders, one-time alerts, time-sensitive actions.

## Don't auto-request permissions on launch

Request on first launch (onboarding) and when user enables notifications in settings. iOS only shows the native dialog once — after that it's Settings-only.
