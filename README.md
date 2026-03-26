# Flickd Clipart

Build a production-quality Android mobile app that allows users to: 
- Upload their image 
- Generate clipart-style versions of themselves using AI 
- Choose between multiple visual styles 
- Download/share the generated outputs

## Setup Steps
1. Clone the repository
2. Run `npm install`
3. Rename `.env.example` to `.env` and configure your API keys:
   - `EXPO_PUBLIC_LEONARDO_API_KEY` (Required for primary generative modeling - Phoenix 0.9)
   - `EXPO_PUBLIC_BGREMOVE_API_KEY` (Required for post-process background removal via remove.bg)
4. Start the app via `npm run start` (or `npx expo start`)
5. Build the Android APK using EAS: `eas build -p android --profile preview`

## Tech Decisions & Architecture
- **Framework**: React Native with Expo (Expo Router for file-based navigation).
- **Styling**: Vanilla React Native `StyleSheet` for robust native Android performance.
- **Generation Engine**: Leonardo AI (Phoenix 0.9) selected for superior image-to-image preservation and stylistic coherence.
- **Background Removal**: The official `remove.bg` REST API. Replaced Leonardo's native `transparent: true` flag which is incompatible with Phoenix's high-fidelity alchemy configurations.
- **State Management**: React Context API (`ImageContext`) was utilized to elevate upload and batch generation states globally, allowing users to safely navigate away (e.g., to the Gallery) while the generation elegantly brews in the background.

## Tradeoffs Made
- **API Key Security**: The `EXPO_PUBLIC_...` keys are exposed structurally due to limitations and constraints in this frontend-only prototype deployment. In a real-world deployed scenario, the AI processing requests would be abstracted entirely behind a secure backend edge function (like Vercel or Supabase) to protect proprietary keys.
- **Background Removal Approach**: We swapped out the native generator parameter for a two-step post-processing API pipe. While this ensures a perfect alpha channel, it requires parsing and converting the generated binaries to Base64 in-memory, mildly increasing processing latency.
- **Facial Consistency**: Locked the `init_strength` to `0.25` (lower value = stronger resemblance) mapped dynamically by a custom slider, paired with an aggressive identity-locking prompt (`perfectly match the original photo subject, strict facial resemblance...`). This sacrifices slightly more dramatic "stylization" mutations in favor of the requested high architectural resemblance.

## Submission Links
- **APK Download Link (Drive)**: [INSERT_APK_LINK_HERE]
- **Screen Recording Walkthrough**: [INSERT_RECORDING_LINK_HERE]
