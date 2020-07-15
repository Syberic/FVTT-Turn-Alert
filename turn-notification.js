import TurnNotificationManager from "./scripts/TurnNotificationManager.js";
import CONST from "./scripts/const.js";
import TurnNotification from "./scripts/TurnNotification.js";

Hooks.on("init", () => {
    game.TurnNotificationManager = TurnNotificationManager;
});

Hooks.on("updateCombat", async (combat, changed, diff, userId) => {
    if (!("round" in changed || "turn" in changed)) {
        await savePreviousTurn(combat);
        return;
    }

    const notifications = combat.getFlag(CONST.moduleName, "notifications");

    const turn = combat.turns[combat.data.turn]._id;
    const round = combat.data.round;
    const prev = combat.getFlag(CONST.moduleName, "previousTurn");
    const prevRound = prev.prevRound || 0;
    const prevTurn = combat.turns[prev.prevTurn || 0]._id;

    let anyDeleted = false;
    for (let id in notifications) {
        const notification = notifications[id];
        if (game.userId !== notification.user) continue;

        const triggerRound = notification.endOfTurn ? prevRound : round;
        const triggerTurn = notification.endOfTurn ? prevTurn : turn;
        if (TurnNotification.checkTrigger(notification, triggerRound, round !== prevRound, triggerTurn)) {
            if (notification.message) {
                const messageData = {
                    speaker: { alias: "Turn Notification" },
                    content: notification.message
                };
                ChatMessage.create(messageData);
            }

            if (!notification.repeating) {
                delete notifications[id];
                anyDeleted = true;
            }
        }
    }

    if (anyDeleted) await combat.setFlag(CONST.moduleName, "notifications", notifications);
    await savePreviousTurn(combat);
});

function savePreviousTurn(combat) {
    const previousTurn = {
        prevRound: combat.data.round,
        prevTurn: combat.data.turn
    }

    return combat.setFlag(CONST.moduleName, "previousTurn", previousTurn);
}