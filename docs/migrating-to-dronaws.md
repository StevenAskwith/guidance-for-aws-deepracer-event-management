# Migrating from DREM to DeepRacer on AWS

DREM has been replaced by [DeepRacer on AWS (DRonAWS)](https://github.com/aws-solutions/deepracer-on-aws).
This page explains what can be moved across, how DREM data maps onto DRonAWS, and the
options for doing it.

> **Status:** DRonAWS has no bulk import for events, races or leaderboards, and there is
> not yet an automated DREM-to-DRonAWS importer. What you can do today is export and
> archive your DREM data, and either recreate the events you care about by hand or
> script a replay using the mapping below.

This page describes DRonAWS v1.3.3 and the DREM export format as of the final DREM release.

## 1. Export everything from DREM first

Do this before you remove any DREM stacks:

```sh
# from the repo root, with build.config and cfn.outputs present (make local.config)
python scripts/drem_export.py --output drem-export-final
```

Use the default DynamoDB mode, not `--api`. The API mode leaves out user group
memberships, disabled users, and the internal keys that link races to users. See
[scripts/README.md](../scripts/README.md) for the full options and file layout.

The export does **not** include the following, so save them separately if you need them:

| Data | Where it lives in DREM | How to keep it |
|---|---|---|
| Racer models | Models S3 bucket, under `private/<cognito-sub>/` | `aws s3 sync` the bucket |
| Car logs and race videos | Car logs S3 bucket | `aws s3 sync` the bucket |
| Statistics | Stats table | Rebuilt from races; nothing to save |
| Cars and timers | SSM managed instances | Not portable. Re-register them in DRonAWS |

> `users.json` contains racer email addresses. Store the export as personal data and
> delete it when you no longer need it.

## 2. What maps across

DRonAWS v1.3 race management was modelled on DREM, so most concepts carry over directly:

| DREM | DRonAWS | Notes |
|---|---|---|
| Event | Event | Same `eventType` values. `eventDate` and `countryCode` carry over |
| Event track (`tracks[]`) | Track, which is a leaderboard attached to the event | Maximum 10 tracks per event |
| Race (`races.json`) | Run | One run per DREM race |
| Lap | Lap | Lap times are integer milliseconds in DRonAWS (DREM stores floats) |
| Leaderboard entry | Ranking | **Derived.** DRonAWS recalculates rankings from submitted runs; do not copy entries over |
| Fleet | Fleet | Car membership cannot be copied, because the cars must be re-registered |
| User (Cognito) | User and Profile | New IDs. Group names differ (see below) |
| Racer profile (avatar, colour) | Profile `avatar` | Both use avataaars-style avatar options, but with different attribute names. DRonAWS has no highlight colour |
| Landing page | none | No equivalent in DRonAWS |
| Statistics | Race statistics | DRonAWS rebuilds these automatically when runs are submitted |

### Field mapping

**Event**

| DREM | DRonAWS |
|---|---|
| `eventName` | `name` (1–64 characters) |
| `typeOfEvent` | `eventType` (same enum values) |
| `eventDate` | `eventDate` |
| `countryCode` | `countryCode` (2 upper-case letters) |
| `sponsor` | `sponsor` |
| `raceConfig.rankingMethod` `BEST_LAP_TIME` | `raceFormat` `BEST_LAP` |
| `raceConfig.rankingMethod` `BEST_AVERAGE_LAP_TIME_X_LAP` | `raceFormat` `AVERAGE_LAPS`, plus `averageLapsWindow` |
| `raceConfig.raceTimeInMin` | `maxTimeInMinutes` |
| `raceConfig.maxRunsPerRacer` (a string) | `maxRunsPerRacer` (an integer) |
| `raceConfig.numberOfResetsPerLap` | `maxResets`. **Different meaning:** DREM limits resets per lap, while DRonAWS limits them per run. DREM's `9999` means unlimited |
| none | `maxLaps` is required. Use the largest lap count of any race in the event |

**Track**

| DREM | DRonAWS |
|---|---|
| `leaderBoardTitle` | `leaderBoardTitle` |
| `leaderBoardFooter` | `leaderBoardFooter` |
| `fleetId` | `fleetId` (the new fleet ID) |
| `raceConfig.trackType` | `trackType` (a DRonAWS `TrackId`, see the table below) |

**Run and lap**

| DREM | DRonAWS |
|---|---|
| race `userId` (Cognito sub) | run `profileId` (the new DRonAWS user ID) |
| race `racedByProxy` | run `racedByProxy` |
| `laps[].time` (float ms) | `lapTimeMs` (rounded to an integer) |
| `laps[].resets` | `resets` |
| `laps[].isValid` | set afterwards with the SetLapValidity call |
| `laps[].lapId` (0-based) | `lapNumber` (1-based, assigned by DRonAWS) |
| `laps[].carName` | dropped. `deviceId` only accepts a registered DRonAWS device |

**Track types.** DREM's physical track types must be mapped to DRonAWS `TrackId` values.
The mapping below is a suggestion; check it against the tracks you actually ran.

| DREM `trackType` | Suggested DRonAWS `TrackId` |
|---|---|
| `REINVENT_2018` | `REINVENT_2018` (`reinvent_base`) |
| `REINVENT_2019` | `SMILE_SPEEDWAY` (`reInvent2019_track`) |
| `ATOZ_SPEEDWAY` | `A_TO_Z_SPEEDWAY` (`reInvent2019_wide`) |
| `REINVENT_2022` | `REINVENT_2022_CHAMPIONSHIP` (`2022_reinvent_champ`) |
| `REINVENT_2023` | no exact match. Choose the closest |
| `FOREVER_RACEWAY` | `FOREVER_RACEWAY` (`2024_reinvent_champ`) |
| `SUMMIT_SPEEDWAY` | `RL_SPEEDWAY` (`2022_summit_speedway`) |
| `OTHER` | no equivalent. Choose the closest |

**Users and groups**

| DREM group | DRonAWS group |
|---|---|
| `admin` | `dr-admins` |
| `operator` | `dr-race-facilitators` |
| `commentator` | `dr-commentators` |
| `registration` | `dr-registration-managers` |
| `racer` | `dr-racers` |

- DRonAWS usernames are generated 15-character IDs. Your DREM username becomes the DRonAWS
  racer **alias**, which must be 3–20 characters from `A-Z a-z 0-9 _ -`. Some DREM usernames
  will need cleaning up, and duplicates need resolving.
- Passwords cannot be migrated, so every user has to set a new one.
- DREM racers who have already signed up to DRonAWS should be matched by email address
  rather than created a second time.

## 3. Options

### Option A: archive only (simplest)

Keep the export directory, or load it into a spreadsheet or notebook for reporting, and
run new events in DRonAWS from scratch. Choose this if you mostly care about future events.

### Option B: recreate key events by hand

For a small number of events, such as finals, create the event and tracks in the DRonAWS
UI and re-enter the results through Timekeeping, with lap edits where needed. Rankings,
combined leaderboards and statistics are then calculated by DRonAWS.

### Option C: scripted replay through the DRonAWS API

Write a script that reads a DREM export and replays it against the DRonAWS REST API. The
API uses IAM (SigV4) auth with Cognito identity-pool credentials for a `dr-admins` user,
and the user pool allows `USER_PASSWORD_AUTH`. For each DREM event:

1. Create the users that are not already in DRonAWS, with Cognito `AdminCreateUser`
   (`MessageAction=SUPPRESS`, `custom:racerAlias`, `custom:countryCode`), and add each to
   its group. The DRonAWS PreSignUp trigger creates the profile.
   - Do not use the `/race-management/users` endpoint for bulk loads: it sends an
     invitation email to every user, and Cognito's default limit is 50 emails a day.
2. Run `POST /events`, then `POST /events/{id}/tracks` for each track.
3. Transition the event with the `OPEN` action, then `START`, which puts it in
   `IN_PROGRESS`. Runs can only be recorded while an event is in progress.
4. For each DREM race, in `createdAt` order:
   1. `POST .../runs` to create the run.
   2. Transition the run to `START`.
   3. `POST .../laps` for each lap.
   4. `PUT .../laps/{n}/validity` for each invalid lap.
   5. Transition the run to `FINISH`, then `SUBMIT`.
5. Transition the event with `COMPLETE`, and optionally `ARCHIVE`.

Things to know before you try this:

- **Timestamps.** Every run and lap is stamped with the time of the migration. Only the
  event's `eventDate` keeps the original date.
- **Side effects.** Each submit fires a `race-submitted` event. That triggers a full rebuild
  of the statistics, publishes live-race messages over IoT, and rewrites the public
  leaderboard. Replay large histories slowly, and preferably before announcing the new
  site.
- **Average-lap events.** In DRonAWS v1.3.3, the score calculated at submit time does not
  apply `averageLapsWindow`, but later lap edits do. Rankings for `AVERAGE_LAPS` events may
  therefore differ from DREM until that is fixed upstream.
- **Event lifecycle.** Event status only moves forward
  (DRAFT → OPEN → IN_PROGRESS → COMPLETED → ARCHIVED), so the script cannot re-open an
  event once it is completed. Make the script resumable by recording which DREM IDs have
  been created.
- **Writing directly to DynamoDB is not recommended.** DRonAWS uses a single ElectroDB
  table. Writing items by hand skips validation, and items without ElectroDB's metadata
  are silently ignored by queries.

### Models

Racers can re-import their own models on the DRonAWS physical model import page by
uploading a `.tar.gz` that contains `model_metadata.json` and `agent/model.pb`. Imports are tied to the signed-in racer's profile and count against
that racer's model quota, so an administrator cannot bulk-import models for other users
through the API.

### Cars and timers

Re-register each car and timer through DRonAWS **Devices**, then recreate your fleets.
SSM hybrid activations from DREM cannot be reused.
