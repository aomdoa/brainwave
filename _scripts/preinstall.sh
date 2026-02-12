#!/bin/bash

# Check for required binaries
if [ ! -x "/usr/bin/node" ]; then
    echo "Required binary /usr/bin/node not found or not executable"
    exit 1
fi
if [ ! -x "/usr/bin/npx" ]; then
    echo "Required binary /usr/bin/npx not found or not executable"
    exit 1
fi


if ! getent group brainwave >/dev/null; then
    groupadd --system brainwave
fi

if ! id -u brainwave >/dev/null 2>&1; then
    useradd --system --gid brainwave --home-dir /opt/brainwave --shell /usr/sbin/nologin brainwave
fi
