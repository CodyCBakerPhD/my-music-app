# Upcoming

- Stopped `chromatic-publish.yml` from checking out the commit it uploads, which may come from a fork while the Chromatic tokens are in reach, and pinned the Chromatic builds' runner image so that an image bump does not shift snapshot pixels. ([#10](https://github.com/CodyCBakerPhD/my-music-app/pull/10))
- Disabled Dependabot rebases, which force-push and so fail on protected branches. ([#8](https://github.com/CodyCBakerPhD/my-music-app/pull/8))

# v1.0.0

- Initial release: a static page on GitHub Pages to browse songs and generated playlists, download any playlist as `.m3u`, and build a VLC-ready folder in the browser.
