import rawHTML from "../src/index.html?raw";
import { initApp } from "../src/ui";

export default {
    title: "Music/Main Page",
};

/**
 * Full page HTML derived from index.html via ?raw import so it always stays in
 * sync with the source.  The inline theme script in <head> never runs here, so
 * each story sets the theme itself.
 */
const bodyMatch = rawHTML.match(/<body[^>]*>([\s\S]*)<\/body>/i);
const pageHTML = (bodyMatch ? bodyMatch[1] : "").replace(/<script[\s\S]*?<\/script>/gi, "");

function page(theme, hash) {
    return {
        render: () => {
            document.documentElement.setAttribute("data-theme", theme);
            const container = document.createElement("div");
            container.innerHTML = pageHTML;
            // Wait until Storybook has attached the container before wiring it up.
            queueMicrotask(() => {
                history.replaceState(null, "", `${location.pathname}${location.search}${hash}`);
                initApp(document);
                document.getElementById("version_info").textContent = "v0.0.0 (storybook)";
            });
            return container;
        },
    };
}

export const PlaylistsDark = page("dark", "#playlists/Alan%20Wake");
export const PlaylistsLight = page("light", "#playlists/Alan%20Wake");
export const SongsDark = page("dark", "#songs");
export const SongsLight = page("light", "#songs");
export const BuildDark = page("dark", "#build");
export const BuildLight = page("light", "#build");
