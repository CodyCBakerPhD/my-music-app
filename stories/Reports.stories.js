import { classifyFiles } from "../src/generator";
import { getLibrary } from "../src/library";
import { renderFolderCheck, renderResult } from "../src/ui";

export default {
    title: "Music/Build Reports",
};

/** The build panel's report areas, filled with fixed results. */
function reports(theme, fill) {
    return {
        render: () => {
            document.documentElement.setAttribute("data-theme", theme);
            const container = document.createElement("div");
            container.className = "panel prose";
            container.style.margin = "1rem";
            container.innerHTML = '<div id="folder_check" hidden></div><div id="build_result"></div>';
            queueMicrotask(() => {
                fill();
                for (const details of container.querySelectorAll("details")) details.open = true;
            });
            return container;
        },
    };
}

const layout = classifyFiles(
    ["Wide Awake", "Dark, Twisted and Cruel", "Stray track"].map((name) => ({
        path: `music/source/${name}.mp3`,
        file: new Blob(),
    }))
);

const problems = {
    converted: ["Dark, Twisted and Cruel", "Stray track"],
    copied: ["Wide Awake"],
    errors: [{ song: "Broken", message: "EncodingError: Unable to decode audio data" }],
    playlistsWritten: ["Workout"],
    playlistsIncomplete: new Map([["Alan Wake", ["The Poet and the Muse", "Follow You Into The Dark"]]]),
    countMismatch: { pre: 4, post: 3 },
};

const success = {
    converted: ["Dark, Twisted and Cruel"],
    copied: ["Wide Awake"],
    errors: [],
    playlistsWritten: ["Alan Wake", "Workout"],
    playlistsIncomplete: new Map(),
    countMismatch: null,
};

export const FolderCheckDark = reports("dark", () => renderFolderCheck(layout, getLibrary()));
export const FolderCheckLight = reports("light", () => renderFolderCheck(layout, getLibrary()));
export const SuccessDark = reports("dark", () => renderResult(success));
export const SuccessLight = reports("light", () => renderResult(success));
export const ProblemsDark = reports("dark", () => renderResult(problems));
export const ProblemsLight = reports("light", () => renderResult(problems));
