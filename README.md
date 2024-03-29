# 🎨 ISPConfig Tailwind Theme #1

Starting point for creating a custom theme for ISPConfig, using Tailwind CSS. The provided theme closely resembles the default ISPConfig theme, but with a few changes to the layout and styles.

> [!WARNING]
> This is a start, and not a finished product. It's a work in progress.

<div align="center">

[<img src="./docs/screenshot-1-light.png" alt="Screenshot of the theme in light mode"  width="200" />](./docs/screenshot-1-light.png)&nbsp;
[<img src="./docs/screenshot-1-dark.png" alt="Screenshot of the theme in dark mode"  width="200" />](./docs/screenshot-1-dark.png)&nbsp;<br>
[<img src="./docs/screenshot-2-light.png" alt="Screenshot of the theme in light mode"  width="200" />](./docs/screenshot-2-light.png)&nbsp;
[<img src="./docs/screenshot-2-dark.png" alt="Screenshot of the theme in dark mode"  width="200" />](./docs/screenshot-2-dark.png)&nbsp;

</div>

## 🚀 Getting Started

All the fun is in making a theme using this starting point. But if you just want to use the theme:

1. Download the latest release from the [releases page](https://github.com/luttje/ispconfig-tailwind-theme/releases).

2. Unzip the release and place it in the `themes/` directory of your ISPConfig installation.

* **To configure this theme for one user:**

    1. Login to ISPConfig and go to `Tools` > `User Settings` > `Design`.

    2. Select the `tailwindone` theme and save the changes.

* **To configure this theme for all users (including on the login screen):**

    1. Open the `config.inc.php` file in the `interface/lib` directory of your ISPConfig installation.

    2. Find the `$conf['theme']` setting and change it to `tailwindone`:

        ```php
        $conf['theme'] = 'tailwindone';
        ```

    3. Save the file.

    4. You should also change the `server/lib/server.inc.php` file to make the change update-safe. [(source)](https://forum.howtoforge.com/threads/themes-for-ispconfig.91148/#post-449548)

    > [!WARNING]
    > At the moment a workaround is necessary to style the login form:
    > https://forum.howtoforge.com/threads/override-login-form-from-theme.92018/

## 🔨 Making a theme

This repository is mainly a starting point for creating a custom theme for ISPConfig.

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

## 🔎 About ISPConfig themes

ISPConfig will override the default templates with the ones in our theme. We gathered all the `.htm` files from ISPConfig in the `src/templates/` directory. From there we can modify the files to our liking.

In order to get better IDE support when working with ISPConfig's `tpl` files, we created a Liquid-like templating language we call `Liquidish`. It is somewhat like [Liquid](https://shopify.github.io/liquid/), but with a few differences.

When building the theme, it is compiled to `.tpl.htm` files for ISPConfig.

- **[💧 Read more about Liquidish in it's docs](https://github.com/luttje/liquidish)**
- **[📚 Or check out how to migrate an ISPConfig template to Liquidish](./docs/migrate-ispconfig-tpl-to-liquidish.md)**
