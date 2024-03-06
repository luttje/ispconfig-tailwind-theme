# ISPConfig on WSL2

## Prepare a 20.04 Ubuntu distro in WSL

- `wsl --install --distribution Ubuntu-20.04`

## Enable systemd support

[(Source)](https://forum.howtoforge.com/threads/install-ispconfig-3-2-5-on-ubuntu-20-04-in-wsl.87353/)

This is needed, or on WSL the MySQL password generation will fail, following by an error when setting the system PHP version.

- `wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb`

- `sudo dpkg -i packages-microsoft-prod.deb`

- `rm packages-microsoft-prod.deb`

- `apt-get update`

- `apt-get install -y apt-transport-https`

- `apt-get install -y dotnet-sdk-5.0`

- `wget -O /etc/apt/trusted.gpg.d/wsl-transdebian.gpg https://arkane-systems.github.io/wsl-transdebian/apt/wsl-transdebian.gpg`

- `chmod a+r /etc/apt/trusted.gpg.d/wsl-transdebian.gpg`

- Add wsl-transdebian sources:

  ```bash
  cat << EOF > /etc/apt/sources.list.d/wsl-transdebian.list
  deb https://arkane-systems.github.io/wsl-transdebian/apt/ $(lsb_release -cs) main
  deb-src https://arkane-systems.github.io/wsl-transdebian/apt/ $(lsb_release -cs) main
  EOF
  ```

- `apt update`

- `apt install -y systemd-genie`

The final step is to automatically start genie on every shell session:

- `nano ~/.profile`

- Add these lines:

  ```bash
  # Are we in the bottle?
  if [[ ! -v INSIDE_GENIE ]]; then
    read -t 3 -p "yn? * Preparing to enter genie bottle (in 3s); abort? " yn
    echo

    if [[ $yn != "y" ]]; then
      echo "Starting genie:"
      exec /usr/bin/genie -s
    fi
  fi
  ```

- `exit` WSL

## Setup the hostname in the distro

- `wsl -u root --distribution Ubuntu-20.04`

- Wait 3 seconds for it to start the genie. 

- Let it load systemd.

- `nano /etc/wsl.conf` and add:

  ```ini
  [network]
  hostname="ispconfig.test"
  generateResolvConf = false
  ```

- `exit` WSL

- `wsl --shutdown`

## Fix name resolution in the distro

- `wsl -u root --distribution Ubuntu-20.04`

- `rm /etc/resolv.conf`

- `nano /etc/resolv.conf` and add:

  ```ini
  nameserver 1.1.1.1
  ```

- `exit` WSL

- `wsl --shutdown`

## Setup ISPConfig in the distro

You can also specify whether to use nginx and which php versions to install.

- `wsl -u root --distribution Ubuntu-20.04`

- `wget -O - https://get.ispconfig.org | sh -s -- --use-nginx --use-php=7.4,8.0,8.1,8.2 --use-ftp-ports=40110-40210 --lang=en --no-quota --unattended-upgrades`

- type `yes` to confirm installation

- Save the passwords, e.g:

  ```bash
  [INFO] Your Mailman password is: 72UXTnJFLK7K
  [INFO] Your ISPConfig admin password is: fUnAMJFKG8qsgVt
  [INFO] Your MySQL root password is: bsMJVPTmD73ozss3KJYJ
  ```

Restart for good measure:

- `exit` WSL

- `wsl --shutdown`

- `wsl -u root --distribution Ubuntu-20.04`

## Access the ISPConfig admin panel

- Go to [https://localhost:8080](https://localhost:8080)

- Login with username `admin` and the ISPConfig admin password above.

## Accessing the source code

If you want to theme ISPConfig, we'll set up a symlink to a theme project on your Windows machine. This allows you to use all your existing tools and workflows.

- `wsl -u root --distribution Ubuntu-20.04`

- `cd /usr/local/ispconfig/`

- In order to be able to access `interface/` give access to all users: `sudo chmod -R a+rwx interface` (recursively gives read, write and execute permissions to all users)

- Use `ln -s {target} {link}`, e.g:

  `ln -s /mnt/e/Projects/_Personal/Web/tailwindone /usr/local/ispconfig/interface/web/themes/tailwindone`
