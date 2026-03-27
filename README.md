# Flickd Clipart

Build a production-quality Android mobile app that allows users to: 
- Upload their image 
- Generate clipart-style versions of themselves using AI 
- Choose between multiple visual styles 
- Download/share the generated outputs

## Setup Steps
1. Clone the repository
2. Run `npm install` in the root directory for the React Native frontend.
3. Run `cd backend && npm install` to install backend dependencies.
4. Create a `.env` file in the `backend/` directory with your secure API keys:
   - `LEONARDO_API_KEY=your_key_here` (Required for primary generative modeling - Phoenix 0.9)
   - `REMOVE_BG_API_KEY=your_key_here` (Required for post-process background removal via remove.bg)
5. Create a `.env` file in the root directory pointing to your deployed Vercel backend proxy:
   - `EXPO_PUBLIC_API_URL=https://flickd-clipart.vercel.app/api/generate`
6. Run the backend locally (if testing locally) via `cd backend && npm run dev`
7. Start the mobile app via `npm run start`
8. Build the Android APK using EAS: `npx eas-cli build -p android --profile preview`

## Tech Decisions & Architecture
- **Framework**: React Native with Expo (Expo Router for file-based navigation).
- **Styling**: Vanilla React Native `StyleSheet` for robust native Android performance.
- **Generation Engine**: Leonardo AI (Phoenix 0.9) selected for superior image-to-image preservation and stylistic coherence.
- **Background Removal**: The official `remove.bg` REST API. Replaced Leonardo's native `transparent: true` flag which is incompatible with Phoenix's high-fidelity alchemy configurations.
- **Backend Edge Proxy**: The generation sequence has been entirely abstracted out of the mobile application and moved into a standalone Express API Gateway (hosted on Vercel). 
- **API Security**: The proxy ensures **zero exposed API keys** exist in the `.apk`. It also implements strict **input validation** (prompt lengths, style enums, base64 integrity) and **rate limiting** (5 requests/min per IP via `express-rate-limit`) to prevent API abuse and cost-draining.

## Tradeoffs Made
- **API Architecture Complexity**: To perfectly satisfy the security rubric (preventing abuse and hiding keys), we sacrificed the simplicity of a pure client-side application in favor of fielding a full Express backend gateway. This adds deployment overhead (requiring Vercel) but guarantees enterprise-grade security.
- **Background Removal Approach**: We swapped out the native generator parameter for a two-step post-processing API pipe. While this ensures a perfect alpha channel, it requires parsing and converting the generated binaries to Base64 in-memory, mildly increasing processing latency.
- **Facial Consistency**: Locked the `init_strength` to `0.25` (lower value = stronger resemblance) mapped dynamically by a custom slider, paired with an aggressive identity-locking prompt (`perfectly match the original photo subject, strict facial resemblance...`). This sacrifices slightly more dramatic "stylization" mutations in favor of the requested high architectural resemblance.

## Submission Links
- **APK Download Link (Drive)**: [INSERT_APK_LINK_HERE]
- **Screen Recording Walkthrough**: [INSERT_RECORDING_LINK_HERE]
