const vscode = require('vscode');

function activate(context) {
    let disposable = vscode.commands.registerCommand('blackbox.openBillingPortal', function () {
        // Открыть портал оплаты Blackbox
        vscode.env.openExternal(vscode.Uri.parse('https://billing.blackbox.ai')); // Замените на реальный URL портала оплаты
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
