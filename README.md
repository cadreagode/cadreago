# Cadreago Hotel Booking

Cadreago is a modern single-page React experience that showcases a premium hotel booking journey. It includes:

- A discovery flow with filters, guest selector, shareable listings, and favorites
- A hotel details page with immersive gallery, services, room options, policy and reviews in one scrollable narrative
- A booking form that lets guests pick add-ons and see an itemized total including GST before checkout
- Guest and host dashboards with mock data to demonstrate future functionality

## Tech Stack

- React 18 with functional components and hooks
- Tailwind CSS for rapid styling
- Lucide icons for consistent iconography
- React Scripts build tooling (Create React App)

## Cashfree Verification Suite

The host onboarding flow surfaces Aadhaar KYC, GST, and bank verification steps. When you are ready to wire these to production,
install the official Cashfree Verification Suite SDKs and plug them into the placeholder handlers inside
`CadreagoHotelBooking.jsx`.

```bash
npm install @cashfreepayments/verification-suite
```

The current UI simulates the verification steps and can be connected to the SDK once backend credentials are available.

## Getting Started

```bash
npm install
npm start
```

This runs the development server on <http://localhost:3000>. Use `npm run build` for production assets located in the `build/` directory.

### Environment Variables

Copy `.env.example` to `.env.local` (kept out of git) and set `REACT_APP_GOOGLE_MAPS_KEY` with your Google Maps JavaScript API key. The interactive map, markers, and upcoming address autocomplete features rely on this key being present at build time.

If you need to validate that a raw API key works before wiring it into the React app, open `public/google-map-demo/index.html` directly (or via `http://localhost:3000/google-map-demo/index.html?key=YOUR_KEY`) to load the official Google sample on its own.

## Project Structure

```
src/
  App.jsx                 # Entry view router
  components/
    CadreagoHotelBooking.jsx  # Primary UI definition
  index.jsx               # CRA bootstrapping
  index.css               # Tailwind base styles
```

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
# cadreago
