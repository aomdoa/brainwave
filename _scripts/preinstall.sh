#!/bin/bash
if ! getent group brainwave >/dev/null; then
    groupadd --system brainwave
fi

if ! id -u brainwave >/dev/null 2>&1; then
    useradd --system --gid brainwave --home-dir /opt/brainwave --shell /usr/sbin/nologin brainwave
fi
