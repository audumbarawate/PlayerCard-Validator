# PlayerCard Validator

A Google Apps Script tool that automatically audits every player card in a fantasy cricket game's spreadsheet, flagging any card whose stats don't match what its own rating says it should have.

## Problem

Every player card encodes its role and rating directly in its name (for example, `Player Name BT 85`), and that rating is supposed to be consistent with a dozen other stat columns spread across a 100+ column spreadsheet: base overall rating, batting and bowling attributes, upgrade currency requirements, and maximum upgrade rank. Reviewing that consistency by hand, card by card, was slow and easy to get wrong, and a single missed mismatch could let a broken card ship.

## Approach

`player_card_validator.gs` runs across the entire `Player_Cards` sheet and checks each row against five rule sets, highlighting any inconsistent cell in red so a reviewer can spot problems at a glance instead of manually cross-checking columns.

**What gets validated:**

1. **SAR consistency**: the Skill Attribute Rating (SAR) parsed from the card's name must match both the Base OVR column and the SAR Category column.
2. **Role-based Bat/Bowl logic**: validated differently depending on role:
   - Batters and Wicketkeepers: batting attribute must equal SAR, bowling attribute must be lower.
   - Bowlers: bowling attribute must equal SAR, batting attribute must be lower.
   - All-Rounders: both batting and bowling attributes must fall within a small margin of SAR (±2 for elite cards rated above 90, ±5 otherwise).
3. **Attribute duplication check**: Physical, Mental, Pace, and Fielding attributes are compared against a second, independently maintained set of the same columns, to catch cases where the two versions have drifted out of sync.
4. **TXP validation**: Overall Rating (OVR) determines a fixed amount of TXP (the in-game currency used to upgrade a card's skills and level) that a card of that rating should require; any mismatch is flagged.
5. **Potential vs Max Rank**: a card's growth potential (High / Medium / Low) should correspond to a fixed maximum upgrade rank (15 / 10 / 5); mismatches are flagged.

Invalid card names (missing a recognizable role or a parseable rating) are flagged separately rather than silently skipped.

## Impact

Cut manual QA review time by roughly 70%, automating consistency checks across 6+ attribute fields that previously had to be checked by eye.

## Column reference

The script reads by column index, matching this layout in the `Player_Cards` sheet:

| Column | Field |
|---|---|
| B | Card Name (encodes Role + SAR) |
| K | Base OVR |
| N, O, P, S | Physical, Mental, Pace, Fielding (primary) |
| Q | Bowling attribute |
| R | Batting attribute |
| T | SAR Category |
| U | TXP |
| Y | Potential (High / Medium / Low) |
| DK | Max Rank |
| DN, DO, DP, DQ | Physical, Mental, Pace, Fielding (duplicate / verification set) |

## Setup

1. Open the target Google Sheet, then go to **Extensions → Apps Script**.
2. Create a new script file and paste in the contents of `player_card_validator.gs`.
3. Make sure the sheet you're validating is named exactly `Player_Cards`, or update the sheet name at the top of `validateAllPlayerCards()` to match yours.
4. Run `validateAllPlayerCards` once from the Apps Script editor to authorize the script.
5. Optional: set up a time-driven trigger (**Triggers → Add Trigger**) to re-run validation automatically after scheduled data updates.

## Notes

This script is written against a specific spreadsheet's column layout, so the column indices in the code will need to be adjusted to match any other sheet's structure before reuse.

## License

MIT
