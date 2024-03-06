# 🎨 ISPConfig Tailwind Theme

The default theme, but with Tailwind CSS. This is meant to be a starting point for creating a custom theme for ISPConfig, using Tailwind CSS.

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

4. Symlink the `dist/` directory into ISPConfig's `themes/` directory:

    ```bash
    ln -s /path/to/ispconfig-tailwind/dist/ /usr/local/ispconfig/interface/web/themes/tailwindone
    ```

5. For setting up ISPConfig, see:

    - [📚 The ISPConfig docs for Ubuntu/Debian instructions](https://www.ispconfig.org/documentation/)
    - [🤖 Our guide for setting up ISPConfig in WSL2](./docs/ispconfig-on-wsl-windows.md)

## 🔨 Configuring ISPConfig

Login to ISPConfig and go to `Tools` > `User Settings` > `Design`. Select the `tailwindone` theme and save the changes.

## 🔎 About ISPConfig themes

ISPConfig will override the default templates with the ones in our theme. We gathered all the `.htm` files from ISPConfig in the `src/templates/` directory. From there we can modify the files to our liking.

Furthermore, because the `.tpl` template isn't very friendly for our IDEs, we use a Liquid-like templating language we call `Liquidish`.

**[📚 Read more about Liquidish in our docs](./docs/liquidish.md)**
