import {
    patch_CombatTracker_getEntryContextOptions,
    patch_CombatTracker_activateListeners,
} from "./scripts/patches.js";
import { handlePreUpdateCombat, handleUpdateCombat } from "./scripts/handleUpdateCombat.js";
import CONST from "./scripts/const.js";
import CombatAlertsApplication from "./apps/CombatAlertsApplication.js";
import TurnAlert from "./scripts/TurnAlert.js";
import TurnAlertConfig from "./apps/TurnAlertConfig.js";

Hooks.on("init", () => {
    globalThis.TurnAlert = TurnAlert;
    globalThis.TurnAlertConfig = TurnAlertConfig;

    patch_CombatTracker_activateListeners();
    patch_CombatTracker_getEntryContextOptions();

    game.socket.on(`module.${CONST.moduleName}`, async (payload) => {
        const firstGm = game.users.find((u) => u.isGM && u.active);
        switch (payload.type) {
            case "createAlert":
                if (!firstGm || game.user !== firstGm) break;
                await TurnAlert.create(payload.alertData);
                break;
            case "updateAlert":
                if (!firstGm || game.user !== firstGm) break;
                await TurnAlert.update(payload.alertData);
                break;
            case "deleteAlert":
                if (!firstGm || game.user !== firstGm) break;
                await TurnAlert.delete(payload.combatId, payload.alertId);
                break;
            default:
                throw new Error(
                    `Turn Alert | Unknown socket payload type: ${payload.type} | payload contents:\n${JSON.stringify(
                        payload
                    )}`
                );
                break;
        }
    });
});

Hooks.on("preUpdateCombat", handlePreUpdateCombat);
Hooks.on("updateCombat", handleUpdateCombat);

Hooks.on("renderCombatTracker", (tracker, html, data) => {
    console.log("turnAlert | Rendering Combat Tracker...");
    if (!data.combat?.round) return;

    let i = 1;
    console.log(`turnAlert | Step ${i}`);
    i++;
    const alertButton = $(document.createElement("a"));
    
    console.log(`turnAlert | Step ${i}`);
    i++;
    alertButton.addClass(["combat-control", "combat-alerts"]);

    console.log(`turnAlert | Step ${i}`);
    i++;
    alertButton.attr("title", game.i18n.localize(`${CONST.moduleName}.APP.CombatAlertsTitle`));

    console.log(`turnAlert | Step ${i}`);
    i++;
    alertButton.html('<i class="fas fa-bell"></i>');

    console.log(`turnAlert | Step ${i}`);
    i++;
    alertButton.click((event) => {
        const combatId = data.combat.id;
        const app = new CombatAlertsApplication({ combatId });
        app.render(true);
    });

    console.log(`turnAlert | Step ${i}`);
    i++;
    html.find(".combat-tracker-header .encounter-controls .encounter-title").after(alertButton);

    console.log("turnAlert | Completed Rendering...");
    console.log(html);
    console.log(alertButton);
    console.log(html.find(".combat-tracker-header .encounter-controls .encounter-title"));
});

Hooks.on("renderActorDirectory", (_, html) => {
    console.log("turnAlert | Testing something...");
    console.log(html);
    console.log(html.find(".directory-header .action-buttons"));
});