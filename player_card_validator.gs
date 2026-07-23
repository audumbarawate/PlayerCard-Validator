function validateAllPlayerCards() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Player_Cards");
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const cardName = data[i][1];       // Column B
    const baseOVR = data[i][10];       // Column K
    const sarCategory = data[i][19];   // Column T
    const bowl = data[i][16];          // Column Q
    const bat = data[i][17];           // Column R
    const txp = data[i][20];           // Column U
    const potential = data[i][24];     // Column Y
    const maxRank = data[i][114];      // Column DK

    if (!cardName) continue;

    const parts = cardName.trim().split(" ");
    const sarStr = parts[parts.length - 1];
    const role = parts[parts.length - 2];
    const sar = parseInt(sarStr, 10);

    if (isNaN(sar) || !["BT", "WK", "BW", "AR"].includes(role)) {
      sheet.getRange(i + 1, 2).setBackground("red"); // Highlight invalid card name
      continue;
    }

    Logger.log('Card Name:', cardName);
    Logger.log('Parsed SAR:', sar);

    // --- Validation 1: SAR vs Base OVR and SAR Category ---
    sheet.getRange(i + 1, 11).setBackground(sar !== baseOVR ? "red" : null);    // Column K
    sheet.getRange(i + 1, 20).setBackground(sar !== sarCategory ? "red" : null); // Column T

    // --- Validation 2: Role-based Bat/Bowl Logic ---
    const batCell = sheet.getRange(i + 1, 18);  // Column R
    const bowlCell = sheet.getRange(i + 1, 17); // Column Q

    if (["BT", "WK"].includes(role)) {
      const batEqualSar = bat === sar;
      const bowlLessThanBat = bowl < bat;

      batCell.setBackground(batEqualSar ? null : "red");
      bowlCell.setBackground(bowlLessThanBat ? null : "red");

    } else if (role === "BW") {
      const bowlEqualSar = bowl === sar;
      const batLessThanBowl = bat < bowl;

      bowlCell.setBackground(bowlEqualSar ? null : "red");
      batCell.setBackground(batLessThanBowl ? null : "red");

    } else if (role === "AR") {
      const margin = sar > 90 ? 2 : 5;
      const batValid = Math.abs(sar - bat) <= margin;
      const bowlValid = Math.abs(sar - bowl) <= margin;

      batCell.setBackground(batValid ? null : "red");
      bowlCell.setBackground(bowlValid ? null : "red");
    }

    // --- Validation 3: Compare V1 vs V2 Attributes ---
    const physical = data[i][13];      // Column N
    const mental = data[i][14];        // Column O
    const pace = data[i][15];          // Column P
    const field = data[i][18];         // Column S

    const physicalV2 = data[i][117];   // Column DN
    const mentalV2 = data[i][118];     // Column DO
    const paceV2 = data[i][119];       // Column DP
    const fieldV2 = data[i][120];      // Column DQ

    sheet.getRange(i + 1, 14).setBackground(physical !== physicalV2 ? "red" : null); // N
    sheet.getRange(i + 1, 15).setBackground(mental !== mentalV2 ? "red" : null);     // O
    sheet.getRange(i + 1, 16).setBackground(pace !== paceV2 ? "red" : null);         // P
    sheet.getRange(i + 1, 19).setBackground(field !== fieldV2 ? "red" : null);       // S

    // --- Validation 4: TXP Validation Based on SAR ---
    const expectedTXP = getExpectedTXP(sar);
    Logger.log('Expected TXP for SAR ' + sar + ': ' + expectedTXP);
    Logger.log('Actual TXP: ' + txp);

    if (expectedTXP === undefined || txp !== expectedTXP) {
      sheet.getRange(i + 1, 21).setBackground("red"); // Column U
    } else {
      sheet.getRange(i + 1, 21).setBackground(null);
    }

    // --- Validation 5: Potential vs Max Rank ---
    let expectedRank = null;
    if (potential === "High") expectedRank = 15;
    else if (potential === "Medium") expectedRank = 10;
    else if (potential === "Low") expectedRank = 5;

    sheet.getRange(i + 1, 115).setBackground(
      expectedRank !== null && maxRank !== expectedRank ? "red" : null
    );
  }
}

// --- Helper Function for TXP Mapping ---
function getExpectedTXP(sar) {
  if (sar >= 40 && sar <= 49) return 50;
  if (sar >= 50 && sar <= 59) return 100;
  if (sar >= 60 && sar <= 69) return 200;
  if (sar >= 70 && sar <= 74) return 300;
  if (sar >= 75 && sar <= 79) return 400;
  if (sar >= 80 && sar <= 84) return 500;
  if (sar >= 85 && sar <= 89) return 600;
  if (sar === 90) return 700;
  if (sar === 91) return 750;
  if (sar === 92) return 800;
  if (sar === 93) return 850;
  if (sar === 94) return 900;
  if (sar === 95) return 1000;
  if (sar === 96) return 1100;
  if (sar === 97) return 1200;
  if (sar === 98) return 1300;
  if (sar === 99) return 1400;
  return undefined;
}
