# OneTap Time: A Minimalist Time Tracker

OneTap Time is a simple yet powerful web application for tracking your time and activities. With a clean, minimalist interface, it helps you stay focused and understand where your time goes. Built with Next.js, React, and ShadCN UI, it's designed for efficiency and ease of use.

<img width="935" height="654" alt="image" src="https://github.com/user-attachments/assets/5fc4661c-f17f-4153-8e49-248ce92e415f" />

## Key Features

- **Simple Timer:** Start and stop tracking with a single click. The timer displays the elapsed time in a clear, easy-to-read format.
- **Activity Naming:** Name your activities as you track them for clear record-keeping.
- **Customizable Categories:** Organize your activities into categories. Each category can have a unique name, color, and a wide selection of icons to choose from.
- **Detailed Activity Log:** View a chronological list of all your tracked activities. You can easily edit or delete entries directly from the log.
- **Today's Summary:** A visual summary of your day's activities, complete with a pie chart to show how your time was distributed across different categories.
- **Data Portability:** Export all your activities and categories to a JSON file for backup, or import them back into the app at any time.
- **Collapsible UI:** All sections except the main timer are collapsible, allowing you to maintain a clean and focused workspace.

## Data Persistence

Your data is automatically saved to your browser's local storage. This means all your activities, categories, and even a running timer are preserved between sessions. You can close your browser and come back later to find everything exactly as you left it.

## How to Use

1.  **Start Tracking:** Simply press the "Start Timer" button to begin a new activity.
2.  **Name Your Activity:** While the timer is running, you can enter a name for your activity in the input field.
3.  **Select a Category:** Choose a category from the dropdown menu.
4.  **Manage Categories:** Use the "Manage Categories" section to add, edit, or delete categories to suit your needs.
5.  **Stop Tracking:** When you're finished, click the "Stop Timer" button. The activity will be automatically saved to your log.
6.  **Review Your Day:** Expand the "Activity Log" to see past entries or "Today's Summary" to get a visual breakdown of your time.
7.  **Import/Export:** Use the "Data Management" card to save your data to a file or load it from a previous backup.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **UI Library:** [React](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Components:** [ShadCN UI](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You'll need to have Node.js and npm installed on your machine.
- [Node.js](https://nodejs.org/) (which includes npm)

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/your_username/your_repository.git
   ```
2. Navigate to the project directory
   ```sh
   cd your_repository
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Run the development server
   ```sh
   npm run dev
   ```
   Open [http://localhost:9002](http://localhost:9002) to view it in the browser.

## Project Structure

A brief overview of the key files and folders in this project:

- **`src/app/`**: Contains the core pages and layouts for the Next.js application, using the App Router.
- **`src/components/`**: Houses all the React components used to build the UI.
    - **`src/components/ui/`**: Contains the ShadCN UI components.
- **`src/context/`**: Holds the React Context for managing global application state (`app-context.tsx`).
- **`src/lib/`**: Includes utility functions (`utils.ts`), type definitions (`types.ts`), and static data like categories and icons (`data.ts`).
- **`public/`**: Stores static assets like images and fonts.
- **`package.json`**: Lists the project's dependencies and scripts.

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
