# ISPConfig Tailwind Theme

The default theme, but with Tailwind CSS.

> [!WARNING]
> This is a start, and not a finished product. It's a work in progress.

## 🚀 Getting Started

1. Clone the repository

2. Install the dependencies

    ```bash
    npm install
    ```

3. Start the Tailwind CLI:

    ```bash
    npm run dev
    ```

4. For setting up ISPConfig, see:

    - [📚 The ISPConfig docs for Ubuntu/Debian instructions](https://www.ispconfig.org/documentation/)
    - [🤖 Our guide for setting up ISPConfig in WSL2](./docs/ispconfig-on-wsl-windows.md)

## 🔨 Configuring ISPConfig

Login to ISPConfig and go to `Tools` > `User Settings` > `Design`. Select the `tailwindone` theme and save the changes.

## 🔎 About ISPConfig themes

All template files inside ISPConfig should be copied to the `templates/` directory in this theme. From there we can modify the files to our liking. ISPConfig will override the default templates with the ones in our theme.
