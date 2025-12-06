# Breakfills Testing Instructions

## Overview

Test scripts for automating order entry on `app.breakoutprop.com`. Each script can be tested independently.

## Files

1. **position_tool.js** - Extracts position data from TradingView Risk/Reward tools
2. **open_modal.js** - Opens the order modal via \_globalEvents emitter
3. **fill_order.js** - Fills the order form fields
4. **ui_overlay.js** - Testing UI with buttons for each step

## Testing Steps

### 1. Test Position Extraction

```javascript
// Copy/paste position_tool.js into console
// Then run:
PositionTool.getLatest();
```

**Expected Output:**

```
Found chartContent at window.tradingview_XXXXX.chartContent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POSITION EXTRACTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:         LONG/SHORT
Symbol:       BTCUSD
Entry:        90000
Stop Loss:    89500
Take Profit:  91000
Quantity:     0.5
Risk ($):     250
Target ($):   500
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2. Test Modal Opener

```javascript
// Copy/paste open_modal.js into console
// Then run:
ModalOpener.openModal(90000, "BTCUSD");
```

**Expected Result:**

- Order modal should pop open
- Symbol field should show BTCUSD
- Price should be pre-filled with 90000

### 3. Test Form Filler

```javascript
// Copy/paste fill_order.js into console
// Make sure modal is open first, then run:
OrderFiller.fill({
  symbol: "BTCUSD",
  side: "BUY",
  qty: 0.5,
  price: 90000,
  stopPrice: 89500,
  targetPrice: 91000,
});
```

**Expected Result:**

- All form fields should be filled
- Stop loss and take profit checkboxes should be enabled
- Values should match the input data

### 4. Test Complete Workflow (UI Overlay)

```javascript
// Copy/paste all 4 scripts into console in order:
// 1. position_tool.js
// 2. open_modal.js
// 3. fill_order.js
// 4. ui_overlay.js

// A floating panel will appear in top-right corner
// Click "⚡ Auto Fill" to test the complete workflow
```

**Expected Result:**

1. Scans for latest position
2. Opens modal with correct symbol/price
3. Fills all form fields automatically
4. Status log shows each step

## Troubleshooting

**Position not found:**

- Make sure you've drawn a LineToolRiskRewardLong or LineToolRiskRewardShort on the chart
- Check console for `window.tradingview_XXXXX.chartContent`

**Modal doesn't open:**

- Run `ModalOpener.findEmitters()` to see how many emitters were found
- Should find at least 1 emitter with `_globalEvents` in path

**Form doesn't fill:**

- Make sure modal is open before calling `OrderFiller.fill()`
- Check that data-test-id attributes exist in the DOM

## Notes

- Scripts are designed to work on `app.breakoutprop.com`
- Requires TradingView chart with Risk/Reward position tool
- All calculations assume 0.1 pip size for crypto (BTC/ETH)

## Built-in Safety Features

### Auto-Rescan on Chart Context Change

When `getSelected()` or `getLatest()` fails to find a position, it automatically:

1. Clears the cached chart API
2. Retries once with fresh context
3. Only returns null after the retry fails

You can also manually trigger a rescan:

```javascript
PositionTool.clearCache(); // Clear chart API cache
UIOverlay.rescan(); // Force rescan from UI
```

### Protection Order Status Warnings

After filling the form, the UI automatically checks if protection orders are still enabled:

- `Protection orders NOT enabled!` - Main checkbox was reset
- `SL/TP not checked!` - Neither SL nor TP checkbox is active
- Individual warnings for unchecked SL or TP

Check manually:

```javascript
OrderFiller.checkProtectionStatus();
// Returns: { enabled: true/false, slChecked: true/false, tpChecked: true/false }
```
