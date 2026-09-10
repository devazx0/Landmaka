# Landmaka Partner Integration Guide — Phase 2 Pilot

*A minimal 3-step technical integration guide for partner engineering teams.*

---

## Overview
Landmaka requires minimal integration bandwidth from your engineering team. You do not need to rewrite your dispatch system or rider apps. You only connect **3 API touchpoints**:

```
[Customer Checkout]   ──(Step 1: Capture Pin & Landmark)──>  Landmaka API
                                                                  │
[Dispatch Dashboard]  ──(Step 2: Get Optimized Stops)─────>  Landmaka API
                                                                  │
[Rider Completion]    ──(Step 3: Log Call Attempts)───────>  Landmaka API
```

---

## Authentication
Pass your partner API key in the `x-api-key` header with every request:
```http
x-api-key: lm_test_key_pilot_01
```

---

## Step 1: Capture Structured Location at Checkout
When a customer places an order in the pilot zone (e.g. Lekki Phase 1), prompt them to confirm their compound entrance and landmark.

### Endpoint: `POST /api/v1/locations`
```json
{
  "latitude": 6.4474,
  "longitude": 3.4842,
  "landmarkText": "Directly opposite FCMB Bank, off Admiralty Way",
  "gateDescription": "Black electric sliding gate with spikes",
  "unitPath": "Flat 4B, second floor, rear duplex",
  "contactName": "Emeka Okonkwo",
  "contactPhone": "+2348033334444"
}
```
**Response:** Save the returned `id` (`cmtrr1knl00055kuxrck70mac`) in your orders table.

> **Optional Embeddable Widget:** If you prefer not to build a frontend form, drop our embeddable widget script into your checkout:
> `<script src="https://api.landmaka.com/sdk/landmaka-widget.js" data-api-key="lm_test_key_pilot_01"></script>`

---

## Step 2: Optimize Rider Stops at Dispatch
When dispatching a batch of 5–12 orders to a rider, request the optimal visiting order.

### Endpoint: `POST /api/v1/routes/optimize`
```json
{
  "origin": {
    "latitude": 6.5954,
    "longitude": 3.3431,
    "label": "Central Dispatch Hub"
  },
  "stops": [
    {
      "id": "order_101",
      "locationId": "cmtrr1kng00035kuxqb3hxzbb",
      "latitude": 6.4281,
      "longitude": 3.4219,
      "label": "Bisi Adebayo"
    },
    {
      "id": "order_102",
      "locationId": "cmtrr1knl00055kuxrck70mac",
      "latitude": 6.4474,
      "longitude": 3.4842,
      "label": "Emeka Okonkwo"
    }
  ],
  "roundTrip": false
}
```
**Response:** Provides `orderedStops` with `sequenceIndex: 1, 2, ...` and leg ETAs. Display these stops in order on your existing rider screen.

---

## Step 3: Record Delivery Outcome & Call Attempts
When your rider marks the delivery complete or failed in your courier tool, send the result to Landmaka to feed the pilot KPI scorecard.

### Endpoint: `POST /api/v1/deliveries` (Register Job)
```json
{
  "trackingReference": "ORD-98231",
  "locationId": "cmtrr1knl00055kuxrck70mac",
  "recipientName": "Emeka Okonkwo",
  "isBaseline": false
}
```

### Endpoint: `PATCH /api/v1/deliveries/:id/outcome` (Record Result)
```json
{
  "status": "DELIVERED",
  "callAttempts": 0,
  "transitDurationMinutes": 22,
  "notes": "Delivered smoothly without calling customer."
}
```
*(If the delivery failed, set `"status": "FAILED"` and pass `"failureReason": "COULD_NOT_LOCATE_ADDRESS"`).*

---

## Monitoring Live Pilot KPIs
View your real-time before vs. after pilot report at any time:

### Endpoint: `GET /api/v1/metrics/pilot`
Returns:
```json
{
  "baseline": {
    "totalDeliveries": 40,
    "failedDeliveryRatePct": 17.5,
    "avgCallAttemptsPerDelivery": 3.4
  },
  "pilot": {
    "totalDeliveries": 52,
    "failedDeliveryRatePct": 3.8,
    "avgCallAttemptsPerDelivery": 0.5
  },
  "improvements": {
    "failedDeliveryRateReductionPct": 78.3,
    "callAttemptsReductionPct": 85.3,
    "avgMinutesSavedPerDelivery": 19
  }
}
```
You can also view this visually in the Landmaka Dashboard at `http://localhost:3000` under the **Pilot Score** tab.
