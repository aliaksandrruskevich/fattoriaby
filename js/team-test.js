console.log("team-test.js loaded");

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOMContentLoaded fired in team-test.js");
    const teamGrid = document.getElementById("teamGrid");
    if (!teamGrid) {
        console.error("teamGrid element not found");
        return;
    }
    teamGrid.innerHTML = "<p>Test content loaded successfully.</p>";
});
