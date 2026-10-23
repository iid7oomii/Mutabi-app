# Child Goals Test Contract

These checks cover the rules in `docs/product/business-rules/child_goals.md`. They exercise the Flask application with an isolated in-memory SQLite database and signed test JWTs. No external push request is made.

Run from `backend/`:

```bash
./.venv/bin/pytest tests/goals -q
```

The feature is implemented in the API, reminder dispatcher, web specialist view, and parent mobile app. Run the full backend suite with `./.venv/bin/pytest tests -q`.

## HTTP contract exercised by the tests

- `POST /api/v1/goals/` — create a child goal.
- `GET /api/v1/goals/child/<child_id>` — list goals visible for a child.
- `PATCH /api/v1/goals/<goal_id>` — edit an existing goal.
- `POST /api/v1/goals/<goal_id>/complete` — confirm achievement.
- `POST /api/v1/goals/<goal_id>/close` — close without achievement.
- `GET /api/v1/goals/reminder-settings` — read the signed-in parent's settings.
- `PUT /api/v1/goals/reminder-settings` — update the signed-in parent's settings.

Create and update requests reject unknown and server-owned fields. Goal text limits are 160 characters for `title`, 300 for `success_criteria`, and 2,000 for optional `notes`. Dates use `YYYY-MM-DD`. Reminder frequencies use `none`, `weekly`, `twice_weekly`, and `daily`.

## Reminder service contract exercised by the tests

`app.goals.reminders.is_due_on_date(created_on, start_on, end_on, frequency, status, on_date)` returns a boolean for one local calendar date. `dispatch_due_goal_reminders(now_utc, send)` groups due goals per parent and calls `send(parent_id, title, body)` once per parent/day. A false return from `send` is retryable. The dispatcher must not make real network calls in these tests.

## UI acceptance checks outside pytest

The web and mobile apps do not currently have test runners. Build the web app with `npm run build` in `web/` and export the Android bundle with `./node_modules/.bin/expo export --platform android` in `mobile/`. Then check these in the running apps:

1. The assigned specialist and same-clinic admin can create, edit, complete, extend, and close child goals; other users cannot see these controls.
2. A parent sees each goal as a checklist item with its success criterion, status, and remaining weeks/days. The end date shows as the last day; the following day shows the review state.
3. The parent can set one goal-reminder time and turn goal reminders off. The default is 4:00 p.m. in the device's local time zone.
4. Multiple due goals appear in one encouraging notification without exposing goals to an unrelated parent.
