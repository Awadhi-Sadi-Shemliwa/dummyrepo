# PhysioConnect Tanzania

A digital health platform for connecting patients with physiotherapists.

## Features

- **Physiotherapist Dashboard**: Manage appointments, patients, and exercises.
- **Patient Portal**: View assigned exercises, upcoming appointments, and progress.
- **Offline Support**: Works offline with data synchronization when the connection is restored.
- **Responsive Design**: fully optimized for desktop, tablet, and mobile devices.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Vanilla CSS with CSS Variables for theming (shadcn/ui inspired)
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/physioconnect.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd physioconnect
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Development

Start the development server:

```bash
npm run dev
```

### Build

Build for production:

```bash
npm run build
```

## Project Structure

- `/src`
    - `/components`: Reusable UI components
    - `/context`: React Context providers (Auth, etc.)
    - `/hooks`: Custom React hooks
    - `/pages`: Route components
    - `/services`: API and other services
    - `/types`: TypeScript type definitions
- `/public`: Static assets

## License

[MIT](LICENSE)
