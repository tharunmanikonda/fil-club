# NIL Club Take-Home

## Assumptions and Tradeoffs

The prompt listed Expo SDK 54 with Expo Router v4. While setting up the mobile app, I ran into compatibility issues with that exact combination in local install and runtime.

To keep the project stable and runnable, I kept Expo SDK 54 and used Expo Router v6, which worked reliably in this environment. I made that tradeoff to prioritize a submission that can be installed, started, and reviewed cleanly instead of forcing a version combination that was repeatedly failing during setup.

At a high level, the issue came from dependency and runtime mismatches between the older router version and the current Expo SDK 54 ecosystem inside this monorepo setup.
