# 🎨 ISPConfig Tailwind Theme #1

Starting point for creating a custom theme for ISPConfig, using Tailwind CSS. The provided theme closely resembles the default ISPConfig theme, but with a few changes to the layout and styles.

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

In order to get better IDE support when working with ISPConfig's `tpl` files, we created a Liquid-like templating language we call `Liquidish`. It is somewhat like [Liquid](https://shopify.github.io/liquid/), but with a few differences.

When building the theme, it is compiled to `.tpl.htm` files for ISPConfig.

- **[💧 Read more about Liquidish in it's docs](https://github.com/luttje/liquidish)**
- **[📚 Or check out how to migrate an ISPConfig template to Liquidish](./docs/migrate-ispconfig-tpl-to-liquidish.md)**
