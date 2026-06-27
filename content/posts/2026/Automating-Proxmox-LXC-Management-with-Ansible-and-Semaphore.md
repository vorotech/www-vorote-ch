---
title: "Automating Proxmox LXC Management with Ansible and Semaphore"
author: content/authors/Dmytro.md
date: 2026-03-03T08:45:04.000Z
tags:
  - tag: content/tags/Ansible.mdx
---

Provisioning a Proxmox LXC container for automation requires a secure and reliable connection path. This guide covers the end-to-end setup of a dedicated automation user, centralized SSH key management within Semaphore, and target configuration.

## Prerequisites

- Proxmox VE cluster
- [Semaphore UI](https://semaphoreui.com/) (could be installed as [LXC container](https://community-scripts.github.io/ProxmoxVE/scripts?id=semaphore))
- Target Proxmox LXC container (Debian/Ubuntu or Alpine)

## 1. Generating SSH Key

Relying on a local key file on the controller filesystem defeats the purpose of Semaphore’s built-in Key Management. The best practice is to generate a key pair locally and store the private key securely within the Semaphore database, keeping it entirely decoupled from the host OS.

### Key Generation

You can generate a high-entropy SSH key pair on your local workstation. Use the Ed25519 algorithm for superior security and performance:

```bash
ssh-keygen -t ed25519 -C "ansible" -f ./ansible_ed25519
```

### Adding to Semaphore Key Store

Instead of placing the private key on the filesystem of the Semaphore host, inject it directly into the Semaphore UI:

1. Navigate to **Key Store** in your Semaphore project.
2. Click **New Key**.
3. Name it appropriately (e.g., `proxmox_ansible_key`).
4. Set the Type to **SSH Key**.
5. Paste the entire contents of the `./ansible_ed25519` private key file into the Private Key field.
6. Save the key. Semaphore encrypts and manages this key internally.

![](/uploads/posts/Automating-Proxmox-LXC-Management-with-Ansible-and-Semaphore/1.png)

## 2. Bootstrapping the LXC Target

Since SSH is often disabled by default in LXC templates, use the Proxmox host shell to perform the initial configuration.

### Access the Container

On your Proxmox host, enter the container's shell:

```bash
pct enter [CT_ID]
```

### Install Required Services

Ensure the OpenSSH server and sudo utility are present:

```bash
# For Debian/Ubuntu
apt update && apt install -y openssh-server sudo

# For Alpine
apk add openssh sudo
rc-update add sshd
/etc/init.d/sshd start
```

### Create the Dedicated 'ansible' User

```bash
# Create user without a password (key-based login only)
adduser -disabled-password -gecos "" ansible

# Configure SSH directory
mkdir -p /home/ansible/.ssh
chmod 700 /home/ansible/.ssh
touch /home/ansible/.ssh/authorized_keys
chmod 600 /home/ansible/.ssh/authorized_keys
chown -R ansible:ansible /home/ansible/.ssh
```

### Authorize the ansible public key

Append the public key (`ansible_ed25519.pub`) generated in Step 1 to the `/home/ansible/.ssh/authorized_keys` file.

```bash
sudo tee /home/ansible/.ssh/authorized_keys << 'EOF'
<paste-public-key-here>
EOF
```

### Test the SSH connection

```bash
ssh -i ./ansible_ed25519 ansible@<target-host>
```

Connection should be established without a password.

Typical LXC container output:

```bash
Debian LXC Container
    🌐   Provided by: community-scripts ORG | GitHub: https://github.com/community-scripts/ProxmoxVE
    🖥️   OS: Debian GNU/Linux - Version: 13
    🏠   Hostname: gluetun
    💡   IP Address: 192.168.20.175
```

### Verify sudo access

```bash
ssh -i ./ansible_ed25519 ansible@<target-host> "sudo -n true && echo 'Sudo access OK'"
```

But this time, it should fail:

```bash
sudo: a password is required
```

This is expected behavior, as the ansible user by default is configured to require a password for sudo access.

Let's fix this by editing the sudoers file.

## 3. Configuring Privilege Escalation (Sudoers)

While it is common to use `NOPASSWD:ALL`, this grants the automation user total control over the system. If your Semaphore instance is compromised, the attacker gains root access to all managed containers.

### The Security-First Approach

Instead of full access, restrict the user to specific commands required for configuration and maintenance.

> **Security Note:** Using `ansible ALL=(ALL) NOPASSWD:ALL` is not recommended for production environments. It is much safer to whitelist only the necessary binaries.

If you strictly require full automation flexibility or just want to test the setup,
use the following:

```bash
echo "ansible ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/ansible
chmod 0440 /etc/sudoers.d/ansible
```

<details>
<summary>Example: Restricted Sudoers Configuration</summary>

Create a dedicated file at `/etc/sudoers.d/ansible`:

```text
ansible ALL=(ALL) NOPASSWD: /usr/bin/apt, /usr/bin/apt-get, /usr/bin/systemctl, /usr/bin/cp, /bin/chown, /bin/chmod
```

</details>

Verify sudo access again:

```bash
ssh -i ./ansible_ed25519 ansible@<target-host> "sudo -n true && echo 'Sudo access OK'"
```

This time, it should succeed:

```bash
Sudo access OK
```

## 4. Integrating with Semaphore UI

With the private key in the Key Store and the public key in the LXC, configure the Semaphore interface to run your playbooks.

### Inventory

1. Create a new **Inventory**.
2. Name `ansible` and Use Credentials `proxmox_ansible_key` created earlier to authenticate.
3. Add your LXC container's IP address or hostname to the `hosts` object.

![](/uploads/posts/Automating-Proxmox-LXC-Management-with-Ansible-and-Semaphore/2.png)
